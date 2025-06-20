import { Link } from 'react-router-dom';

import './ProductCard.Styles.css';

const ProductCard = ({ product, dark }) => {
  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`}>
        <div className="product-image">
          <img 
            src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url} 
            alt={product.name}
          />
          {product.discountedPrice && (
            <span className="discount-badge">
              {Math.round(100 - (product.discountedPrice / product.price * 100))}% OFF
            </span>
          )}
        </div>
        <div className={`product-details ${dark ? 'dark' : 'light'}`}>
          <h5 className='description'>{product.description}</h5>
          <h3 className='name'>{product.name}</h3>
          <div className="price">
            {product.discountedPrice ? (
              <>
                <span className="original-price">${product.price.toFixed(2)}</span>
                <span className="discounted-price">${product.discountedPrice.toFixed(2)}</span>
              </>
            ) : (
              <span>₹{product.price.toFixed(2)}</span>
            )}
          </div>
          {/* <div className="product-meta">
            <span className="rating">⭐ {product.ratings || 'New'}</span>
            {product.stock > 0 ? (
              <span className="in-stock">In Stock</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div> */}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;