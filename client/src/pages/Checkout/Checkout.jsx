import { useState } from 'react';
import AddressComponent from './AddressComponent';
import { useCart } from '../../context/CartContext';
import './Checkout.Styles.css';
import CartComponent from './CartComponent';

const Checkout = () => {
  const { cart, validateCart, totalItems } = useCart();
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [coupon, setCoupon] = useState('');

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.discountedPriceAtAddition || item.priceAtAddition;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <div className='checkout-page'>
      <div className='checkout-section'>
        <AddressComponent newAddress={newAddress} setNewAddress={setNewAddress} />
      </div>
      <div className='cart-section'>
        <CartComponent 
          coupon={coupon} 
          setCoupon={setCoupon} 
          cart={cart} 
          subtotal={subtotal}
          totalItems={totalItems} 
        />
      </div>
    </div>
  )
}

export default Checkout