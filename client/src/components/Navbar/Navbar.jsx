import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.Styles.css';

import logo from '../../assets/logo.png';
import { FaRegHeart, FaRegUser } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  return (
    <nav className='navbar'>
      <div className='shop-routes'>
        <Link to="/">
          <div className='logo-container'>
            <img src={logo} />
          </div>
        </Link>
        <Link className='sub-heading' to="/products">
          Products
        </Link>
      </div>

      <div className='user-routes'>
        {isAuthenticated ? (
          <>
            <div className='dropdown-container'>
              <button className='drop-button'><FaRegUser /></button>
              <div className='dropdown-content'>
                <div className='user-info'>
                  <h3 className='user-name sub-heading'>{user.firstName + ' ' + user.lastName}</h3>
                  <p className='user-mail text'>{user.email}</p>
                </div>
                <hr />
                <ul className='links'>
                  <li className='sub-heading'><Link to="/profile">Profile</Link> </li>
                  <li className='sub-heading'><Link to="/addresses">Addresses</Link></li>
                  <li className='sub-heading'><Link to="/orders">Orders</Link></li>
                </ul>
                <hr />
                <button className='logout-button sub-heading' onClick={handleLogout}>Logout</button>
              </div>
            </div>
            <Link className='route-icon' to="/wishlist">
              <FaRegHeart />
            </Link>
            <Link className='route-icon' to="/cart">
              <FiShoppingCart />
            </Link>
            {/* {user?.role === 'admin' && (
              <Link to="/admin">
                Admin
              </Link>
            )} */}
          </>
          ) : (
          <>
            <Link className='sub-heading' to="/auth/login">
              Login
            </Link>
            <Link className='sub-heading' to="/auth/register">
              Register
            </Link>
          </>
          )}
      </div>
    </nav>
  );
};

export default Navbar;