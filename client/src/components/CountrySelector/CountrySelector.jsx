// components/CountrySelector.jsx
import { useState, useEffect } from 'react';
import { useCountry } from '../../context/CountryContext';
import API from '../../utils/api';
import { RiArrowDropDownLine } from "react-icons/ri";
import Flag from 'react-world-flags'
// import flags from '../utils/flags'; // Your flag icons

import './CountrySelector.Styles.css';

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
      <div 
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
        <span className='country-text'><Flag code={country.code} alt={country.code} height='16' /><RiArrowDropDownLine /></span>
      </div>
      
      {isOpen && (
        <div className="country-dropdown">
          {countries.map((c) => (
            <div
              key={c.code}
              onClick={() => {
                updateCountry(c.code);
                setIsOpen(false);
              }}
              className={`country-option ${country.code === c.code ? 'selected' : ''}`}
            >
              <span className='country-text'><Flag code={c.code}  alt={c.code} height='16' width='25' />{c.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CountrySelector;