import { Link } from 'react-router-dom';
import './ProductCard.Styles.css';
import { useRef, useState } from 'react';
import PriceDisplay from '../PriceDisplay/PriceDispaly';

const ProductCard = ({ product, dark, small }) => {
  const [image, setImage] = useState(product.images.find(img => img.isPrimary)?.url || product.images[0]?.url)
  const timerId = useRef(null);

  const handleMouseEnter = () => {
    // for(const i in product.images) {
    //   timerId.current = setTimeout(() => {
    //     setImage(product.images[i].url)
    //   }, i * 1000)
    // }
    if(product.images[1]) {
      setImage(product.images[1]?.url)
    }
  }

  const handleMouseLeave = () => {
    // clearTimeout(timerId.current)
    // setTimeout(() => {
    //     setImage(product.images.find(img => img.isPrimary)?.url || product.images[0]?.url)
    //   }, 1000)

    setImage(product.images.find(img => img.isPrimary)?.url || product.images[0]?.url)
  }

  return (
    <div className="product-card" onMouseOver={handleMouseEnter} onMouseOut={handleMouseLeave} >
      <Link to={`/product/${product._id}`}>
        <div className="product-image">
          <img 
            src={image} 
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
          <h3 className={`name ${small ? 'small' : 'large'}`}>{product.name}</h3>
          <div className="price">
            {product.retailPrice && (
                <PriceDisplay className="original-price text" basePriceInr={product.retailPrice} />
            )}
            <PriceDisplay basePriceInr={product.price} />
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