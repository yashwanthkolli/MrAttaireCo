import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Message from '../Message/Message';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({type: '', text: ''});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({type: '', text: ''});

    try {
      const res = await API.post('/auth/forgotpassword', { email });
      setMsg({type: 'success', text: res.data.data || 'Password reset email sent'});
    } catch (err) {
      setMsg({type: 'error', text: err.response?.data?.message || 'Failed to send reset email'});
    } finally {
      setIsLoading(false);
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
      <h2 className='heading'>Forgot Password?</h2>
      <p className='sub-heading'>Please Enter Your Email Id To Recieve Reset Link</p>
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
        Remember Your Password?&nbsp;<Link to='/auth' style={{marginLeft: 0}}>Login In</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;