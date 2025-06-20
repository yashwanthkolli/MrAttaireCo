import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const VerifyEmail = () => {
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await API.get(`/auth/verifyemail/${verificationToken}`);
        setIsSuccess(true);
        setMessage(res.data.message || 'Email verified successfully!');
        
        // Redirect to login after 10 seconds
        setTimeout(() => {
          navigate('/auth/login');
        }, 10000);
      } catch (err) {
        setIsSuccess(false);
        // setMessage(err.response?.data?.message || 'Email verification failed. The link may be invalid or expired.');
      }
    };

    verifyEmail();
  }, [verificationToken, navigate]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p style={{ color: isSuccess ? 'green' : 'red' }}>{message}</p>
      {isSuccess && (
        <p>You will be redirected to the login page shortly...</p>
      )}
      {!isSuccess && (
        <button onClick={() => navigate('/auth/register')}>
          Go to registration page
        </button>
      )}
    </div>
  );
};

export default VerifyEmail;