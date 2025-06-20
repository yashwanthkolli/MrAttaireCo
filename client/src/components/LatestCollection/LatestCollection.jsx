import { useEffect, useState } from 'react'
import API from '../../utils/api';

import './LatestCollection.Styles.css'
import ProductCard from '../ProductCard/ProductCard';

const LatestCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastestProducts = async () => {
      try{
        const res = await API.get(`/products?sort=-createdAt&page=1&limit=4&`);
        setProducts(res.data.data);
      } catch(err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLastestProducts();
  }, []);

  return (
    <div className='latest-section'>
      <h1 className='heading'>New Comers</h1>
      <h4 className='sub-heading'>Latest Models</h4>
      <div className='products-container'>
        {products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product._id} product={product} dark />
          ))
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  )
}

export default LatestCollection