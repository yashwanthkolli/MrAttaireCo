import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get('/orders/my-orders');
        
        if (!response.data.success) {
          throw new Error('Failed to fetch orders');
        }
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

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;
  if (orders.length === 0) return <div>No orders found</div>;

  return (
    <div>
      <h1>My Orders</h1>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr 
              key={order._id} 
              onClick={() => handleOrderClick(order._id)}
              style={{ cursor: 'pointer' }}
            >
              <td>{order._id}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>{order.status}</td>
              <td>₹{order.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserOrders;