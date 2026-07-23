import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, Heart, Truck, RefreshCw, ShoppingCart, Plus, Minus } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const { user, toggleWishlist } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  // Review inputs
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const { data } = await api.get(`/api/products/${id}`);
      setProduct(data);
      setSelectedImage(data.images[0] || '');
      if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
      if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
    } catch (error) {
      console.error('Failed to load product details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (product.stockQuantity <= 0) {
      toast.error('Item is currently out of stock!');
      return;
    }
    addToCart(product, qty, selectedSize, selectedColor);
  };

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error('Please login to manage your wishlist!');
      return;
    }
    toggleWishlist(product._id);
    toast.success(user.wishlist?.includes(product._id) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/api/products/${product._id}/reviews`, { rating, comment });
      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      // Reload product details to show new review
      fetchProductDetails();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Product not found.</h2>
        <Link to="/shop" className="mt-4 inline-block text-primary-600 font-semibold hover:underline">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = user?.wishlist?.includes(product._id);
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 transition-colors duration-300">
      
      {/* Product top detail layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm relative">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.discountPrice && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-full">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Sub Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`h-20 w-20 rounded-xl overflow-hidden border-2 bg-white dark:bg-slate-900 flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-primary-600 scale-95 shadow-sm'
                      : 'border-slate-200/50 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Descriptions & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                {product.brand}
              </span>
              <button
                onClick={handleWishlistToggle}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                title="Save to Wishlist"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-slate-400">SKU: {product.sku}</p>
          </div>

          {/* Ratings star */}
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-850/60 p-3 rounded-2xl w-fit border border-slate-100 dark:border-slate-800">
            <div className="flex items-center text-amber-400">
              <Star className="h-5 w-5 fill-amber-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 ml-1.5">
                {product.ratings.toFixed(1)}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {product.numOfReviews} customer reviews
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className={`text-xs font-semibold ${product.stockQuantity > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} items in stock` : 'Out of Stock'}
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3">
            {product.discountPrice ? (
              <>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  ${product.discountPrice.toFixed(2)}
                </span>
                <span className="text-lg text-slate-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Full description */}
          <div className="text-slate-650 dark:text-slate-300 text-sm leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Size Selection */}
          {product.sizes?.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-450 font-bold uppercase tracking-wider">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`h-9 px-4 rounded-xl text-xs font-bold transition-all border ${
                      selectedSize === sz
                        ? 'border-primary-600 bg-primary-500/5 text-primary-700 dark:text-primary-400 font-extrabold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-805'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors?.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <label className="text-slate-450 font-bold uppercase tracking-wider">Select Color</label>
                <span className="font-bold text-slate-600 dark:text-slate-300 capitalize">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-3.5 items-center">
                {product.colors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`h-7 w-7 rounded-full border shadow-sm relative flex items-center justify-center transition-transform hover:scale-110 ${
                      selectedColor === col
                        ? 'border-primary-600 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: col.toLowerCase().replace(/ /g, '') }}
                    title={col}
                  >
                    {selectedColor === col && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white shadow mix-blend-difference"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector & Add to cart */}
          {product.stockQuantity > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-6 font-bold text-sm text-slate-800 dark:text-white">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stockQuantity, q + 1))}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full sm:flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-primary-500/10 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2.5 transition-all"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Shopping Cart</span>
              </button>
            </div>
          )}

          {/* Logistics benefits */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <Truck className="h-4.5 w-4.5 text-primary-500" />
              <span>Fast local express shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4.5 w-4.5 text-primary-500" />
              <span>Free returns within 30 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product details and specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-slate-200/50 dark:border-slate-800/40">
        
        {/* Specifications List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Technical Specifications</h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-sm text-sm">
            {product.specifications?.length > 0 ? (
              product.specifications.map((spec, idx) => (
                <div key={idx} className="grid grid-cols-3 p-4">
                  <span className="font-bold text-slate-500 dark:text-slate-400 capitalize">{spec.key}</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{spec.value}</span>
                </div>
              ))
            ) : (
              <p className="p-4 text-slate-400 italic">No detailed specifications provided.</p>
            )}

            {product.material && (
              <div className="grid grid-cols-3 p-4">
                <span className="font-bold text-slate-500 dark:text-slate-400">Garment Material</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200">{product.material}</span>
              </div>
            )}
            {product.gender && (
              <div className="grid grid-cols-3 p-4">
                <span className="font-bold text-slate-500 dark:text-slate-400">Target Category / Gender</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200 capitalize">{product.gender}</span>
              </div>
            )}
            
            {/* Dimensions and Weight */}
            {(product.weight || product.dimensions?.length) && (
              <>
                {product.weight && (
                  <div className="grid grid-cols-3 p-4">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Shipping Weight</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-200">{product.weight}</span>
                  </div>
                )}
                {product.dimensions?.length && (
                  <div className="grid grid-cols-3 p-4">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Dimensions (L × W × H)</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-200">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Benefits panel */}
        <div className="bg-slate-100/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 space-y-4">
          <h3 className="font-extrabold text-slate-850 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-primary-500" />
            <span>Rainbow Fashions Buyer Protection</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every product purchased is backed by our full money-back guarantee. If the product arrives damaged, incorrect, or doesn&apos;t arrive at all, contact support for an instant resolution.
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="pt-8 border-t border-slate-200/50 dark:border-slate-800/40 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left column: Add review */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Customer Reviews</h2>
          
          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Write a customer review</h3>
              
              {/* Stars selection */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold uppercase">Rating Score</label>
                <div className="flex gap-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star className={`h-6 w-6 ${rating >= num ? 'fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text area */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold uppercase">Your Comment</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience with this product..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl text-xs shadow transition-colors"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500">Please login to write a customer review.</p>
              <Link
                to="/login"
                className="mt-3 inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-4.5 py-2 rounded-xl"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Right column: Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {product.reviews?.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev._id} className="py-6 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{rev.name}</span>
                    <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${rev.rating >= s ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-450">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <p className="text-sm italic">No reviews yet for this product. Be the first to review it!</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProductDetails;
