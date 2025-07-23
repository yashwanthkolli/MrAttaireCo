import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { FaEye } from 'react-icons/fa';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Check token validity when component mounts
  useEffect(() => {
    const checkToken = async () => {
      try {
        await API.get(`/auth/checkresettoken/${resetToken}`);
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
        setError('Invalid or expired token');
      }
    };
    checkToken();
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await API.put(`/auth/resetpassword/${resetToken}`, { password });
      setMessage(res.data.message || 'Password reset successfully');
      setTimeout(() => navigate('/auth/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
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
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/auth/forgotpassword')}>
          Request new reset link
        </button>
      </div>
    );
  }

  return (
    <div className='login-container'>
      <h2 className='heading'>Reset Password</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
          icon={<FaEye onClick={() => setPasswordVisible(prev => !prev)} />}
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