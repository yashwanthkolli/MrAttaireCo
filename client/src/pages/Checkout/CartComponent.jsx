import { FaTag } from 'react-icons/fa6';
import Button from '../../components/Button/Button';
import './CartComponent.Styles.css';
import { useState } from 'react';

const CartComponent = ({coupon, setCoupon, subtotal, cart, totalItems, etd}) => {
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const shipping = 10;
  const discount = 10;

  const total = subtotal + shipping - discount;

  return (
    <div className='cart-section'>
      <div className='cart-items-list'>
        {
          cart.items.map(item => 
            <div className='item' key={item._id}>
              <div className='img-container'>
                <img src={item.product.images[0].url} alt={item.product.name} />
                <span className='quatity'>{item.quantity}</span>
              </div>
              <div className='name text'>{item.product.name}</div>
              <div className='price text'>₹ {item.priceAtAddition * item.quantity}</div>
            </div>
          )
        }
      </div>
      <form className='coupon-section'>
        <div className='coupon-input-container'>
          <label htmlFor='coupon-code'><FaTag className='icon' /></label>
          <input
            type='text'
            id='coupon-code'
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
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
      <div className='total-section'>
        <div className='total-item subtotal text'>
          <span>Subtotal- {totalItems} items</span>
          <span>₹ {subtotal}</span>
        </div>
        <div className='total-item shipping text'>
          <span>Shipping</span>
          <span>₹ {shipping}</span>
        </div>
        {
          discount && 
          <div className='total-item coupon-discount text'>
            <span>Coupon Discount</span>
            <span>₹ {discount}</span>
          </div>
        }
        {
          etd && 
          <div className='total-item coupon-discount text'>
            <span>Delivery by</span>
            <span>{etd}</span>
          </div>
        }
        <div className='total sub-heading'>
          <span>Total</span>
          <span>
            <span className='text'>INR </span>₹<span>{total}</span></span>
        </div>
      </div>
    </div>
  )
}

export default CartComponent