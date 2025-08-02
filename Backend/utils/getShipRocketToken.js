const axios = require('axios');

const getShiprocketToken = async () => {
  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });
    return response.data.token;
  } catch (error) {
    console.error('Shiprocket auth failed:', error.response?.data);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

module.exports = getShiprocketToken;