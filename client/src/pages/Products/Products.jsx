import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../../utils/api';
import ProductCard from '../../components/ProductCard/ProductCard';
// import Spinner from '../components/Spinner';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';

import './Products.Styles.css';
import Message from '../../components/Message/Message';

const Products = () => {
  const { category } = useParams()
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: category ? category : '',
    priceMin: 0,
    priceMax: 5000,
    color: '',
    sort: '-createdAt'
  });
  const [msg, setMsg] = useState({type: '', text: ''})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Build query string from filters
        const query = new URLSearchParams();
        for (const key in filters) {
          if (filters[key]) query.append(key, filters[key]);
        }

        const res = await API.get(`/products?${query.toString()}`);
        setProducts(res.data.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setMsg({type: 'error', text: 'Failed to fetch products'})
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  useEffect(() => {
    setFilters(category);
  }, [category]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };
  return (
    <div className='products-page'>
      {/* Success/Error Message */}
      {msg.text && (
        <Message 
          type={msg.type} 
          message={msg.text} 
          onClose={() => setMsg({ type: '', text: '' })} 
          duration={3000}
        />
      )}

      {/* Filter Sidebar */}
      <div className="col-md-3">
        <FilterSidebar 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {!loading ? 
        /* Product Grid */
        <div className="product-grid">
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
              <button 
                onClick={() => setFilters({
                  category: '',
                  priceMin: '',
                  priceMax: '',
                  sort: '-createdAt'
                })}
                className="btn btn-primary"
              >
                Reset Filters
              </button>
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
  )
}

export default Products