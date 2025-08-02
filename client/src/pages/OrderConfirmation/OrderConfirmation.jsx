import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { CheckCircle, Truck, Clock } from 'react-feather'; // Icons (install: npm install react-feather)
import API from '../../utils/api';

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

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!order) return <div className="text-center py-12">Order not found.</div>;

  console.log(order)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        {/* <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /> */}
        <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">
          Your payment was successful. Order ID: <span className="font-mono">{order._id}</span>
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700">Shipping Address</h3>
            <p className="text-gray-600">
              {order.shippingAddress?.street},<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Payment Details</h3>
            <p className="text-gray-600">
              ₹{order.total.toFixed(2)}<br />
              Paid via {order.paymentMethod}
            </p>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Items Ordered</h2>
        {order.items.map((item) => (
          <div key={item._id} className="flex py-4 border-b">
            <img
              src={item.product.images[1].url}
              alt={item.product.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="ml-4">
              <h3 className="font-medium">{item.product.name}</h3>
              <p className="text-gray-600">
                {item.variant.color} / {item.variant.size} × {item.quantity}
              </p>
              <p>₹{(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          {/* <Truck className="mr-2" /> What's Next? */}
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            {/* <Clock className="w-5 h-5 text-blue-500 mr-2 mt-0.5" /> */}
            <span>
              <strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toDateString()}
            </span>
          </li>
          <li>
            You’ll receive a confirmation email shortly. Contact support if you have questions.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OrderConfirmation;