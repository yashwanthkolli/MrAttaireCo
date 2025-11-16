import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { loadRazorpay } from '../../utils/loadRazorpay';
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
import { AuthContext } from '../../context/AuthContext';
import { countryStateData } from '../Checkout/CountryData';
import { SiRazorpay, SiPhonepe } from 'react-icons/si';
import { BsCashCoin } from 'react-icons/bs';

import './ProductDetails.Styles.css';
import Input from '../../components/Input/Input';

const ProductDetails = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
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
  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);
  const [address, setAddress] = useState({
    recipientName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [etd, setEtd] = useState('');
  const [isCodAvailable, setIsCodAvailable] = useState(false);

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

  const handleBuyNowClick = () => {
    if (!isAuthenticated) {
      setMsg({ text: 'Please login to place order', type: 'error' })
      setTimeout(() => navigate('/auth'), 1000);
      return;
    }
    if (!selectedColor || !selectedSize) {
      setMsg({ type: 'error', text: 'Please select both color and size' });
      return;
    }
    setShowBuyNowDialog(true);
  };

  useEffect(() => {
    const getShippingETD = async (zipCode) => {
      const res = await API.get(`/shipping?deliveryPincode=${zipCode}`)
      if (res.data.etd) setEtd(res.data.etd)
      setIsCodAvailable(res.data.isCodAvailable)
    }

    if((address.country === 'India' || 'IN') && address?.zipCode?.length > 5) {
      getShippingETD(address.zipCode)
    } 
  }, [address.zipCode])

  const handlePlaceOrder = async () => {
    if (!address.recipientName || !address.phoneNumber || !address.street || !address.city || !address.state) {
      setMsg({ text: 'Please enter an address', type: 'error'});
      return;
    }

    setIsPlacingOrder(true);

    try {
      if (paymentMethod === 'cod') {
        const { data } = await API.post('/payments/buy-now-cod', {
          productId: product._id,
          variant: {color: selectedColor,  size: selectedSize },
          shippingAddress: address,
          estimatedDelivery: etd
        });
        if (data && data.success) {
          navigate(`/order-confirmation/${data.order._id}`)
        }
        return null;
      } else {
        const isScriptLoaded = await loadRazorpay();

        const { data } = await API.post('/payments/buy-now', {
          productId: product._id,
          variant: {color: selectedColor,  size: selectedSize },
          shippingAddress: address,
          estimatedDelivery: etd
        });
        
        if (!isScriptLoaded) {
          throw new Error('Razorpay SDK failed to load');
        }

        const options = {
          key: 'rzp_live_RHqgJJTUyGsFkq',
          amount: data.order.amount,
          currency: data.order.currency,
          order_id: data.order.id,
          name: 'Mr. Attire',
          description: 'Purchase Description',
          handler: async (response) => {
            // Verify payment on your backend
            const res = await API.post('/payments/verify', {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: data.order.id,
              razorpaySignature: response.razorpay_signature,
            });
            alert('Payment Successful!');
            if (res.data && res.data.success) {
              navigate(`/order-confirmation/${data.dbOrderId}`)
            }
          },
          theme: {
            color: '#A3320B',
          },
          modal: {
            ondismiss: () => {
              alert('Payment window closed');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }

      setShowBuyNowDialog(false);
      setAddress('');
      setPaymentMethod('razorpay');
    } catch (error) {
      console.error(error);
      alert('Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

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

  const handleChange = (e) => {
    setAddress({...address, [e.target.name]: e.target.value})
  }

  const closeBuyNowDialog = (e) => {
    e.stopPropagation()
    setShowBuyNowDialog(false)
  }

  const onAddToWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  }

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
              mainImageIndex={mainImageIndex}
              setMainImageIndex={setMainImageIndex}
              totalNumberOfImages={product.images.length}
              isInWishlist={isInWishlist(product._id)}
              onAddToWishlist={onAddToWishlist}
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
              {product.retailPrice && (
                <PriceDisplay className="original-price text" basePriceInr={product.retailPrice} />
              )}
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
            <Button disabled={!product.isActive} onClick={handleBuyNowClick}>
              Buy Now
            </Button>
            <Button disabled={!product.isActive} onClick={handleAddToCart} variant='secondary'>
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Button>
            {/* <Button onClick={() => toggleWishlist(product)} variant='secondary'>
              {
                isInWishlist(product._id) ? 
                <span>In Wishlist&nbsp; <FaHeart style={{color: '#A3320B'}} /></span>
                : <span>Add to Wishlist&nbsp; <FaRegHeart style={{color: '#A3320B'}} /></span>
              }
            </Button> */}
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
            <p>• Easy 7-day return policy.</p>
            <p>• Items must be unworn, unwashed, and with original tags.</p>
            <p>• Exchanges are processed within 3 business days of receiving your return.</p>
            <p>• Final sale items are not eligible for return or exchange.</p>
            <p>• We ship to India and International Shipping coming soon.</p>
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

      {showBuyNowDialog && (
        <div className="buy-now-overlay" onClick={closeBuyNowDialog}>
          <div className="buy-now-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Buy Now</h2>

            <div className="address-form">
              <select
                name="country"
                value={address.country}
                onChange={(e) => setAddress(prev => ({...prev, country: e.target.value, state: e.target.value === 'GB' ? '' : prev.state}))}
                required
                className="form-select"
              >
                <option value="">Select Country</option>
                <option value='IN'>India</option>
                <option value='AU'>Australia</option>
                <option value='CA'>Canada</option>
                <option value='DE'>Germany</option>
                <option value='GB'>United Kingdom</option>
                <option value='US'>United States of America</option>
              </select>
              <div className='row'>
                <Input 
                  name='recipientName'
                  value={address.recipientName}
                  onChange={handleChange}
                  placeholder='Name'
                  required
                />
                <Input 
                  name='phoneNumber'
                  value={address.phoneNumber}
                  onChange={handleChange}
                  placeholder='Phone Number'
                  required
                />
              </div>

              <Input 
                name='street'
                value={address.street}
                onChange={handleChange}
                placeholder='Street'
                required
              />

              <div className='row'>
                <Input 
                  name='city'
                  value={address.city}
                  onChange={handleChange}
                  placeholder='City'
                  required
                />
                {
                  address.country !== 'GB' && 
                  <select
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select State</option>
                    {
                      countryStateData && countryStateData[address.country] &&
                      countryStateData[address.country].map(state => 
                        <option key={state} value={state}>{state}</option>
                      )
                    }
                  </select>
                }
                <Input 
                  name='zipCode'
                  value={address.zipCode}
                  onChange={handleChange}
                  placeholder='ZipCode'
                  required
                />
              </div>
            </div>

            <div className='payment-options'>
              <h2>Payment Method</h2>
              <div className='option'>
                <input 
                  type="radio" 
                  id="razorpay" 
                  name="payment-option" 
                  value="razorpay" 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  defaultChecked 
                />
                <label htmlFor="razorpay"><SiPhonepe />Google Pay, Phone Pe or Other UPI</label>
              </div>
              <div className='option'>
                <input 
                  type="radio" 
                  id="razorpay" 
                  name="payment-option" 
                  value="razorpay" 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                />
                <label htmlFor="razorpay"><SiRazorpay />Razorpay</label>
              </div>
              <div className='option' style={{display: address.country === ('IN' || 'India') ? 'block' : 'none'}}>
                <input type="radio" 
                  id="cod" 
                  name="payment-option" 
                  value="cod" 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={!isCodAvailable}
                />
                <label htmlFor="cod" className={isCodAvailable ? '' : 'disable'}>
                  <BsCashCoin />{isCodAvailable ? 'Cash on Delivery' : address.zipCode.length > 5 ? 'COD is not available to the location' : 'Enter Pincode to Check for COD availability'}
                </label>
              </div>
            </div>

            <div className="dialog-actions">
              <Button onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </Button>
              <Button
                onClick={() => setShowBuyNowDialog(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetails