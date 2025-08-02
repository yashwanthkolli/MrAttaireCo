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