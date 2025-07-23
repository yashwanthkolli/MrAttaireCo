import { Outlet } from 'react-router-dom';

import './Auth.Styles.css';

const AuthPage = () => {
  return (
    <div className='auth-page'>
      <div className='auth-container'>
        <div className='logo heading'>
          Mr Attire & Co
        </div>
        <Outlet />
      </div>  
    </div>
  );
};

export default AuthPage;