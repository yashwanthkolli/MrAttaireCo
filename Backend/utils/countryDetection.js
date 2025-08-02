const axios = require('axios');
const { cache } = require('../utils/cache');
const countryConfig = require('../config/countryConfig');

class CountryDetector {
  constructor() {
    this.ipApiUrl = 'http://ip-api.com/json/';
    this.fallbackApiUrl = 'https://ipapi.co/json/';
  }

  async detectCountryByIp(ip) {
    const cacheKey = `ip-country:${ip}`;
    
    try {
      // Check cache first
      const cachedCountry = cache.get(cacheKey);
      if (cachedCountry) return cachedCountry;

      // Try primary API
      const response = await axios.get(`${this.ipApiUrl}${ip}?fields=status,message,countryCode`);
      
      if (response.data.status === 'success') {
        const countryCode = response.data.countryCode;
        cache.set(cacheKey, countryCode, 86400);
        return countryCode;
      }

      // Fallback to ipapi.co if primary fails
      const fallbackResponse = await axios.get(`${this.fallbackApiUrl}`);
      if (fallbackResponse.data && fallbackResponse.data.country) {
        const countryCode = fallbackResponse.data.country;
        cache.set(cacheKey, countryCode, 86400);
        return countryCode;
      }

      throw new Error('All IP detection APIs failed');
    } catch (error) {
      console.error('Country detection failed:', error);
      return null;
    }
  }

  async getClientCountry(req) {
    try {
      console.log(req.ip)
      let ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress;
      
      if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
      }

      console.log(ip)

      // For localhost/testing, use the IP detection APIs directly
      if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        const response = await axios.get('https://ipapi.co/json/');
        return response.data.country;
      }

      return await this.detectCountryByIp(ip);
    } catch (error) {
      console.error('Failed to get client country:', error);
      return null;
    }
  }
}

module.exports = new CountryDetector();