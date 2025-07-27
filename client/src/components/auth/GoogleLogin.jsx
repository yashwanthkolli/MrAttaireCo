import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { FcGoogle } from 'react-icons/fc';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
          try {
            // Send the credential to your backend
            const res = await window.open(
                // `http://localhost:5000/api/v1/auth/google`,
                'https://mrattireco.com/backend/api/v1/auth/google',
                '_self' // Opens in same tab
            )
            
            // Store token and redirect
            localStorage.setItem('token', res.data.token);
            navigate('/');
          } catch (err) {
            console.error('Google login failed:', err);
          }
        }, 
    onError: () => {
      console.log('Google login failed');
    }
  })

  return (
    // <GoogleOAuthProvider clientId={'244554571154-ppp0ve2f3v2ufqp4re0mhcqvii799v4q.apps.googleusercontent.com'}>
    //   <GoogleLogin
    //     onSuccess={async (credentialResponse) => {
    //       try {
    //         // Send the credential to your backend
    //         const res = await window.open(
    //             // `http://localhost:5000/api/v1/auth/google`,
    //             'https://mrattireco.com/backend/api/v1/auth/google',
    //             '_self' // Opens in same tab
    //         )
            
    //         // Store token and redirect
    //         localStorage.setItem('token', res.data.token);
    //         navigate('/');
    //       } catch (err) {
    //         console.error('Google login failed:', err);
    //       }
    //     }}
    //     onError={() => {
    //       console.log('Google login failed');
    //     }}
    //   />
      
    // </GoogleOAuthProvider>
    <button className='google-button' onClick={() => login()}>
      <span className='icon'><FcGoogle /></span>
      <span className='text'>Sign in with Google</span>
    </button>
  );
};

export default GoogleLoginButton;