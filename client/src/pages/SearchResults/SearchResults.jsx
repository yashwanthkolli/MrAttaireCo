import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../../utils/api';
import ProductCard from '../../components/ProductCard/ProductCard';

import './SearchResults.Styles.css';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

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
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query, pagination.page]);

  if (loading) return <div className="loading-spinner">Searching...</div>;
  if (!query) return <div className="no-query">Enter a search term</div>;

  return (
    <div className="search-page">
      <h2 className='heading'>Search Results for "{query}"</h2>
      <p className='sub-heading'>{pagination.total} products found</p>
      
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
    </div>
  );
};

export default SearchResults;