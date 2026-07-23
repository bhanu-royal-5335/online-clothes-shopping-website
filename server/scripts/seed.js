const mongoose = require('mongoose');
const dns = require('dns');

// Override DNS servers to Google DNS to bypass dead OS resolver
dns.setServers(['8.8.8.8', '8.8.4.4']);

const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcart');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing database entries!');

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@smartcart.com',
      password: 'admin123password',
      role: 'admin',
      isVerified: true,
    });

    const customerUser = await User.create({
      name: 'Jane Doe',
      email: 'customer@smartcart.com',
      password: 'customer123password',
      role: 'customer',
      isVerified: true,
    });

    console.log('Seeded User accounts:');
    console.log(`- Admin: ${adminUser.email} (password: admin123password)`);
    console.log(`- Customer: ${customerUser.email} (password: customer123password)`);

    // 2. Seed Categories (Men, Women, Kids)
    const categoriesToSeed = [
      {
        name: 'Men',
        slug: 'men',
        description: 'Premium tailored suits, outerwear, trousers, and casual shirting for men',
        image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Women',
        slug: 'women',
        description: 'Elegant evening wear, trench coats, luxury knitwear, and dresses for women',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Kids',
        slug: 'kids',
        description: 'Soft organic cotton hoodies, playwear, and outerwear for children',
        image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=400&q=80',
      },
    ];

    const seededCategories = await Category.insertMany(categoriesToSeed);
    console.log(`Seeded ${seededCategories.length} product categories.`);

    // Map categories by slug for convenient product assignment
    const catMap = {};
    seededCategories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    // 3. Seed Products (Premium Clothing & Fashion)
    const productsToSeed = [
      {
        name: 'Premium Cashmere Trench Coat',
        description: 'Crafted from the finest 100% Mongolian cashmere. Features double-breasted button panels, adjustable waist tie, and premium silk inner lining for supreme cold-weather styling.',
        category: catMap['women'],
        subcategory: 'Outerwear',
        brand: 'Aurelia Lux',
        price: 349.99,
        discountPrice: 299.99,
        sku: 'RAIN-COAT-001',
        stockQuantity: 15,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Camel', 'Beige', 'Black'],
        material: '100% Cashmere',
        gender: 'Women',
        images: [
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
        ],
        specifications: [
          { key: 'Material', value: '100% Cashmere' },
          { key: 'Lining', value: '100% Mulberry Silk' },
          { key: 'Dry Clean Only', value: 'Yes' },
        ],
        weight: '1.4kg',
        dimensions: { length: '110 cm', width: '50 cm', height: '5 cm' },
        featured: true,
      },
      {
        name: 'Tailored Italian Wool Suit',
        description: 'Impeccable slim-fit two-piece suit tailored from Super 120s Italian wool. Includes a fully lined double-vented jacket and flat-front matching suit trousers.',
        category: catMap['men'],
        subcategory: 'Formal Wear',
        brand: 'Sartoria',
        price: 599.99,
        sku: 'RAIN-SUIT-002',
        stockQuantity: 8,
        sizes: ['M', 'L', 'XL'],
        colors: ['Navy', 'Charcoal', 'Black'],
        material: '100% Italian Merino Wool',
        gender: 'Men',
        images: [
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
        ],
        specifications: [
          { key: 'Fabric Grade', value: 'Super 120s' },
          { key: 'Tailoring Fit', value: 'Slim Fit' },
          { key: 'Origin', value: 'Made in Italy' },
        ],
        weight: '1.8kg',
        dimensions: { length: '80 cm', width: '60 cm', height: '10 cm' },
        featured: true,
      },
      {
        name: 'Classic Silk Evening Gown',
        description: 'An elegant floor-length evening gown cut from double-faced mulberry silk. Beautifully flows with a cowl neckline and an open cross-back design.',
        category: catMap['women'],
        subcategory: 'Dresses',
        brand: 'Aurelia Lux',
        price: 450.0,
        discountPrice: 380.0,
        sku: 'RAIN-DRESS-003',
        stockQuantity: 12,
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Emerald', 'Ruby Red', 'Midnight Black'],
        material: '100% Mulberry Silk',
        gender: 'Women',
        images: [
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
        ],
        specifications: [
          { key: 'Fabric Type', value: '100% Mulberry Silk' },
          { key: 'Closure', value: 'Concealed Side Zipper' },
          { key: 'Length', value: 'Floor Length (150 cm)' },
        ],
        weight: '600g',
        dimensions: { length: '150 cm', width: '45 cm', height: '2 cm' },
        featured: true,
      },
      {
        name: 'Kids Organic Cotton Hoodie',
        description: 'Ultra-soft children\'s hoodie crafted from certified organic cotton fleece. Finished with flatlock stitch comfort seams and a double-lined cozy hood.',
        category: catMap['kids'],
        subcategory: 'Activewear',
        brand: 'TinyThreads',
        price: 49.99,
        sku: 'RAIN-KID-004',
        stockQuantity: 50,
        sizes: ['S', 'M', 'L'],
        colors: ['Mustard Yellow', 'Forest Green', 'Ocean Blue'],
        material: '100% Organic Cotton',
        gender: 'Kids',
        images: [
          'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80',
        ],
        specifications: [
          { key: 'Fabric', value: '100% Certified Organic Cotton' },
          { key: 'Knit Type', value: 'Heavyweight Fleece' },
          { key: 'Safety Checks', value: 'OEKO-TEX Standard 100 Certified' },
        ],
        weight: '350g',
        dimensions: { length: '50 cm', width: '40 cm', height: '3 cm' },
        featured: false,
      },
      {
        name: 'Tailored Slim Fit Chinos',
        description: 'Perfect for business casual days. Made from fine combed cotton twill with added elastane stretch. Features side slash pockets and rear welt pockets.',
        category: catMap['men'],
        subcategory: 'Trousers',
        brand: 'Sartoria',
        price: 89.99,
        discountPrice: 69.99,
        sku: 'RAIN-PANTS-005',
        stockQuantity: 30,
        sizes: ['30', '32', '34', '36'],
        colors: ['Khaki', 'Olive Green', 'Navy Blue'],
        material: '98% Cotton, 2% Elastane',
        gender: 'Men',
        images: [
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
        ],
        specifications: [
          { key: 'Weave', value: 'Combed Twill' },
          { key: 'Stretch', value: '2% Lycra/Elastane' },
          { key: 'Fit', value: 'Modern Slim Fit' },
        ],
        weight: '550g',
        dimensions: { length: '102 cm', width: '40 cm', height: '2 cm' },
        featured: true,
      },
      {
        name: 'Linen Summer Button-Down',
        description: 'Lightweight and highly breathable summer shirt woven from premium flax linen. Soft washed finish prevents stiff wrinkles for styling on hot beach days.',
        category: catMap['men'],
        subcategory: 'Shirts',
        brand: 'Sartoria',
        price: 79.99,
        sku: 'RAIN-SHIRT-006',
        stockQuantity: 22,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['White', 'Sky Blue', 'Sage Green'],
        material: '100% Premium Flax Linen',
        gender: 'Men',
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
        ],
        specifications: [
          { key: 'Yarn', value: '100% Flax Linen' },
          { key: 'Collar', value: 'Spread Collar' },
          { key: 'Finish', value: 'Garment Washed for Softness' },
        ],
        weight: '220g',
        dimensions: { length: '78 cm', width: '52 cm', height: '1.5 cm' },
        featured: false,
      },
    ];

    const seededProducts = await Product.insertMany(productsToSeed);
    console.log(`Seeded ${seededProducts.length} catalogue products.`);

    // 4. Seed Coupons
    const couponsToSeed = [
      {
        code: 'WELCOME10',
        discountType: 'percent',
        discountValue: 10,
        minOrderValue: 50,
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
        isActive: true,
      },
      {
        code: 'FLAT25',
        discountType: 'flat',
        discountValue: 25,
        minOrderValue: 150,
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)), // 15 days from now
        isActive: true,
      },
    ];

    const seededCoupons = await Coupon.insertMany(couponsToSeed);
    console.log(`Seeded ${seededCoupons.length} promotional coupons.`);

    // 5. Seed some sample order histories
    const orderItems = [
      {
        name: seededProducts[0].name,
        qty: 1,
        image: seededProducts[0].images[0],
        price: seededProducts[0].price,
        product: seededProducts[0]._id,
      },
      {
        name: seededProducts[2].name,
        qty: 1,
        image: seededProducts[2].images[0],
        price: seededProducts[2].price,
        product: seededProducts[2]._id,
      },
    ];

    // Historical completed order to show statistics
    await Order.create({
      user: customerUser._id,
      orderItems,
      shippingAddress: {
        street: '456 Web Testing Ave',
        city: 'Metropolis',
        state: 'New York',
        postalCode: '10001',
        country: 'USA',
      },
      paymentMethod: 'cod',
      itemsPrice: 679.99,
      taxPrice: 54.4,
      shippingPrice: 0.0, // Free over $100
      discountPrice: 0.0,
      totalPrice: 734.39,
      isPaid: true,
      paidAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      orderStatus: 'delivered',
      deliveredAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    });

    console.log('Seeded sample order logs for financial dashboards.');

    console.log('Seeding complete! Closing connection...');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error occurred:', error);
    process.exit(1);
  }
};

seedData();
