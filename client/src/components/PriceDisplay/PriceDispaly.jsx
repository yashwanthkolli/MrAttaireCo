import { useState, useEffect } from 'react';
import { useCountry } from '../../context/CountryContext';
import API from '../../utils/api';

const PriceDisplay = ({ basePriceInr, priceType = 'product', className }) => {
  const { country } = useCountry();
  const [priceData, setPriceData] = useState({
    value: null,
    formatted: '',
    currency: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchConvertedPrice = async () => {
      try {
        setPriceData(prev => ({ ...prev, loading: true, error: null }));
        
        const { data } = await API.get('/country/convert', {
          params: { 
            priceInr: basePriceInr,
            countryCode: country.code,
            priceType: priceType
          }
        });

        setPriceData({
          value: data.value,
          formatted: data.formatted,
          currency: data.currency,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Price conversion failed:', error);
        setPriceData({
          value: basePriceInr,
          formatted: `₹${basePriceInr.toFixed(2)}`,
          currency: 'INR',
          loading: false,
          error: 'Failed to convert price'
        });
      }
    };

    if (country?.code && basePriceInr && country.code !== 'IN') {
      fetchConvertedPrice();
    } else if (country?.code === 'IN') {
      setPriceData({
          value: basePriceInr,
          formatted: `₹${basePriceInr.toFixed(2)}`,
          currency: 'INR',
          loading: false,
          error: null
        });
    }
  }, [basePriceInr, country?.code]);

  if (priceData.loading) {
    return (
      <div className="price-loading">
        <span className="price-skeleton"></span>
        {country?.code !== 'IN' && <span className="original-skeleton"></span>}
      </div>
    );
  }

  return (
    <div className={`price-display ${priceData.error ? 'has-error' : ''}`}>
      <span className={className}>
        {priceData.formatted}
        {priceData.error && (
          <span className="error-tooltip" title="Price conversion failed">
            ⚠️
          </span>
        )}
      </span>
    </div>
  );
}

export default PriceDisplay;