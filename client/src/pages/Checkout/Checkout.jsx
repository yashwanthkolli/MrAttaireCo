import { useState } from 'react';
import AddressComponent from './AddressComponent';
import './Checkout.Styles.css';

const Checkout = () => {
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })

  return (
    <div className='checkout-page'>
      <div className='checkout-section'>
        <AddressComponent newAddress={newAddress} setNewAddress={setNewAddress} />
      </div>
      <div className='cart-section'>
        Hello
      </div>
    </div>
  )
}

export default Checkout