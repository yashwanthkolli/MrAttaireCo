import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';

import './OrderConfirmation.Styles.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${orderId}`);
        setOrder(data.order);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="order-confirmation loading">Loading...</div>;
  if (!order) return <div className="order-confirmation error">Order not found.</div>;

  return (
    <>
    {
      order.paymentStatus === 'paid'  || order.paymentMethod === 'cod' ?
      <div className="order-confirmation">
        {/* Header */}
        <div className="order-header">
          <h1 className="order-title">Order Confirmed!</h1>
          <p className="order-subtitle">
            Your payment was successful. Order ID: <span className="order-id">{order._id}</span>
          </p>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2 className="section-heading">Order Summary</h2>
          <div className="summary-details">
            <div className="summary-box">
              <h3 className="summary-title">Shipping Address</h3>
              <p className="summary-text">
                {order.shippingAddress?.street},<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.zipCode},<br />
                {order.shippingAddress?.country}
              </p>
            </div>
            <div className="summary-box">
              <h3 className="summary-title">Payment Details</h3>
              <p className="summary-text">
                {order.currency + ' ' + order.total.toFixed(2)} <br />
                Paid via {order.paymentMethod}
              </p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="order-items">
          <h2 className="section-heading">Items Ordered</h2>
          {order.items.map((item) => (
            <div className="item-card" key={item._id}>
              <img
                src={item.product.images[1].url}
                alt={item.product.name}
                className="item-image"
              />
              <div className="item-details">
                <h3 className="item-name">{item.product.name}</h3>
                <p className="item-variant">
                  {item.variant.color} / {item.variant.size} × {item.quantity}
                </p>
                {/* <p className="item-price">
                  {order.currency + ' ' + (item.priceAtAddition * item.quantity).toFixed(2)}
                </p> */}
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="order-next-steps">
          <ul>
            <li>
              <span className="next-step">
                <strong>Estimated Delivery:</strong>{' '}
                {order.estimatedDelivery}
              </span>
            </li>
            <li className="next-step">
              You’ll receive a confirmation email shortly. Contact support if you have questions.
            </li>
          </ul>
        </div>
      </div>
      :
      <div className='order-confirmation error'>Order is not confirmed. Payment pending.</div>
    }
    </>
  );
};

export default OrderConfirmation;
