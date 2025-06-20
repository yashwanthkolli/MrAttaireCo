import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      navigate('/');
    } else {
      navigate('/auth/login');
    }
  }, [location, navigate]);

  return <div>Processing Google login...</div>;
};

export default GoogleCallback;