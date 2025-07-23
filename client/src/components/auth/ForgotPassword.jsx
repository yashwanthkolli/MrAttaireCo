import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../utils/api';
import Button from '../Button/Button';
import Input from '../Input/Input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await API.post('/auth/forgotpassword', { email });
      setMessage(res.data.data || 'Password reset email sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <h2 className='heading'>Forgot Password?</h2>
      <p className='sub-heading'>Please Enter Your Email Id To Recieve Reset Link</p>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          name="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      <p className='others text'>
        Remember Your Password? &nbsp;<Link to='/auth/login'>Login In</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;