import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/ProductCard/ProductCard';

import './Wishlist.Styles.css';

const Wishlist = () => {
  const { wishlist, loading } = useWishlist();

  return (
    <div className='wishlist-page'>
      <h1 className='heading'>Your Wishlist</h1>

      {!loading ? 
        /* Product Grid */
        <div className="product-grid">
          {wishlist.length > 0 ? (
            wishlist.map(product => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
            </div>
          )}
          <i aria-hidden={true}></i>
          <i aria-hidden={true}></i>
          <i aria-hidden={true}></i>
        </div>
        : <div>Loading...</div>
      }
    </div>
  );
};

export default Wishlist;