import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import GoogleLoginButton from './GoogleLogin';

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
    <div>
      <h2>Login</h2>
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
      <GoogleLoginButton />
      <form onSubmit={handleSubmit}>
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
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <Link to='/auth/forgotpassword'>Forgot Password?</Link>
      <p>
        Don't have an account? <button onClick={() => navigate('/auth/register')}>Sign Up</button>
      </p>
    </div>
  );
};

export default Login;