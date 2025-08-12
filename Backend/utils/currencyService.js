const axios = require('axios');
const  countryConfig = require('../config/countryConfig');
const NodeCache = require('node-cache');

// Cache exchange rates for 6 hours (free APIs usually update daily)
const ratesCache = new NodeCache({ stdTTL: 21600 });

class CurrencyService {
  constructor() {
    this.exchangeApiUrl = 'https://api.exchangerate.host/latest?base=INR';
    this.backupApiUrl = 'https://open.er-api.com/v6/latest/INR';
  }

  async fetchWithFallback() {
    try {
      // Try primary API
      const response = await axios.get(this.exchangeApiUrl);
      if (response.data && response.data.rates) {
        return response.data.rates;
      }
      throw new Error('Invalid response from primary API');
    } catch (primaryError) {
      try {
        // Try backup API
        const backupResponse = await axios.get(this.backupApiUrl);
        if (backupResponse.data && backupResponse.data.rates) {
          return backupResponse.data.rates;
        }
        throw new Error('Invalid response from backup API');
      } catch (backupError) {
        console.error('All exchange rate APIs failed:', backupError);
        // Return cached rates if available
        const cachedRates = ratesCache.get('latestRates');
        if (cachedRates) return cachedRates;
        throw new Error('No exchange rates available');
      }
    }
  }


  async getExchangeRates() {
    // Check cache first
    const cachedRates = ratesCache.get('latestRates');
    if (cachedRates) return cachedRates;

    // Fetch fresh rates
    const rates = await this.fetchWithFallback();
    
    // Cache the new rates
    ratesCache.set('latestRates', rates);
    
    return rates;
  }

  async convertPrice(priceInr, targetCurrency) {
    const rates = await this.getExchangeRates();
    const rate = rates[targetCurrency];
    if (!rate) throw new Error(`Unsupported currency: ${targetCurrency}`);
    
    return priceInr * rate;
  }

  async getLocalizedPrice(product, countryCode, options = {}) {
    const { applyPsychologicalPricing = true } = options;
    const country = countryConfig.supportedCountries.find(c => c.code === countryCode);
    if (!country) throw new Error(`Unsupported country: ${countryCode}`);

    // Apply country-specific multiplier first
    const multipliedPrice = product.basePrice * country.priceMultiplier;
    
    // Then convert to local currency
    let localPrice = await this.convertPrice(multipliedPrice, country.currency);
    
    // Apply psychological pricing for non-INR currencies
    if (applyPsychologicalPricing && country.currency !== 'INR') {
      localPrice = this.applyPsychologicalPricing(localPrice);
    }

    return {
      value: localPrice,
      formatted: this.formatPrice(localPrice, country),
      currency: country.currency,
      originalPrice: product.basePrice,
      multiplier: country.priceMultiplier
    };
  }

  applyPsychologicalPricing(price) {
    // Round to nearest 4.99 or 9.99 pattern
    const floor = Math.floor(price);
    const remainder = price - floor;
    
    // Determine whether to use 4.99 or 9.99 pattern
    const base = remainder < 0.5 ? 4.99 : 9.99;
    
    // Get the nearest whole number below the price
    const wholeNumber = remainder < 0.5 ? floor : floor + 1;
    
    // Handle cases where we might go below 0
    const adjustedWhole = wholeNumber < 1 ? 1 : wholeNumber;
    
    return adjustedWhole - 0.01; // Results in x.99
  }

  formatPrice(price, country) {
    // Format according to locale
    return new Intl.NumberFormat(country.locale || 'en-IN', {
      style: 'currency',
      currency: country.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }
}

module.exports = new CurrencyService();