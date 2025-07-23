import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../Button/Button';

import './CartSummary.Styles.css';
import { FaTag } from 'react-icons/fa6';

const CartSummary = () => {
  const { cart, isGuestCart, clearCart, validateCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [errors, setErrors] = useState('')
  const navigate = useNavigate();

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

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    
    // Frontend-only validation for demo
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    // Simulate "valid" coupon codes for demo
    const validDemoCoupons = ['WELCOME10', 'SUMMER20', 'FREESHIP'];
    if (validDemoCoupons.includes(couponCode.toUpperCase())) {
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
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

console.log(errors)

  return (
    <div className='cart-summary'>
      <h3 className="sub-heading">Order Summary</h3>
      
      <div className='content'>
        <div className='text-container text'>
          <div className='info sub-heading'>
            <span className='title'>Subtotal: </span>
            <span className='value'>₹{subtotal.toFixed(2)}</span>
          </div>
          
          <div className='shipping-details'>
            Tax and shipping included
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
                width='15%'
                variant='secondary'
              >
                Apply
              </Button>
            ) : (
              <Button
                type='button'
                onClick={handleRemoveCoupon}
                className='margin0'
                width='15%'
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