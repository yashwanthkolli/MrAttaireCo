import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

import './Profile.Styles.css';
import { FaCircleUser } from 'react-icons/fa6';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import AddressSection from '../../components/AddressSection/AddressSection';
import Message from '../../components/Message/Message';

const Profile = () => {
  const { user, updateDetails } = useContext(AuthContext);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });
  const [msg, setMsg] = useState({type: '', text: ''});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDetails(formData);
      setMsg({type: 'success', text: 'Profile updated successfully'})
      setEditMode(false);
    } catch (err) {
      setMsg({type: 'error', text: err.response?.data?.message || 'Update failed'});
    }
  };

  return (
    <div className='profile-page'>
      {/* Success/Error Message */}
      {msg.text && (
        <Message 
          type={msg.type} 
          message={msg.text} 
          onClose={() => setMsg({ type: '', text: '' })} 
          duration={3000}
        />
      )}
      <div className='personal-info'>
        <div className='user'>
          {
            user.profilePicture ? 
            <div className='profile-picture'>
              <img src={user.profilePicture} referrerPolicy="no-referrer" alt='user' />
            </div>
            :
            <div className='icon'>
              <FaCircleUser />
            </div>
          }
          <div className='details'>
            <h3 className='name heading'>{user?.firstName} {user?.lastName}</h3>
            <h4 className='email sub-heading'>{user?.email}</h4>
          </div>
        </div>
        {!editMode ? (
          <div className='other-details'>
            <p className='detail'>
              <span className='label'>First Name:</span>
              <span className='value'>{user?.firstName}</span>
            </p>
            <p className='detail'>
              <span className='label'>Last Name:</span>
              <span className='value'>{user?.lastName}</span>
            </p>
            <p className='detail'>
              <span className='label'>Phone Number:</span>
              <span className='value'>{user?.phone || 'Not provided'}</span>
            </p>
            
            <div className='buttons-container'>
              <Button onClick={() => setEditMode(true)} width='45%' className='small-font'>
                Edit Profile
              </Button>
              <Button onClick={() => navigate('/auth/change-password')} width='45%' className='small-font'>
                Change Password
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='other-details'>
            <h2>Edit Profile</h2>
            <div className='detail'>
              <span className='label'>First Name:</span>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className='detail'>
              <span className='label'>Last Name:</span>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className='detail'>
              <span className='label'>Phone Number:</span>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className='buttons-container'>
              <Button type="submit"  width='45%' className='small-font'>
                Save Changes
                </Button>
              <Button type="button" onClick={() => setEditMode(false)}  width='45%' className='small-font'>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      <AddressSection setMsg={setMsg} />
    </div>
  );
};

export default Profile;