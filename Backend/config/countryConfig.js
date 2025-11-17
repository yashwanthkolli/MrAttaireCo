module.exports = {
  supportedCountries: [
    {
      code: 'IN',
      name: 'India',
      currency: 'INR',
      priceMultiplier: 1.0,
      symbol: '₹',
      shippingAvailable: true
    },
    {
      code: 'US',
      name: 'United States',
      currency: 'USD',
      priceMultiplier: 4.8, 
      symbol: '$',
      shippingAvailable: true
    },
    {
      code: 'CA',
      name: 'Canada',
      currency: 'CAD',
      priceMultiplier: 3.65,
      symbol: 'CA$',
      shippingAvailable: true
    },
    {
      code: 'AU',
      name: 'Australia',
      currency: 'AUD',
      priceMultiplier: 3.85,
      symbol: 'A$',
      shippingAvailable: true
    },
    {
      code: 'GB',
      name: 'United Kingdom',
      currency: 'GBP',
      priceMultiplier: 7.8,
      symbol: '£',
      shippingAvailable: true
    },
    {
      code: 'DE',
      name: 'Germany',
      currency: 'EUR',
      priceMultiplier: 5.1,
      symbol: '€',
      shippingAvailable: true
    }
  ],
  defaultCountry: 'IN'
};