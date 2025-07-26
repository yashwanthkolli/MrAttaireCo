import { useEffect, useState } from 'react';
import AddressComponent from './AddressComponent';
import { useCart } from '../../context/CartContext';
import './Checkout.Styles.css';
import CartComponent from './CartComponent';
import API from '../../utils/api';

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
  const [etd, setEtd] = useState('')

  useEffect(() => {
    const getShippingETD = async (zipCode) => {
      const res = await API.get(`/shipping?deliveryPincode=${zipCode}`)
      console.log(res)
    }
    if(newAddress.country === 'India' && newAddress.zipCode.length > 5) {
      getShippingETD(newAddress.zipCode)
    } 
  }, [newAddress.zipCode])

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