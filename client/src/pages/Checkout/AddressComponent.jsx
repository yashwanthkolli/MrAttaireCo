import { useContext, useEffect, useState } from 'react'
import './AddressComponent.Styles.css'
import { AuthContext } from '../../context/AuthContext'
import { countryStateData } from './CountryData';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { SiRazorpay } from 'react-icons/si';
import { BsCashCoin } from 'react-icons/bs';

const AddressComponent = ({newAddress, setNewAddress, handleSubmit, paymentMethod, setPaymentMethod}) => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const defaultAddress = user.addresses.filter(address => address.isDefault)[0]
    if(defaultAddress) {
      setNewAddress(defaultAddress)
    } else {
      setNewAddress({...newAddress, recipientName: user.firstName + ' ' + user.lastName, phoneNumber: user.phone})
    }
    
  }, [user])

  const handleChange = (e) => {
    setNewAddress({...newAddress, [e.target.name]: e.target.value})
  }

  const handleCountryChange = (e) => {
    setNewAddress(prev => ({...prev, country: e.target.value, state: e.target.value === 'UK' ? '' : prev.state}))
  }

  const handleSelectAddress = (address) => {
    setNewAddress(address)
  }

  return (
    <div className="address-component">
      <div className="address-form">
        <h1>Checkout Address</h1>
        <form onSubmit={handleSubmit}>
          <select
            name="country"
            value={newAddress.country}
            onChange={handleCountryChange}
            required
            className="form-select"
          >
            <option value="">Select Country</option>
            <option value='India'>India</option>
            <option value='UK'>United Kingdom</option>
          </select>
          <div className='row'>
            <Input 
              name='recipientName'
              value={newAddress.recipientName}
              onChange={handleChange}
              placeholder='Name'
              required
            />
            <Input 
              name='phoneNumber'
              value={newAddress.phoneNumber}
              onChange={handleChange}
              placeholder='Phone Number'
              required
            />
          </div>
          <Input 
            name='street'
            value={newAddress.street}
            onChange={handleChange}
            placeholder='Street'
            required
          />
          <div className='row'>
            <Input 
              name='city'
              value={newAddress.city}
              onChange={handleChange}
              placeholder='City'
              required
            />
            {
              newAddress.country !== 'UK' && 
              <select
                name="state"
                value={newAddress.state}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select State</option>
                {
                  countryStateData && countryStateData[newAddress.country] &&
                  countryStateData[newAddress.country].map(state => 
                    <option key={state} value={state}>{state}</option>
                  )
                }
              </select>
            }
            <Input 
              name='zipCode'
              value={newAddress.zipCode}
              onChange={handleChange}
              placeholder='ZipCode'
              required
            />
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
              <label htmlFor="razorpay"><SiRazorpay />Razorpay</label>
            </div>
            <div className='option'>
              <input type="radio" 
                id="cod" 
                name="payment-option" 
                value="cod" 
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <label htmlFor="cod"><BsCashCoin />Cash on Delivery</label>
            </div>
          </div>
          <Button type='submit'>{paymentMethod === 'cod' ? 'Confirm Order' : 'Proceed'}</Button>
          <Button onClick={() => navigate(-1)} variant='danger'>Cancel</Button>
        </form>

        {
          user.addresses && user.addresses.length > 0 && 
          <div className='address-list'>
            <h2>Select from saved Addresses</h2>
            {
              user.addresses.map(address => 
                <div className='address-option' key={address._id} onClick={() => handleSelectAddress(address)}>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state}- {address.zipCode}</p>
                  <p>{address.country}</p>
                </div>
              )
            }
          </div>
        }
        
      </div>
      
    </div>
  )
}

export default AddressComponent