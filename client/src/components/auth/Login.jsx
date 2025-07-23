import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import GoogleLoginButton from './GoogleLogin';

import './Login.css';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { FaEye } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

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
      navigate(-1);
    } else {
      if(error.message === 'Please verify your email first') setIsVerificationError(true)
      setError(error.message || 'Login failed');
    }
  };
  
  return (
    <div className='login-container'>
      <h2 className='heading'>Welcome Back</h2>
      <p className='sub-heading'>Please Enter Your Details</p>
      {isVerificationError ? 
        <>
        <p style={{ color: 'red' }}>Please verify your email before logging in. Check your email for the verification link.</p>
        <div>
            {!showResend ? (
            <button onClick={() => {
                setShowResend(true);
                setResendEmail(formData.email);
            }}>
                Resend verification email
            </button>
            ) : (
            <div>
                <p>We'll send a new verification link to {formData.email}</p>
                <button onClick={resendVerification}>Confirm Resend</button>
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
          icon={<FaEye onClick={() => setPasswordVisible(prev => !prev)} />}
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