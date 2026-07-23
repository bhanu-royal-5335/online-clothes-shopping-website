const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadImage } = require('../middleware/upload');

// @desc    Fetch all products with advanced filtering and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 8;
    const page = Number(req.query.page) || 1;

    // Search Query matching name/brand/description
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { brand: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    // Filter by category slug or ObjectId
    let categoryQuery = {};
    if (req.query.category) {
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        categoryQuery = { category: req.query.category };
      } else {
        const cat = await Category.findOne({ slug: req.query.category });
        if (cat) {
          categoryQuery = { category: cat._id };
        }
      }
    }

    // Filter by Brand
    const brandQuery = req.query.brand ? { brand: { $regex: req.query.brand, $options: 'i' } } : {};

    // Filter by Price range
    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || Infinity;
    const priceQuery = { price: { $gte: minPrice, $lte: maxPrice } };

    // Filter by rating
    const ratingQuery = req.query.rating ? { ratings: { $gte: Number(req.query.rating) } } : {};

    // Filter by availability
    const stockQuery = req.query.inStock === 'true' ? { stockQuantity: { $gt: 0 } } : {};

    // Filter by Discount
    const discountQuery = req.query.discount === 'true' ? { discountPrice: { $exists: true, $ne: null } } : {};

    // Filter by sizes (e.g. sizes=S,M,L)
    const sizesQuery = req.query.sizes ? { sizes: { $in: req.query.sizes.split(',') } } : {};

    // Filter by colors (e.g. colors=Black,Camel)
    const colorsQuery = req.query.colors ? { colors: { $in: req.query.colors.split(',') } } : {};

    // Filter by gender
    const genderQuery = req.query.gender ? { gender: req.query.gender } : {};

    // Combine queries
    const query = {
      ...keyword,
      ...categoryQuery,
      ...brandQuery,
      ...priceQuery,
      ...ratingQuery,
      ...stockQuery,
      ...discountQuery,
      ...sizesQuery,
      ...colorsQuery,
      ...genderQuery,
    };

    // Sort order
    let sort = {};
    if (req.query.sort === 'priceAsc') {
      sort = { price: 1 };
    } else if (req.query.sort === 'priceDesc') {
      sort = { price: -1 };
    } else if (req.query.sort === 'rating') {
      sort = { ratings: -1 };
    } else {
      sort = { createdAt: -1 }; // Default: Latest
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize), count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      discountPrice,
      description,
      category,
      brand,
      stockQuantity,
      sku,
      specifications,
      weight,
      length,
      width,
      height,
      subcategory,
      sizes,
      colors,
      material,
      gender,
    } = req.body;

    const specificationsParsed = specifications ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications) : [];
    
    // Parse sizes and colors if sent as JSON string or array
    const sizesParsed = sizes ? (typeof sizes === 'string' ? JSON.parse(sizes) : sizes) : [];
    const colorsParsed = colors ? (typeof colors === 'string' ? JSON.parse(colors) : colors) : [];

    const product = new Product({
      name,
      price,
      discountPrice: discountPrice || undefined,
      description,
      user: req.user._id,
      category,
      subcategory: subcategory || '',
      brand,
      stockQuantity,
      sku,
      specifications: specificationsParsed,
      sizes: sizesParsed,
      colors: colorsParsed,
      material: material || '',
      gender: gender || 'Unisex',
      weight: weight || '',
      dimensions: { length: length || '', width: width || '', height: height || '' },
      images: [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      discountPrice,
      description,
      category,
      brand,
      stockQuantity,
      sku,
      specifications,
      weight,
      length,
      width,
      height,
      subcategory,
      images,
      sizes,
      colors,
      material,
      gender,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.discountPrice = discountPrice === '' ? undefined : (discountPrice || product.discountPrice);
      product.description = description || product.description;
      product.category = category || product.category;
      product.subcategory = subcategory || product.subcategory;
      product.brand = brand || product.brand;
      product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
      product.sku = sku || product.sku;
      product.weight = weight || product.weight;
      product.images = images || product.images;
      product.material = material !== undefined ? material : product.material;
      product.gender = gender !== undefined ? gender : product.gender;

      if (sizes) {
        product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      }
      if (colors) {
        product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      }

      if (specifications) {
        product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      }

      if (length || width || height) {
        product.dimensions = {
          length: length || product.dimensions.length,
          width: width || product.dimensions.width,
          height: height || product.dimensions.height,
        };
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {

      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: req.params.id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
      product.ratings =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ ratings: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload multiple product images
// @route   POST /api/products/upload
// @access  Private/Admin
const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded' });
    }

    const urls = [];
    for (const file of req.files) {
      const url = await uploadImage(file);
      urls.push(url);
    }

    res.json({ urls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  uploadProductImages,
};
