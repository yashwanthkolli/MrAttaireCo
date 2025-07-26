const axios = require('axios');
const moment = require('moment');
const asyncHandler = require('../utils/async');
const ErrorResponse = require('../utils/errorResponse');

// Get Shiprocket Auth Token
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

// Helper: Parse Shiprocket's ETD date (supports "MMM DD, YYYY" or similar)
const parseShiprocketDate = (dateString) => {
  if (!dateString) return null;
  
  // Try common Shiprocket formats (add more if needed)
  const formats = [
    "MMM DD, YYYY",   // "Jul 31, 2025"
    "YYYY-MM-DD",      // "2025-07-31"
    "DD-MM-YYYY",      // "31-07-2025"
  ];

  const date = moment(dateString, formats, true); // Strict mode
  return date.isValid() ? date : null;
};

// @desc    Fetch Shipping Estimate from Shiprocket
// @route   GET /api/v1/shipping
// @access  Private
exports.getShippingOptions = asyncHandler(async (req, res, next) => {
  const { deliveryPincode } = req.query;
  const weight = req.body.weight || 0.5;

  if (!deliveryPincode) {
    return next(new ErrorResponse('Delivery pincode is required', 400));
  }

  try {
    const token = await getShiprocketToken();
    
    // const response = await axios.get(
    //   'https://apiv2.shiprocket.in/v1/external/courier/serviceability',
    //   {
    //     params: {
    //       pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE,
    //       delivery_postcode: deliveryPincode,
    //       weight,
    //       cod: 0,  // 0 for prepaid, 1 for COD
    //     },
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //     },
    //   }
    // );

    // const options = response.data.data.available_courier_companies.map(option => ({
    //   courierId: option.courier_id,
    //   name: option.courier_name,
    //   price: option.rate,
    //   etd: option.etd,  // Estimated delivery time (e.g., "3-5 days")
    // }));

    // // Extract all ETD strings (e.g., "3-5 days")
    // const etds = options
    //   .map(option => parseShiprocketDate(option.etd))
    //   .filter(date => date !== null);  // Validate dates

    // if (etds.length === 0) {
    //   return res.json({ etd: null }); // No valid dates
    // }

    // const latestDate = moment.max(etds);

    // res.status(200).json({ etd: latestDate.format('MMMM Do YYYY') }); 

    res.status(200).json({token})

  } catch (error) {
    console.log(error)
    return next(
      new ErrorResponse(`Failed to fetch shipping options`, 500)
    );
  }
})