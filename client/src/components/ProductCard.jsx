import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { user, toggleWishlist } = useAuth();
  const { addToCart } = useCart();

  const isWishlisted = user?.wishlist?.includes(product._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to manage your wishlist!');
      return;
    }
    toggleWishlist(product._id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stockQuantity <= 0) {
      toast.error('Item is out of stock!');
      return;
    }
    addToCart(product, 1);
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700/40 shadow-sm hover:shadow-lg dark:hover:border-slate-700 transition-all duration-300"
    >
      <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900">
        {/* Discount Badge */}
        {product.discountPrice && (
          <span className="absolute top-4 left-4 z-10 bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
            Save {discountPercent}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 z-10 p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-sm hover:scale-110 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-200"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Image */}
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Brand & Category */}
        <div className="flex justify-between items-center text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase">
          <span>{product.brand}</span>
          <span className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-md font-normal lowercase">
            {product.category?.name || 'Item'}
          </span>
        </div>

        {/* Title */}
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-base line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Ratings & Stock */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-amber-400">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1">
              {product.ratings.toFixed(1)}
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {product.numOfReviews} reviews
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className={`text-xs font-semibold ${product.stockQuantity > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </span>
        </div>
        
        {/* Sizing & Color Swatches */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 border-t border-slate-50 dark:border-slate-800/40">
          {product.sizes?.length > 0 ? (
            <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">
              {product.sizes.join(' • ')}
            </div>
          ) : (
            <div className="h-4"></div>
          )}

          {product.colors?.length > 0 && (
            <div className="flex gap-1.5 items-center">
              {product.colors.slice(0, 3).map((col, idx) => (
                <span
                  key={idx}
                  className="h-2.5 w-2.5 rounded-full border border-slate-200/60 dark:border-slate-700 shadow-sm"
                  style={{ backgroundColor: col.toLowerCase().replace(/ /g, '') }}
                  title={col}
                ></span>
              ))}
              {product.colors.length > 3 && (
                <span className="text-[8px] text-slate-400 font-extrabold">+{product.colors.length - 3}</span>
              )}
            </div>
          )}
        </div>


        {/* Pricing and Cart */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  ${product.discountPrice.toFixed(2)}
                </span>
                <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0}
            className={`p-2.5 rounded-2xl shadow-sm transition-all duration-200 ${
              product.stockQuantity > 0
                ? 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 active:scale-95'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
