import { Outlet } from 'react-router-dom';

const AuthPage = () => {
  return (
    <div>
      <h1>Mr. Attire & Co.</h1>
      <Outlet />
    </div>
  );
};

export default AuthPage;