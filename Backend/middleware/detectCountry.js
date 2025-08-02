const countryConfig = require('../config/countryConfig');
const countryDetector = require('../utils/countryDetection');
const { getCookie, setCookie } = require('../utils/cookieHelper');

module.exports = async (req, res, next) => {
  try {
    // Check for existing country preference (cookie or session)
    const savedCountry = getCookie(req, 'country');
    if (savedCountry && countryConfig.supportedCountries.some(c => c.code === savedCountry)) {
      req.country = countryConfig.supportedCountries.find(c => c.code === savedCountry);
      return next();
    }

    // Detect country by IP
    const detectedCountryCode = await countryDetector.getClientCountry(req);
    
    // Validate and set country
    const validCountry = countryConfig.supportedCountries.find(
      c => c.code === detectedCountryCode
    ) || countryConfig.supportedCountries.find(
      c => c.code === countryConfig.defaultCountry
    );

    // Set country in request and cookie
    req.country = validCountry;
    setCookie(res, 'country', validCountry.code, { 
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true
    });

    next();
  } catch (error) {
    console.error('Country middleware error:', error);
    // Fallback to default country
    req.country = countryConfig.supportedCountries.find(
      c => c.code === countryConfig.defaultCountry
    );
    next();
  }
};