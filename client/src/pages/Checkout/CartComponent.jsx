import { FaTag } from 'react-icons/fa6';
import Button from '../../components/Button/Button';
import './CartComponent.Styles.css';
import { useEffect, useState } from 'react';
import API from '../../utils/api';
import { useCountry } from '../../context/CountryContext';

const CartComponent = ({couponCode, setCouponCode, subtotal, cart, totalItems, etd, refreshCart, convertedCart}) => {
  const { country } = useCountry();
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponData, setCouponData] = useState({});
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const fetchCouponData = async () => {
      const { data } =  await API.post('/coupon/apply', { couponCode: cart.couponUsed })
      if (data && data.success && data.couponValid) {
        setCouponData(data.coupon)
      } 
    }

    if (cart.couponUsed) {
      setCouponCode(cart.couponUsed);
      setCouponApplied(true);
      fetchCouponData();
    }
  }, [cart])

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');

    await API.post('/coupon/apply', { couponCode })
    .then(res => {
      if (res.data && res.data.success && res.data.couponValid) {
        setCouponApplied(true);
        setCouponCode(res.data.coupon.code);
        setCouponData(res.data.coupon);
      } 
    })
    .catch(err => {
      setCouponCode('')
      setCouponError(err.response.data.error)
    })
  };

  const handleRemoveCoupon = async () => {
    const { data } = await API.get('/coupon/remove')
    if (data.success) {
      setCouponApplied(false);
      setCouponCode('');
      setCouponData({});
      setDiscount(0);
      refreshCart();
    }
  };

  let shipping = 100;

  useEffect(() => {
    const convertDiscountValue = async() => {
      if (couponData && couponData.discountAmount) {
        const { data } = await API.get('/country/convert', {
          params: {
            priceInr: couponData.discountAmount,
            countryCode: country?.code,
            priceType: 'sum'
          }
        });
        return data
      }
      return 0;
    }

    if (couponData && couponData.discountAmount > 0) {
      if (country?.code === 'IN'){
        setDiscount(couponData.discountAmount)
      } else {
        convertDiscountValue()
        .then(res => setDiscount(res.value))
        .catch(err => setCouponError(err))
      }
    }
  }, [couponData])

  if (couponData && couponData.freeShipping) {
    shipping = 0;
  }

  const total = convertedCart.convertedSubtotal + shipping - discount;

  return (
    <div className='cart-section'>
      <div className='cart-items-list'>
        {
          convertedCart.items.map(item => 
            <div className='item' key={item._id}>
              <div className='img-container'>
                <img src={item.product.images[0].url} alt={item.product.name} />
                <span className='quatity'>{item.quantity}</span>
              </div>
              <div className='name text'>{item.product.name}</div>
              <div className='price text'>{country.symbol ? country.symbol : '₹'}{item.convertedPrice * item.quantity}</div>
            </div>
          )
        }
      </div>
      <form className='coupon-section' onSubmit={handleApplyCoupon}>
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
      <div className='total-section'>
        <div className='total-item subtotal text'>
          <span>Subtotal- {totalItems} items</span>
          <span>{country?.symbol ? country.symbol : '₹'}{convertedCart.convertedSubtotal && convertedCart.convertedSubtotal.toFixed(2)}</span>
        </div>
        <div className='total-item shipping text'>
          <span>Shipping</span>
          <span>{country?.symbol ? country.symbol : '₹'}{shipping}</span>
        </div>
        {
          discount > 0 && 
          <div className='total-item coupon-discount text'>
            <span>Coupon Discount</span>
            <span>{country?.symbol ? country.symbol : '₹'}{discount.toFixed(2)}</span>
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
            <span className='text'>{country?.currency ? country.currency : 'INR'} </span>{country?.symbol ? country.symbol : '₹'}<span>{total.toFixed(2)}</span></span>
        </div>
      </div>
    </div>
  )
}

export default CartComponent