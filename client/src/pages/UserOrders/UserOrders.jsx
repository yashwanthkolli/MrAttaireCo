import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import './UserOrders.Styles.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get('/orders/my-orders');
        if (!response.data.success) throw new Error('Failed to fetch orders');
        setOrders(response.data.orders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // if (loading) return <div className="orders-message">Loading orders...</div>;
  // if (error) return <div className="orders-message error">Error: {error}</div>;
  // if (orders.length === 0) return <div className="orders-message">No orders found</div>;

  return (
    <div className="orders-page">
      <h1 className="heading">My Orders</h1>
      <div className='order-card-container'>
        {orders.map(order => (
          <div 
            key={order._id} 
            className="order-card"
            // onClick={() => handleOrderClick(order._id)}
          >
            <div className="order-header">
              <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
              <span className={`order-status ${order.status}`}>{order.status}</span>
            </div>

            <div className="order-meta">
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})</p>
              <p><strong>Total:</strong> {order.currency + ' ' + order.total.toFixed(2)}</p>
            </div>

            <div className="order-items">
              {order.items.map(item => (
                <div key={item._id} className="order-item">
                  <img 
                    src={item.product.images.find(img => img.isPrimary)?.url || item.product.images[0].url} 
                    alt={item.product.name} 
                    className="order-item-img"
                  />
                  <div className="order-item-details">
                    <p className="item-name">{item.product.name}</p>
                    <p className="item-variant">Color: {item.variant.color}, Size: {item.variant.size}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-shipping">
              <p><strong>Shipping to:</strong> {order.shippingAddress.recipientName}</p>
              <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
              <p>{order.shippingAddress.state}, {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phoneNumber}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrders;
