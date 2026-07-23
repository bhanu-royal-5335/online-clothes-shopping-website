import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Percent } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const {
    cartItems,
    itemsPrice,
    discountPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    appliedCoupon,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      applyCouponCode(couponCode.trim());
      setCouponCode('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-20 w-20 bg-primary-100 dark:bg-primary-950/40 rounded-full flex items-center justify-center mx-auto text-primary-600">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Your Cart is Empty</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Looks like you haven&apos;t added anything to your cart yet. Explore our premium collection!
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-all duration-250"
        >
          Explore Shop Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Items Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="p-5 sm:p-6 flex gap-4 sm:gap-6 items-center">
                {/* Item Thumbnail */}
                <Link
                  to={`/product/${item.product}`}
                  className="h-20 w-20 sm:h-24 sm:w-24 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200/50 dark:border-slate-800"
                >
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </Link>

                {/* Title and Specs */}
                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    to={`/product/${item.product}`}
                    className="block text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate hover:text-primary-500 transition-colors"
                  >
                    {item.name}
                  </Link>
                  {/* Selected Size & Color badges */}
                  {(item.size || item.color) && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {item.size && (
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                          Size: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                          Color: {item.color}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-450 font-semibold">${item.price.toFixed(2)} each</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl gap-2.5">
                  <button
                    onClick={() => decreaseQuantity(item.cartItemId)}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 dark:text-white px-1">{item.qty}</span>
                  <button
                    onClick={() => increaseQuantity(item.cartItemId)}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Item Subtotal Price */}
                <div className="text-right min-w-20 font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  ${(item.price * item.qty).toFixed(2)}
                </div>

                {/* Trash trigger */}
                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-450 transition-colors rounded-full"
                  title="Remove Item"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Continue Shopping button */}
          <Link
            to="/shop"
            className="inline-block text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Right Column: Checkout Pricing Summary */}
        <div className="space-y-6">
          
          {/* Coupon Entry Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Percent className="h-4 w-4 text-primary-500" />
              <span>Promo Coupon Code</span>
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl text-xs font-semibold">
                <div>
                  <span className="font-bold">{appliedCoupon.code}</span> Applied! (
                  {appliedCoupon.discountType === 'percent'
                    ? `${appliedCoupon.discountValue}% Off`
                    : `$${appliedCoupon.discountValue} Off`}
                  )
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-rose-500 font-bold text-[10px] uppercase hover:underline ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold px-4.5 py-2 rounded-xl text-xs transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Pricing Calculation Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${itemsPrice.toFixed(2)}</span>
              </div>

              {discountPrice > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-${discountPrice.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Shipping Cost</span>
                <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Estimated Sales Tax (8%)</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-slate-900 dark:text-white font-extrabold text-base sm:text-lg">
                <span>Grand Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              to="/checkout"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md shadow-primary-500/10 flex items-center justify-center space-x-2 hover:scale-102 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
