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
      console.log('Falling back to secondary API');
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

  async getLocalizedPrice(product, countryCode) {
    const country = countryConfig.supportedCountries.find(c => c.code === countryCode);
    if (!country) throw new Error(`Unsupported country: ${countryCode}`);

    // Apply country-specific multiplier first
    const multipliedPrice = product.basePrice * country.priceMultiplier;
    
    // Then convert to local currency
    const localPrice = await this.convertPrice(multipliedPrice, country.currency);
    
    return {
      value: localPrice,
      formatted: `${country.symbol}${localPrice.toFixed(2)}`,
      currency: country.currency,
      originalPrice: product.basePrice // Store original for reference
    };
  }
}

module.exports = new CurrencyService();