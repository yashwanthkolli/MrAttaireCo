import { useEffect, useState } from 'react';
import AddressComponent from './AddressComponent';
import { useCart } from '../../context/CartContext';
import './Checkout.Styles.css';
import CartComponent from './CartComponent';
import API from '../../utils/api';
import { loadRazorpay } from '../../utils/loadRazorpay';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate()
  const { cart, validateCart, totalItems, refreshCart } = useCart();
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
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

    if (paymentMethod === 'cod') {
      const { data } = await API.post('/payments/cod', {
        shippingAddress: newAddress, 
        couponCode: coupon
      });
      if (data && data.success) {
        refreshCart();
        navigate(`/order-confirmation/${data.order._id}`)
      }
      return null;
    }

    const isScriptLoaded = await loadRazorpay();

    const { data } = await API.post('/payments/create-order', {
      shippingAddress: newAddress, 
      couponCode: coupon
    });

    if (!isScriptLoaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    const options = {
      key: 'rzp_test_MG6XGWYGWVNnPr',
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
          refreshCart();
          navigate(`/order-confirmation/${data.dbOrderId}`)
        }
      },
      theme: { color: '#242423' },
      modal: {
        ondismiss: () => {
          alert('Payment window closed');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <div className='checkout-page'>
      <div className='checkout-section'>
        <AddressComponent 
          newAddress={newAddress} 
          setNewAddress={setNewAddress} 
          handleSubmit={handleProceed} 
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          />
      </div>
      <div className='cart-section'>
        <CartComponent 
          couponCode={coupon} 
          setCouponCode={setCoupon} 
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