import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../utils/api';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import SizeSelector from '../../components/SizeSelector/SizeSelector';
import ColorSelector from '../../components/ColorSelector/ColorSelector';
import Button from '../../components/Button/Button';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FaCircleMinus, FaCirclePlus } from 'react-icons/fa6';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import PriceDisplay from '../../components/PriceDisplay/PriceDispaly';
import Message from '../../components/Message/Message';
import SizeGuide from '../../assets/sizeGuide.jpg';

import './ProductDetails.Styles.css';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [availableSizes, setAvailableSizes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [msg, setMsg] = useState({type: '', text: ''});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data.data);
        setSelectedColor(res.data.data.variants[0].color);
        setAvailableSizes(res.data.data.variants[0].sizes);
      } catch (err) {
        setMsg({type: 'error', text: err.response?.data?.message || 'Failed to load product'});
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if(!product) return;
      try {
        const res = await API.get(`/products?_id[ne]=${id}&category=${product.category}&limit=4`)
        setRelatedProducts(res.data.data)
      } catch (err) {
        setMsg({type: 'error', text: err.response?.data?.message || 'Failed to load related products'});
      }
    }

    fetchRelatedProducts()
  }, [product])

  useEffect(() => {
    setSelectedSize('');
  }, [selectedColor])

  const handleColorSelector = (variant) => {
    setSelectedColor(variant.color)
    setAvailableSizes(variant.sizes)
  }

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      setMsg({type: 'error', text: 'Please select both color and size'});
      return;
    }

    setMsg({type: '', text: ''});
    setIsAdding(true);

    const result = await addToCart(
      product,
      selectedColor,
      selectedSize
    );

    setIsAdding(false);

    if (result.success) {
      setMsg({type: 'success', text: `${product.name} added to cart!`});
    } else {
      setMsg({type: 'error', text: result.message || 'Failed to add to cart'});
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      {/* Success/Error Message */}
      {msg.text && (
        <Message 
          type={msg.type} 
          message={msg.text} 
          onClose={() => setMsg({ type: '', text: '' })} 
          duration={3000}
        />
      )}
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <a href="/">Home</a> &gt; {' '}
          <a href={`/products/category/${product.category}`}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </a> &gt; {' '}
          <span>{product.name}</span>
        </nav>

        <div className="product-grid">
          <div className="images-container">
            <ImageGallery 
              images={mainImageIndex === product.images.length - 1 ? [product.images[mainImageIndex], product.images[0]]
                : [product.images[mainImageIndex], product.images[mainImageIndex + 1]]} 
            />
          </div>
          <div className='info-container'>
            {
              new Date(product.createdAt) > Date.now() - (1000 * 60 * 60 * 24 * 30) ? 
                <span className='text new-tag'>New</span>
                : <></>
            }
            
            <h1 className='name sub-heading'>{product.name}</h1>
            <p className='text description'>{product.description}</p>
            <div className='price sub-heading'>
              <PriceDisplay basePriceInr={product.price} />
            </div>

            <div className='thumbnail-container'>
              {
                product.images ? product.images.map((image, index) => (
                  image && image.url ? 
                    <div className='img-container' key={image._id} onClick={() => setMainImageIndex(index)}>
                      <img src={image.url} alt={`thumbnail ${index + 1}`} />
                    </div>
                  : <div>No Images</div>
                ))
                : <div>No Images</div>
              }
            </div>

            {/* Color Selection */}
            {product.variants.length > 0 && (
              <ColorSelector 
                variants={product.variants} 
                selectedColor={selectedColor}
                onSelectColor={handleColorSelector}
              />
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <SizeSelector 
                availableSizes={availableSizes} 
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
              />
            )}

            <div className='text size-guide-link' onClick={() => setShowSizeGuide(true)}>Need help to Size Guide?</div>
            <Button disabled={!product.isActive} onClick={handleAddToCart}>
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button onClick={() => toggleWishlist(product)} variant='secondary'>
              {
                isInWishlist(product._id) ? 
                <span>In Wishlist&nbsp; <FaHeart style={{color: '#A3320B'}} /></span>
                : <span>Add to Wishlist&nbsp; <FaRegHeart style={{color: '#A3320B'}} /></span>
              }
            </Button>
            <div className='shipping-charges-info text'>
              <p>✔ Free delivery over ₹1000 per order</p>
              <p>✔ Easy returns</p>
              <p>✔ Best quality at affordable price</p>
            </div>
          </div>
        </div>

      </div>
      <div className='other-details'>
        <p className='product-info text'>{product.information}</p>
        <div className='shipping-details-container'>
          <div className='heading-section'>
            <span className='sub-heading'>Shipping & Returns</span>
            <span className='expand-icon sub-heading' onClick={() => setIsOpen(prevValue => !prevValue)} style={{color: isOpen ? 'gray' : '#A3320B'}}>
              {isOpen ? <FaCircleMinus /> : <FaCirclePlus />}
            </span>
          </div>
          <div className={`details-section text ${isOpen ? 'open' : 'closed'}`}>
            <p>• Free standard shipping on all orders over ₹1000.</p>
            <p>• Orders typically ship within 1-2 business days.</p>
            <p>• Easy 30-day return policy.</p>
            <p>• Items must be unworn, unwashed, and with original tags.</p>
            <p>• Exchanges are processed within 3 business days of receiving your return.</p>
            <p>• Final sale items are not eligible for return or exchange.</p>
            <p>• We ship to India and UK.</p>
            <p>• International delivery times vary by destination (typically 7-14 business days)</p>
          </div>
        </div>
        <div className='related-products-section'>
          <div className='sub-heading'>Releated Products</div>
          <div className='products-container'>
            {relatedProducts.length > 0 ? (
              relatedProducts.map(product => (
                <ProductCard key={product._id} product={product} light small />
              ))
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      </div>

      {showSizeGuide && (
        <div className="lightbox" onClick={() => setShowSizeGuide(false)}>
          <img 
            src={SizeGuide} 
            alt="Size Guide" 
            className="size-guide-img"
          />
        </div>
      )}
    </div>
  )
}

export default ProductDetails