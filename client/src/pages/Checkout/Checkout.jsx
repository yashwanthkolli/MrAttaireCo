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
      if (res.data.etd) setEtd(res.data.etd)
    }

    if(newAddress.country === 'India' && newAddress.zipCode.length > 5) {
      getShippingETD(newAddress.zipCode)
    } 
  }, [newAddress.zipCode])

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.discountedPriceAtAddition || item.priceAtAddition;
    return sum + (price * item.quantity);
  }, 0);

  const handleProceed = async (e) => {
    e.preventDefault();

    const { data } = await API.post('/payments/create-order', {
      amount: 5, // Total cart amount
    });

    console.log(data)
  }

  return (
    <div className='checkout-page'>
      <div className='checkout-section'>
        <AddressComponent newAddress={newAddress} setNewAddress={setNewAddress} handleSubmit={handleProceed} />
      </div>
      <div className='cart-section'>
        <CartComponent 
          coupon={coupon} 
          setCoupon={setCoupon} 
          cart={cart} 
          subtotal={subtotal}
          totalItems={totalItems} 
          etd={etd}
        />
      </div>
    </div>
  )
}

export default Checkout