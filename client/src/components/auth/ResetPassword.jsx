import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Message from '../Message/Message';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Check token validity when component mounts
  useEffect(() => {
    const checkToken = async () => {
      try {
        await API.get(`/auth/checkresettoken/${resetToken}`);
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
        setMsg({type: 'error', text: 'Invalid or expired token'});
      }
    };
    checkToken();
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMsg({type: 'error', text: 'Passwords do not match'});
      return;
    }

    setIsLoading(true);
    setMsg({type: '', text: ''});

    try {
      const res = await API.put(`/auth/resetpassword/${resetToken}`, { password });
      setMsg({type: 'success', text: res.data.message || 'Password reset successfully'});
      setTimeout(() => navigate('/auth'), 2000);
    } catch (err) {
      setMsg({type: 'error', text: err.response?.data?.message || 'Failed to reset password'});
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return <div>Checking token...</div>;
  }

  if (!tokenValid) {
    return (
      <div>
        <h2>Reset Password</h2>
        <p style={{ color: 'red' }}>{msg.text}</p>
        <Button onClick={() => navigate('/auth/forgotpassword')}>
          Request new reset link
        </Button>
      </div>
    );
  }

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
      <h2 className='heading'>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <Input
          name="newpassword"
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='New Password'
          required
          minLength="6"
        />
        <Input
          name="password"
          label="Confirm Password"
          type={passwordVisible ? "text" :"password"}
          icon={passwordVisible ? <FaEyeSlash onClick={() => setPasswordVisible(prev => !prev)} /> : <FaEye onClick={() => setPasswordVisible(prev => !prev)} />}
          iconPosition='right'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Confirm Password'
          required
          minLength="6"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;