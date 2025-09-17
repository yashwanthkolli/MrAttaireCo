const axios = require('axios');
const getShiprocketToken = require('./getShipRocketToken');

const createShiprocketOrder = async (order) => {
  const token = await getShiprocketToken();
  
  // Map order items to Shiprocket format
  const orderItems = order.items.map(item => ({
    name: item.product.name, // You'll need to populate this field
    sku: item.product.sku || `SKU-${item.product._id.toString()}`,
    units: item.quantity,
    selling_price: item.priceAtAddition,
    discount: "",
    tax: "",
    hsn: "" // You might want to add HSN codes to your products
  }));

  const payload = {
    order_id: order._id.toString(),
    order_date: order.createdAt.toISOString().split('T')[0],
    pickup_location: "work", // Your pickup location name in Shiprocket
    billing_customer_name: order.shippingAddress.recipientName,
    billing_last_name: "",
    billing_address: order.shippingAddress.street,
    billing_address_2: "",
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.zipCode,
    billing_state: order.shippingAddress.state,
    billing_country: order.shippingAddress.country || "India",
    billing_email: order.user.email,
    billing_phone: order.shippingAddress.phoneNumber,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    shipping_charges: order.shippingCost,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: order.couponUsed?.discountValue || 0,
    sub_total: order.subtotal,
    length: 16, // Default values - adjust as needed
    breadth: 12,
    height: 2,
    weight: 0.1
  };

  try {
    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Shiprocket order creation failed:', error.response?.data);
    throw new Error('Failed to create Shiprocket order');
  }
};

module.exports = createShiprocketOrder;