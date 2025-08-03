// contexts/CountryContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import API from '../utils/api';

const CountryContext = createContext();

export function CountryProvider({ children }) {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch detected country on mount
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/country');
        setCountry(data);
      } catch (err) {
        setError(err.message);
        console.error('Country detection failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, []);

  // Update country preference
  const updateCountry = async (countryCode) => {
    try {
      const { data } = await API.post('/country', { countryCode });
      setCountry(data);
      localStorage.setItem('country', countryCode);
    } catch (err) {
      setError(err.message);
      console.error('Failed to update country:', err);
      throw err;
    }
  };

  return (
    <CountryContext.Provider value={{ country, loading, error, updateCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

export const useCountry = () => useContext(CountryContext);