import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import { FaRegHeart, FaRegUser } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import NavbarSearch from '../NavbarSearch/NavbarSearch';
import CountrySelector from '../CountrySelector/CountrySelector';

import './Navbar.Styles.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  return (
    <nav className='navbar'>
      <div className='shop-routes'>
        <Link to="/" aria-label='Home'>
          <div className='logo-container'>
            <img src={logo} alt='MrAttire-logo' />
          </div>
        </Link>
        <Link className='sub-heading' to="/products">
          Products
        </Link>
        
      </div>

      <NavbarSearch />

      <div className='user-routes'>
        {isAuthenticated ? (
          <>
            <div className='dropdown-container'>
              <button className='drop-button' aria-label='User'><FaRegUser /></button>
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
          <Link className='route-icon' to="/wishlist" aria-label='Wishlist'>
            <FaRegHeart />
            {
              wishlistCount > 0 &&
              <span className='value wishlist'>{wishlistCount < 9 ? wishlistCount : '9+'}</span>
            }
          </Link>
          <Link className='route-icon' to="/cart" aria-label='Cart'>
            <FiShoppingCart /> 
            {
              totalItems > 0 &&
              <span className='value cart'>{totalItems < 9 ? totalItems : '9+'}</span>
            }
          </Link>
          <CountrySelector />
      </div>
    </nav>
  );
};

export default Navbar;