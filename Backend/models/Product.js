const { min } = require('moment/moment');
const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [120, 'Name cannot exceed 120 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  information: {
    type: String,
    required: [true, 'Please add a information']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be at least 0']
  },
  retailPrice: {
    type: Number, 
    min: [0, 'Price must be at least 0']
  },
  discountedPrice: {
    type: Number,
    validate: {
      validator: function(value) {
        return value < this.price;
      },
      message: 'Discounted price must be below regular price'
    }
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'tshirts',
      'shirts',
      'trackpants',
      'jogger',
      'winterwear',
      'shorts',
      'dresses',
      'jackets',
      'accessories',
      'footwear'
    ]
  },
  variants: [{
    color: {
      type: String,
      required: true
    },
    sizes: [{
      size: {
        type: String,
        required: true,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      stock: {
        type: Number,
        required: true,
        min: 0
      }
    }]
  }],
  sold: {
    type: Number,
    default: 0
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  ratings: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create product slug from name before saving
productSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Cascade delete product reviews when product is deleted
productSchema.pre('remove', async function(next) {
  await this.model('Review').deleteMany({ product: this._id });
  next();
});

module.exports = mongoose.model('Product', productSchema);