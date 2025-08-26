import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdBookmark, MdDeleteForever, MdModeEdit } from 'react-icons/md';
import Button from '../Button/Button';
import Input from '../Input/Input';

import './AddressSection.Styles.css';

const AddressSection = ({setMsg}) => {
  const { user, addAddress, deleteAddress, setDefaultAddress, updateAddress } = useContext(AuthContext);

  const [addressMode, setAddressMode] = useState(null); // null, 'add', or 'edit'
  const [currentAddress, setCurrentAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });

  useEffect(() => {
    if (currentAddress) {
      setAddressForm({
        street: currentAddress.street,
        city: currentAddress.city,
        state: currentAddress.state,
        zipCode: currentAddress.zipCode,
        country: currentAddress.country,
        isDefault: currentAddress.isDefault
      });
    }
  }, [currentAddress]);

    const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };


  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addressMode === 'add') {
        await addAddress(addressForm);
      } else if (addressMode === 'edit') {
        await updateAddress(currentAddress._id, addressForm)
      }

      setMsg({type: 'success', text: 'Address updated successfully'});
      setAddressMode(null);
      setCurrentAddress(null);
      setAddressForm({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false
      });
    } catch (err) {
      setMsg({type: 'error', text: err.response?.data?.message || 'Address update failed'});
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId);
      setMsg({type: 'success', text: 'Address deleted successfully'});
    } catch (err) {
      setMsg({type: 'error', text: err.response?.data?.message || 'Address deletion failed'});
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      setMsg({type: 'success', text: 'Default address updated successfully'});
    } catch (err) {
      setMsg({type: 'error', text: err.response?.data?.message || 'Failed to set default address'});
    }
  };

  return (
    <div className="address-section">
      <div className="section-header">
        <h2>Addresses</h2>
        <div className='button-container'>
          {!addressMode && (
            <Button onClick={() => {
              setAddressMode('add');
              setCurrentAddress(null);
              setAddressForm({
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                isDefault: false
              });
            }} className='small-btn'>
              Add New Address
            </Button>
          )}
        </div>
      </div>

      {addressMode ? (
        <form onSubmit={handleAddressSubmit} className="address-form">
          <h3>{addressMode === 'add' ? 'Add New Address' : 'Edit Address'}</h3>
          
          <div className="form-group">
            <label>Street Address</label>
            <Input
              type="text"
              name="street"
              value={addressForm.street}
              onChange={handleAddressChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>City</label>
            <Input
              type="text"
              name="city"
              value={addressForm.city}
              onChange={handleAddressChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>State/Province</label>
            <Input
              type="text"
              name="state"
              value={addressForm.state}
              onChange={handleAddressChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Zip/Postal Code</label>
            <Input
              type="text"
              name="zipCode"
              value={addressForm.zipCode}
              onChange={handleAddressChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Country</label>
            <select
              name="country"
              value={addressForm.country}
              onChange={handleAddressChange}
              required
              className="form-select"
            >
              <option value="">Select Country</option>
              <option value='IN'>India</option>
              <option value='AU'>Australia</option>
              <option value='CA'>Canada</option>
              <option value='DE'>Germany</option>
              <option value='GB'>United Kingdom</option>
              <option value='US'>United States of America</option>
            </select>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleAddressChange}
              />
              Set as default address
            </label>
          </div>
          
          <div className="buttons-container">
            <Button type="submit" width='45%'>
              {addressMode === 'add' ? 'Add Address' : 'Update Address'}
            </Button>
            <Button 
              type="button" 
              onClick={() => setAddressMode(null)} 
              width='45%'
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="address-list">
          {user?.addresses?.length > 0 ? (
            user.addresses.map((address) => (
              <div key={address._id} className='text address-card'>
                <div className="address-content">
                  {address.isDefault && <span className="default-badge">Default</span>}
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p>{address.country}</p>
                </div>
                <div className="address-actions">
                  {!address.isDefault && (
                    <div 
                      onClick={() => handleSetDefaultAddress(address._id)}
                      className='icon'
                    >
                      <MdBookmark />
                    </div>
                  )}
                  <div 
                    onClick={() => {
                      setCurrentAddress(address);
                      setAddressMode('edit');
                    }}
                    className='icon'
                  >
                    <MdModeEdit />
                  </div>
                  <div 
                    onClick={() => handleDeleteAddress(address._id)}
                    className='icon delete-icon'
                  >
                    <MdDeleteForever />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className='text no-address'>No addresses saved. Add your first address!</p>
          )}
        </div>
      )}
    </div>
  )
}

export default AddressSection