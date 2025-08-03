// components/CountrySelector.jsx
import { useState, useEffect } from 'react';
import { useCountry } from '../../context/CountryContext';
import API from '../../utils/api';
// import flags from '../utils/flags'; // Your flag icons

const CountrySelector = () => {
  const { country, updateCountry } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState([]);

  // Fetch supported countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data } = await API.get('/country/list');
        setCountries(data);
      } catch (err) {
        console.error('Failed to load countries:', err);
      }
    };

    fetchCountries();
  }, []);

  if (!country || countries.length === 0) return null;

  return (
    <div className="country-selector">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="current-country"
        aria-label="Change country"
      >
        {/* <img 
          src={flags[country.code]} 
          alt={country.name}
          width={24}
          height={16}
        /> */}
        <span>{country.currency} ({country.symbol})</span>
      </button>
      
      {isOpen && (
        <div className="country-dropdown">
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                updateCountry(c.code);
                setIsOpen(false);
              }}
              className={`country-option ${country.code === c.code ? 'selected' : ''}`}
            >
              <img 
                src={c.flag} 
                alt={c.name}
                width={24}
                height={16}
              />
              <span>{c.name} ({c.symbol}{c.currency})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CountrySelector;