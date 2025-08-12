import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { FiX } from 'react-icons/fi';

import './NavbarSearch.Styles.css';

const NavbarSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 2) {
        API.get(`/products/search/suggestions?q=${encodeURIComponent(query)}`)
          .then(res => setResults(res.data.data))
          .catch(console.error);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflowY = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflowY = 'unset'; // Re-enable scrolling
    }

    // Cleanup function to reset overflow when component unmounts or state changes
    return () => {
      document.body.style.overflowY = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products/search?q=${encodeURIComponent(query)}`);
      setQuery('');
      setResults([]);
      setIsOpen(false);
    }
  };

  return (
    <div className="navbar-search">
      <form onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
          {query && (
            <button 
              type="button" 
              className="clear-btn"
              onClick={() => setQuery('')}
            >
              <FiX />
            </button>
          )}
        </div>
        
        {isOpen && results.length > 0 && (
          <div className="search-dropdown">
            {results.map(item => (
              <div 
                key={item._id}
                className="search-item"
                onClick={() => {
                  navigate(`/product/${item._id}`);
                  setIsOpen(false);
                }}
              >
                <img src={item.images[0]?.url} alt={item.name} />
                <div>
                  <h4 className='sub-heading'>{item.name}</h4>
                  <p className='text'>${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div 
              className="view-all text"
              onClick={() => {
                navigate(`/search?q=${encodeURIComponent(query)}`);
                setIsOpen(false);
              }}
            >
              View all results for "{query}"
            </div>
          </div>
        )}
      </form>
      
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="search-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NavbarSearch;