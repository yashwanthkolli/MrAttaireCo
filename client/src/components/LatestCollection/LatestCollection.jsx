import { useEffect, useState } from 'react'
import API from '../../utils/api';
import ProductCard from '../ProductCard/ProductCard';

import './LatestCollection.Styles.css'
import Message from '../Message/Message';

const LatestCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchLastestProducts = async () => {
      try{
        const res = await API.get(`/products?sort=-createdAt&page=1&limit=4&`);
        setProducts(res.data.data);
      } catch(err) {
        setMsg({ type: 'error', text: 'Failed to fetch latest products' });
      } finally {
        setLoading(false);
      }
    }
    
    fetchLastestProducts();
  }, []);

  return (
    <div className='latest-section'>
      {/* Success/Error Message */}
      {msg.text && (
        <Message 
          type={msg.type} 
          message={msg.text} 
          onClose={() => setMsg({ type: '', text: '' })} 
          duration={3000}
        />
      )}

      <h1 className='heading'>New Comers</h1>
      <h4 className='sub-heading'>Latest Models</h4>

      <div className='products-container'>
        {loading ? (
          // Skeletons for loading
          <>
          {Array(4).fill(null).map((_, index) => (
            <div className="product-card product-skeleton" key={index}>
              <div className="product-image product-skeleton-block"></div>
              <div className="product-details-skeleton">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line long"></div>
                <div className="skeleton-line medium"></div>
              </div>
            </div>
          ))}
          </>
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product._id} product={product} dark />
          ))
        ) : (
          <div>No products found</div>
        )}
      </div>
    </div>
  )
}

export default LatestCollection