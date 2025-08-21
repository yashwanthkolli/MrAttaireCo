import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../../utils/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Message from '../../components/Message/Message';

import './SearchResults.Styles.css';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [msg, setMsg] = useState({type: '', text: ''});

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/search?q=${query}&page=${pagination.page}`);
        setResults(res.data.data);
        setPagination(prev => ({
          ...prev,
          total: res.data.total,
          pages: res.data.pages
        }));
      } catch (err) {
        console.error('Search failed:', err);
        setMsg({type: 'error', text: 'Search failed'})
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query, pagination.page]);

  if (!query) return <div className="no-query">Enter a search term</div>;

  return (
    <div className="search-page">
      {/* Success/Error Message */}
      {msg.text && (
        <Message 
          type={msg.type} 
          message={msg.text} 
          onClose={() => setMsg({ type: '', text: '' })} 
          duration={3000}
        />
      )}

      <h2 className='heading'>Search Results for "{query}"</h2>
      <p className='sub-heading'>{pagination.total} products found</p>
      {!loading ? 
        <div className="product-grid">
          {results.length > 0 ? (
            results.map(product => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="no-results">
              <h3>No products found</h3>
              <p>Try different search terms</p>
            </div>
          )}
          <i aria-hidden={true}></i>
          <i aria-hidden={true}></i>
          <i aria-hidden={true}></i>
        </div>
        : 
        <div className="product-grid">
          {Array(8).fill(null).map((_, index) => (
            <div className="product-card product-skeleton" key={index}>
              <div className="product-image product-skeleton-block"></div>
              <div className="product-details-skeleton">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line long"></div>
                <div className="skeleton-line medium"></div>
              </div>
            </div>
          ))}
        </div>
      }   
    </div>
  );
};

export default SearchResults;