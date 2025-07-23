const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'priceMin', 'priceMax', 'colors', 'sizes'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Handle price filters
  if (req.query.priceMin || req.query.priceMax) {
    reqQuery.price = {};
    if (req.query.priceMin) reqQuery.price.$gte = Number(req.query.priceMin);
    if (req.query.priceMax) reqQuery.price.$lte = Number(req.query.priceMax);
  }

  // Create base query object
  const transformedQuery = {};
  for (let key in reqQuery) {
    // Handle operator queries (price[gte], price[lte], etc.)
    if (key.includes('[') && key.includes(']')) {
      const field = key.split('[')[0];
      const operator = key.match(/\[(.*?)\]/)[1];
      const value = reqQuery[key];

      if (!transformedQuery[field]) {
        transformedQuery[field] = {};
      }

      // Convert numeric fields
      const numericFields = ['price', 'discountedPrice', 'ratings', 'sold'];
      if (numericFields.includes(field)) {
        transformedQuery[field]['$'+operator] = Number(value);
      } else {
        transformedQuery[field]['$'+operator] = value;
      }
    } else {
      // Regular fields
      transformedQuery[key] = reqQuery[key];
    }
  }

  // Handle color filtering with new variants structure
  if (req.query.colors) {
    const colors = req.query.colors.split(',');
    transformedQuery['variants.color'] = { $in: colors };
  }

  // Handle size filtering with new variants structure
  if (req.query.sizes) {
    const sizes = req.query.sizes.split(',');
    transformedQuery['variants.sizes.size'] = { $in: sizes };
    
    // Optional: Only show products with available stock for the size
    // transformedQuery['variants.sizes.stock'] = { $gt: 0 };
  }

  // Finding resource
  query = model.find(transformedQuery);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(transformedQuery);

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;