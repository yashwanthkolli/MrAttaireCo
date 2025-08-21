import { useCart } from '../../context/CartContext';
import CartItem from '../../components/CartItem/CartItem';
import CartSummary from '../../components/CartSummary/CartSummary';
import { Link } from 'react-router-dom';
import { MdOutlineError } from 'react-icons/md';

import './Cart.Styles.css';

const Cart = () => {
  const { 
    cart, 
    loading, 
    error, 
    isGuestCart
  } = useCart();

  if (error) return <div>{error}</div>;

  return (
    <div className='cart-page'>
      <h1 className='heading'>
        Shopping Cart
      </h1>

      {
        !loading ? 
          cart?.items?.length > 0 ? (
            <div>
              {/* Guest user notice */}
              {isGuestCart && (
                <div className='guest-warning'>
                  <MdOutlineError />{' '}
                  You're shopping as a guest.{' '}
                  <Link to="/auth">
                    Login
                  </Link>{' '}
                  to save your cart.
                </div>
              )}

              {/* Cart items list */}
              <div className='items-list'>
                {cart.items.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
                <i aria-hidden={true}></i>
              </div>
              
              {/* Order summary */}
              <div className='cart-summary-container'>
                <CartSummary />
              </div>
            </div>
          ) : (
            <div>Cart is Empty</div>
          )
        :
        <div>Loading...</div>
      }
    </div>
  );
};

export default Cart;