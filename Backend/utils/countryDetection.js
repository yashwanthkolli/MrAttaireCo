const axios = require('axios');
// const publicIp = require('public-ip');
// const { publicIpv4 } = publicIp;
const { cache } = require('../utils/cache');
const countryConfig = require('../config/countryConfig');

class CountryDetector {
  constructor() {
    this.ipApiUrl = 'http://ip-api.com/json/';
  }

  async getPublicIp() {
    try {
      const publicIp = await import('public-ip');
      return publicIp.publicIpv4();
    } catch (error) {
      console.error('Failed to get public IP:', error);
      return null;
    }
  }

  async detectCountryByIp(ip) {
    const cacheKey = `ip-country:${ip}`;
    
    try {
      // Check cache first
      const cachedCountry = cache.get(cacheKey);
      if (cachedCountry) return cachedCountry;

      // Free tier of ip-api allows 45 requests per minute
      const response = await axios.get(`${this.ipApiUrl}${ip}?fields=status,message,countryCode`);
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'IP API error');
      }

      const countryCode = response.data.countryCode;
      
      // Cache the result for 24 hours
      cache.set(cacheKey, countryCode, 86400);
      
      return countryCode;
    } catch (error) {
      console.error('Country detection failed:', error);
      return null;
    }
  }

  async getClientCountry(req) {
    try {
      // Get client IP (handles various proxy scenarios)
      let ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress;
      
      // Handle IPs in x-forwarded-for (might be comma-separated list)
      if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
      }

      // If localhost or testing, use public IP
      if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        ip = await this.getPublicIp();
        console.log(ip)
        if (!ip) throw new Error('Could not determine public IP');
      }

      if (!ip) throw new Error('No IP address detected');

      return await this.detectCountryByIp(ip);
    } catch (error) {
      console.error('Failed to get client country:', error);
      return null;
    }
  }
}

module.exports = new CountryDetector();