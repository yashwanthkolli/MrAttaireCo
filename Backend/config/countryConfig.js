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
      priceMultiplier: 2.7, 
      symbol: '$',
      shippingAvailable: true
    },
    {
      code: 'CA',
      name: 'Canada',
      currency: 'CAD',
      priceMultiplier: 2.1,
      symbol: 'CA$',
      shippingAvailable: true
    },
    {
      code: 'AU',
      name: 'Australia',
      currency: 'AUD',
      priceMultiplier: 1.75,
      symbol: 'A$',
      shippingAvailable: true
    },
    {
      code: 'GB',
      name: 'United Kingdom',
      currency: 'GBP',
      priceMultiplier: 4.4,
      symbol: '£',
      shippingAvailable: true
    },
    {
      code: 'DE',
      name: 'Germany',
      currency: 'EUR',
      priceMultiplier: 2.9,
      symbol: '€',
      shippingAvailable: true
    }
  ],
  defaultCountry: 'IN'
};