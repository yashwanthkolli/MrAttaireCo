const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    res.status(err.statusCode ? err.statusCode : 500).json({...err, message: err.message})
  });
};

module.exports = asyncHandler;