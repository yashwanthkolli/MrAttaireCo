import { useState, useEffect } from 'react';
import API from '../../utils/api';
// import Spinner from '../components/Spinner';
import LatestCollection from '../../components/LatestCollection/LatestCollection';
import Categories from '../../components/Categories/Categories';
import HeroSection from '../../components/HeroSection/HeroSection';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    pricemin: '',
    pricemax: '',
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
    <div className="homepage">
      <HeroSection />
      <LatestCollection />
      <Categories />
    </div>
  );
};

export default Home;