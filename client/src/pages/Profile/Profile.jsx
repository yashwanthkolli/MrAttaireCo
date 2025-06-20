import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateDetails } = useContext(AuthContext);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      setMessage('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Profile</h1>
      
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!editMode ? (
        <div>
          <h2>Personal Information</h2>
          <p>Name: {user?.firstName} {user?.lastName}</p>
          <p>Email: {user?.email}</p>
          <p>Phone: {user?.phone || 'Not provided'}</p>
          
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
          <button onClick={() => navigate('/change-password')}>
            Change Password
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Edit Profile</h2>
          <div>
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditMode(false)}>
            Cancel
          </button>
        </form>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Addresses</h2>
        {user?.addresses?.length > 0 ? (
          <div>
            {user.addresses.map((address, index) => (
              <div key={index} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
                {address.isDefault && <p>Default Address</p>}
              </div>
            ))}
          </div>
        ) : (
          <p>No addresses saved</p>
        )}
        <button onClick={() => navigate('/add-address')}>
          Add New Address
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Order History</h2>
        <p>Feature coming soon!</p>
      </div>
    </div>
  );
};

export default Profile;