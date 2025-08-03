const express = require('express');
const router = express.Router();
const countryDetector = require('../utils/countryDetection');
const currencyService = require('../utils/currencyService');
const countryConfig = require('../config/countryConfig');
const { getCookie, setCookie } = require('../utils/cookieHelper');
const cache = require('../utils/cache');

// /**
//  * @api {get} /country Get detected country
//  * @apiName GetCountry
//  * @apiGroup Country
//  * @apiDescription Returns the detected country based on IP or existing preference
//  */
router.get('/', async (req, res) => {
  try {
    const cacheKey = `country-${req.ip}`;
    
    // Try cache first
    const cachedCountry = cache.get(cacheKey);
    if (cachedCountry) {
      return res.json(cachedCountry);
    }

    // Get from detector
    const detectedCountryCode = await countryDetector.getClientCountry(req);
    
    // Validate against supported countries
    const country = countryConfig.supportedCountries.find(
      c => c.code === detectedCountryCode
    ) || countryConfig.supportedCountries.find(
      c => c.code === countryConfig.defaultCountry
    );

    // Cache for 24 hours
    cache.set(cacheKey, country, 86400);
    
    res.json(country);
  } catch (error) {
    console.error('Country detection failed:', error);
    const defaultCountry = countryConfig.supportedCountries.find(
      c => c.code === countryConfig.defaultCountry
    );
    res.json(defaultCountry);
  }
});

// /**
//  * @api {post} /country Set country preference
//  * @apiName SetCountry
//  * @apiGroup Country
//  * @apiParam {String} countryCode ISO 2-letter country code
//  */
router.post('/', async (req, res) => {
  try {
    const { countryCode } = req.body;
    
    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    const country = countryConfig.supportedCountries.find(
      c => c.code === countryCode.toUpperCase()
    );

    if (!country) {
      return res.status(400).json({ 
        error: 'Unsupported country',
        supportedCountries: countryConfig.supportedCountries.map(c => c.code)
      });
    }

    // Set cookie with 30 day expiration
    setCookie(res, 'country', country.code, { 
      maxAge: 30 * 24 * 60 * 60 * 1000 
    });

    // Update currency rates in background
    currencyService.getExchangeRates().catch(console.error);

    res.json(country);
  } catch (error) {
    console.error('Failed to set country:', error);
    res.status(500).json({ error: 'Failed to set country preference' });
  }
});

// /**
//  * @api {get} /countries List supported countries
//  * @apiName ListCountries
//  * @apiGroup Country
//  */
router.get('/list', (req, res) => {
  try {
    // Return minimal info for client
    const countries = countryConfig.supportedCountries.map(c => ({
      code: c.code,
      name: c.name,
      currency: c.currency,
      symbol: c.symbol,
      flag: `/flags/${c.code.toLowerCase()}.svg`
    }));
    
    res.json(countries);
  } catch (error) {
    console.error('Failed to list countries:', error);
    res.status(500).json({ error: 'Failed to get country list' });
  }
});

// /**
//  * @api {get} /prices/convert Convert price
//  * @apiName ConvertPrice
//  * @apiGroup Price
//  * @apiParam {Number} priceInr Price in INR
//  * @apiParam {String} [countryCode] Override country code
//  */
router.get('/convert', async (req, res) => {
  try {
    const { priceInr, countryCode, priceType } = req.query;
    
    if (!priceInr || isNaN(priceInr)) {
      return res.status(400).json({ error: 'Invalid priceInr parameter' });
    }

    const price = await currencyService.getLocalizedPrice(
      { 
        basePrice: parseFloat(priceInr),
        priceType: priceType || 'product'
      },
      countryCode || req.country.code,
      { 
        applyPsychologicalPricing: priceType !== 'sum' 
      }
    );
    
    res.json(price);
  } catch (error) {
    console.error('Price conversion error:', error);
    res.status(500).json({ 
      error: 'Failed to convert price',
      details: error.message
    });
  }
});

/**
 * @api {post} /api/prices/convert/cart Convert Cart Prices
 * @apiName ConvertCartPrices
 * @apiGroup Price
 * @apiParam {Array} items Cart items
 * @apiParam {Number} shippingFee Shipping fee in INR
 * @apiParam {Number} taxAmount Tax amount in INR
 * @apiParam {String} countryCode Target country code
 */
router.post('/convert/cart', async (req, res) => {
  try {
    const { items, shippingFee, taxAmount, countryCode } = req.body;
    
    // Convert all items in parallel
    const convertedItems = await Promise.all(
      items.map(item => 
        currencyService.getLocalizedPrice(
          {
            basePrice: item.priceInr,
            priceType: 'product'
          },
          countryCode
        )
      )
    );

    // Convert shipping and tax (without psychological pricing)
    const [convertedShipping, convertedTax] = await Promise.all([
      currencyService.getLocalizedPrice(
        {
          basePrice: shippingFee || 0,
          priceType: 'sum'
        },
        countryCode
      ),
      currencyService.getLocalizedPrice(
        {
          basePrice: taxAmount || 0,
          priceType: 'sum'
        },
        countryCode
      )
    ]);

    // Calculate totals
    const subtotal = convertedItems.reduce((sum, item, index) => {
      return sum + (item.value * (items[index].quantity || 1));
    }, 0);

    res.json({
      items: convertedItems,
      subtotal,
      shipping: convertedShipping.value,
      total: subtotal + convertedShipping.value + convertedTax.value,
      currency: convertedShipping.currency
    });

  } catch (error) {
    console.error('Cart conversion failed:', error);
    res.status(500).json({ 
      error: 'Failed to convert cart prices',
      details: error.message 
    });
  }
});

module.exports = router;

router.post('/convert/batch', async (req, res) => {
  try {
    const { prices, countryCode } = req.body;
    
    const convertedPrices = await Promise.all(
      prices.map(item => 
        currencyService.getLocalizedPrice(
          { 
            basePrice: parseFloat(item.priceInr),
            priceType: item.priceType || 'product'
          },
          countryCode || req.country.code,
          {
            applyPsychologicalPricing: item.priceType !== 'sum'
          }
        )
      )
    );
    
    res.json({ prices: convertedPrices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// /**
//  * @api {get} /country/guess Guess country from IP
//  * @apiName GuessCountry
//  * @apiGroup Country
//  * @apiDescription Force fresh country detection from IP
//  */
router.get('/guess', async (req, res) => {
  try {
    // Force fresh detection (skip cookie)
    const detectedCountryCode = await countryDetector.getClientCountry(req);
    
    const country = countryConfig.supportedCountries.find(
      c => c.code === detectedCountryCode
    ) || countryConfig.supportedCountries.find(
      c => c.code === countryConfig.defaultCountry
    );

    res.json(country);
  } catch (error) {
    console.error('Country guess failed:', error);
    const defaultCountry = countryConfig.supportedCountries.find(
      c => c.code === countryConfig.defaultCountry
    );
    res.json(defaultCountry);
  }
});

module.exports = router;