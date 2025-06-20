import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../../utils/api';
import ProductCard from '../../components/ProductCard/ProductCard';
// import Spinner from '../components/Spinner';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';

import './Products.Styles.css';

const Products = () => {
  const { category } = useParams()
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: category ? category : '',
    pricemin: '',
    pricemax: '',
    color: '',
    sort: '-createdAt'
  });

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
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };
  return (
    <div className='products-page'>
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
        </div>
        : <></>
      }
    </div>
  )
}

export default Products