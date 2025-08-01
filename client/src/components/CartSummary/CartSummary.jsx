import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../Button/Button';

import './CartSummary.Styles.css';
import { FaTag } from 'react-icons/fa6';
import API from '../../utils/api';

const CartSummary = () => {
  const { cart, isGuestCart, clearCart, validateCart, refreshCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState({});
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [errors, setErrors] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.couponUsed) {
      setCouponCode(cart.couponUsed);
    }
  }, [cart])

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
        <p className="mt-4 text-sm text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.discountedPriceAtAddition || item.priceAtAddition;
    return sum + (price * item.quantity);
  }, 0);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');

    await API.post('/coupon/apply', { couponCode })
    .then(res => {
      if (res.data && res.data.success && res.data.couponValid) {
        setCouponApplied(true);
        setCouponCode(res.data.coupon.code);
        setCouponData(res.data.coupon);
        refreshCart();
      } 
    })
    .catch((err => {
      setCouponError(err.response.data.error)
    }))
  };

  const handleRemoveCoupon = async () => {
    const { data } = await API.get('/coupon/remove')
    if (data.success) {
      setCouponApplied(false);
      setCouponCode('');
      setCouponData({});
      refreshCart();
    }
  };

  const handleProceedToCheckout = async () => {
  try {
    if (isGuestCart) {
      navigate('/auth/login')
    } else {
      validateCart()
      .then(validation => {
        if (validation.data.allItemsAvailable && !validation.data.pricesUpdated) {
          navigate('/checkout'); // Redirect to checkout page
        } else {
          setErrors('Some items have been changed. The cart is automatically updated. Check the cart again'); // Show errors to user
        }
      })
    }
  } catch (error) {
    setErrors("Failed to validate cart. Please try again.");
  }
};

  return (
    <div className='cart-summary'>
      <h3 className="sub-heading">Order Summary</h3>
      
      <div className='content'>
        <div className='text-container text'>
          <div className='info sub-heading'>
            <span className='title'>Subtotal: </span>
            <span className='value'>₹{subtotal.toFixed(2)}</span>
          </div>
          { couponData && couponData.discountAmount > 0 &&
            <div className='info sub-heading'>
              <span className='title'>Discount: </span>
              <span className='value'>₹{couponData.discountAmount}</span>
            </div>
          }
          
          
          <div className='tax-details'>
            Tax included
          </div>

          <div className='info sub-heading total-info'>
            <span className='title'>Total: </span>
            <span className='value'>₹{couponData && couponData.discountAmount ? subtotal - couponData.discountAmount : subtotal}</span>
          </div>

          {/* Coupon Code Section */}
          <form onSubmit={handleApplyCoupon} className='coupon-section'>
            <div className='coupon-input-container'>
              <label htmlFor='coupon-code'><FaTag className='icon' /></label>
              <input
                type='text'
                id='coupon-code'
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                placeholder='Coupon Code'
                className='coupon-input'
              />
            </div>
            {!couponApplied ? (
              <Button
                type='submit'
                className='margin0'
                width='20%'
                variant='secondary'
              >
                Apply
              </Button>
            ) : (
              <Button
                type='button'
                onClick={handleRemoveCoupon}
                className='margin0'
                width='20%'
                variant='danger'
              >
                Remove
              </Button>
            )}
          </form>

          <Link to="/products">← Continue Shopping</Link>
        </div>

        <div className='buttons-container'>
          <Button onClick={handleProceedToCheckout}>
            {isGuestCart ? 'Login to Checkout' : 'Proceed to Checkout'}
          </Button>
          
          <Button variant='danger' onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </div>
      {errors && (<div className="checkout-errors">{errors}</div>)}
    </div>
  );
};

export default CartSummary;