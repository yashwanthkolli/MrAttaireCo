import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { FiTrash2 } from 'react-icons/fi';

import './CartItem.Styles.css';
import { Link } from 'react-router-dom';
import { useCountry } from '../../context/CountryContext';
import API from '../../utils/api';

const CartItem = ({ item }) => {
  const { country } = useCountry()
  const { updateCartItem, removeFromCart } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    setCurrentPrice(item.discountedPriceAtAddition || item.priceAtAddition);
  }, [])

  useEffect(() => {
    const convertPrices = async () => {
      await API.get('/country/convert', {
        params: {
          priceInr: item.discountedPriceAtAddition || item.priceAtAddition,
          countryCode: country?.code
        }
      })
      .then(res => setCurrentPrice(res.data.value))
      .catch(err => setError(err))
    }

    if (country?.code !== 'IN') {
      convertPrices();
    }
  }, [country, quantity])

  const totalPrice = (currentPrice * quantity).toFixed(2);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    
    setIsUpdating(true);
    setQuantity(newQuantity);
    await updateCartItem(item._id, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    await removeFromCart(item._id);
  };

  return (
    <div className='cart-item'>
      <div className='img-container'>
        <img
          src={item.product.images[0]?.url}
          alt={item.product.name}
        />
      </div>

      <div className='details-container'>
        <div className='info'>
          <Link to={`/product/${item.product._id}`}>
            <h3 className='name sub-heading'>
              {item.product.name}
            </h3>
          </Link>
          <p className='price sub-heading'>{country.symbol ? country.symbol : '₹'}{totalPrice}</p>
          <p className='varient text'>
            <span className='color'>{item.variant.color}</span>
            {' '}/{' '}
            <span className='size'>{item.variant.size}</span>
          </p>
        </div>

        <div className='buttons-container'>
          <div className='quantity-container'>
            <button 
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
              className='quantity-btn'
            >
              -
            </button>
            <span className='quantity sub-heading'>
              {isUpdating ? '...' : quantity}
            </span>
            <button 
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
              className='quantity-btn'
            >
              +
            </button>
          </div>

          
          <button
            onClick={handleRemove}
            className="delete-item sub-heading"
          >
            <FiTrash2 className="mr-1" /> <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;