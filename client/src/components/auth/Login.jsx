import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import GoogleLoginButton from './GoogleLogin';

import './Login.css';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Message from '../Message/Message';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isVerificationError, setIsVerificationError] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const resendVerification = async () => {
    try {
      const res = await API.post('/auth/resendverification', { email: resendEmail });
      setSuccess(res.data.message || 'Verification email resent successfully!');
      setShowResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { success, error } = await login(formData);

    if (success) {
      setMsg({ type: 'success', text: 'Login Successful!' });
      navigate(-1);
    } else {
      setMsg({ type: 'error', text: error.message || 'Login failed' });
      if(error.message === 'Please verify your email first') setIsVerificationError(true)
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
      <h2 className='heading'>Welcome Back</h2>
      <p className='sub-heading'>Please Enter Your Details</p>
      {isVerificationError ? 
        <>
        <p className='error-message'>Please verify your email before logging in. Check your inbox for the verification link, or click the button below to resend it.</p>
        <div style={{marginBottom: '5rem'}}>
            {!showResend ? (
            <Button onClick={() => {
                setShowResend(true);
                setResendEmail(formData.email);
            }}>
                Resend verification email
            </Button>
            ) : (
            <div>
                <p className='text'>We'll send a new verification link to <b>{formData.email}</b></p>
                <Button onClick={resendVerification}>Confirm Resend</Button>
            </div>
            )}
        </div>
        </>
        : <></>
      }
      {error && !isVerificationError ? <div style={{ color: 'red' }}>{error}</div> : <></>}
      <form onSubmit={handleSubmit}>
        <Input
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          placeholder='Email'
          required
        />

        <Input
          name="password"
          label="Password"
          type={passwordVisible ? "text" :"password"}
          icon={passwordVisible ? <FaEyeSlash onClick={() => setPasswordVisible(prev => !prev)} /> : <FaEye onClick={() => setPasswordVisible(prev => !prev)} />}
          iconPosition='right'
          value={formData.password}
          onChange={handleChange}
          placeholder='Password'
          required
        />
        <div className='forgot-password'>
          <Link className='text' to='/auth/forgotpassword'>Forgot Password?</Link>
        </div>
        <Button type="submit">Login</Button>
      </form>

      <div className='or'>
        <hr />
        <span>Or</span>
      </div>

      <GoogleLoginButton />

      <p className='others text'>
        <Link to='/auth/register'>Sign Up</Link>
        <Link to='/pages/termsandconditions'>Terms</Link>
      </p>
    </div>
  );
};

export default Login;