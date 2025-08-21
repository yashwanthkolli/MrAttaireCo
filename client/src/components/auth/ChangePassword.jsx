import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Message from '../Message/Message';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { updatePassword } = useContext(AuthContext);
  const [msg, setMsg] = useState({type: '', text: ''});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMsg({type: 'error', text: 'Passwords do not match'});
      return;
    }

    try {
      const updateStatus = await updatePassword({ currentPassword, newPassword });
      if (updateStatus.success) {
        setMsg({type: 'success', text: 'Password changed successfully'});
        setTimeout(() => navigate('/profile'), 1500);
      }  else { 
        setMsg({type: 'error', text: updateStatus.error.message});
      }
    } catch (err) {
      setMsg({type: 'error', text: err.response?.data?.message || 'Password change failed'});
    }
  };

  return (
    <div className='login-container'>
      {/* Success/Error Message */}
      {msg.text && (
        <Message 
          type={msg.type} 
          message={msg.text} 
          onClose={() => setMsg({ type: '', text: '' })} 
          duration={3000}
        />
      )}

      <h2 className='heading'>Change Password</h2>
      <p className='sub-heading'>Please Fill In Your Details</p>
      
      <form onSubmit={handleSubmit}>
        <div>
          <Input
            name="password"
            label="Current Password"
            type={currentPasswordVisible ? "text" :"password"}
            icon={currentPasswordVisible ? <FaEyeSlash onClick={() => setCurrentPasswordVisible(prev => !prev)} /> : <FaEye onClick={() => setCurrentPasswordVisible(prev => !prev)} />}
            iconPosition='right'
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder='Current Password'
            required
          />
        </div>
        <div>
          <Input
            name="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder='New Password'
            required
            minLength="6"
          />
        </div>
        <div>
          <Input
            name="confirmPassword"
            label="Confirm New Password"
            type="text"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder='Confirm New Password'
            required
            minLength="6"
          />
        </div>
        <Button type="submit">Change Password</Button>
        <Button type="button" onClick={() => navigate('/profile')} variant='secondary'>
          Cancel
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;