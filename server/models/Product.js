const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select category'],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please enter product brand'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      min: [0, 'Price must be positive'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price must be positive'],
      validate: {
        validator: function (value) {
          // If discountPrice is set, it must be less than price
          return !value || value < this.price;
        },
        message: 'Discount price must be less than the regular price',
      },
    },
    sku: {
      type: String,
      required: [true, 'Please enter SKU'],
      unique: true,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Please enter stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    thumbnail: {
      type: String,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    sizes: [
      {
        type: String,
      },
    ],
    colors: [
      {
        type: String,
      },
    ],
    material: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Kids', 'Unisex'],
      default: 'Unisex',
    },
    weight: {
      type: String,
      default: '',
    },

    dimensions: {
      length: { type: String, default: '' },
      width: { type: String, default: '' },
      height: { type: String, default: '' },
    },
    availability: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-adjust availability based on stockQuantity
productSchema.pre('save', function (next) {
  this.availability = this.stockQuantity > 0;
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
