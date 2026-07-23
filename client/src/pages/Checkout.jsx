import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, CheckCircle2, ChevronRight, Truck, Wallet, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    itemsPrice,
    discountPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    clearCart,
  } = useCart();

  // Address form states
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'stripe' or 'cod'
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [createdOrderInfo, setCreatedOrderInfo] = useState(null);

  // Card input states for simulated Stripe card payment
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
  });

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    setSubmittingOrder(true);
    try {
      let paymentResult = undefined;

      if (paymentMethod === 'stripe') {
        // 1. Request clientSecret from backend PaymentIntent endpoint
        const intentRes = await api.post('/api/orders/payment-intent', {
          amount: totalPrice,
        });

        const { clientSecret, simulated } = intentRes.data;

        // 2. Process payment (simulated client confirmation flow)
        if (simulated) {
          toast.loading('Processing simulated card transaction with Stripe...', { duration: 1500 });
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        paymentResult = {
          id: clientSecret ? 'ch_' + clientSecret.slice(-12) : 'ch_mock_' + Date.now(),
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: 'customer_payment@smartcart.com',
        };
      }

      // 3. Post order details to server
      const orderPayload = {
        orderItems: cartItems,
        shippingAddress: address,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountPrice,
        totalPrice,
        paymentResult,
      };

      const { data } = await api.post('/api/orders', orderPayload);
      
      setCreatedOrderInfo(data);
      setOrderConfirmed(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to place order';
      toast.error(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Order Confirmed View
  if (orderConfirmed && createdOrderInfo) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 transition-all">
        <div className="inline-flex h-16 w-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full items-center justify-center text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Order Confirmed!</h1>
          <p className="text-sm text-slate-500">
            Thank you for shopping at Rainbow Fashions. Your order has been placed and is currently being processed.
          </p>
        </div>

        {/* Invoice Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-left shadow-sm space-y-4 text-sm">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-slate-500">Order ID:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{createdOrderInfo._id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-slate-500">Invoice Ref:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{createdOrderInfo.invoiceNumber}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-slate-500">Payment Status:</span>
            <span className={`font-semibold capitalize ${createdOrderInfo.isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
              {createdOrderInfo.isPaid ? 'Paid' : 'Pending Delivery (COD)'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-500">Amount Charged:</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-base">
              ${createdOrderInfo.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/orders"
            className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-750 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors"
          >
            Track Order Status
          </Link>
          <Link
            to="/shop"
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Checkout Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-8">
        <Link to="/cart" className="hover:text-primary-500">Shopping Cart</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-800 dark:text-white">Checkout Details</span>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Shipping Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Address Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
              <Truck className="h-5 w-5 text-primary-500" />
              <span>Shipping Address Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-slate-450 font-bold uppercase">Street Address</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="e.g. 123 E-Commerce Way, Suite 4B"
                  value={address.street}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-bold uppercase">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Metropolis"
                  value={address.city}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-bold uppercase">State / Province</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="New York"
                  value={address.state}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-bold uppercase">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  placeholder="10001"
                  value={address.postalCode}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-bold uppercase">Country</label>
                <input
                  type="text"
                  name="country"
                  required
                  placeholder="United States"
                  value={address.country}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
              <CreditCard className="h-5 w-5 text-primary-500" />
              <span>Select Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-5 rounded-2xl border text-left flex items-start space-x-3.5 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-primary-600 bg-primary-500/5 ring-1 ring-primary-600'
                    : 'border-slate-200/60 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <Wallet className={`h-5 w-5 ${paymentMethod === 'cod' ? 'text-primary-500' : 'text-slate-400'}`} />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Cash On Delivery (COD)</h3>
                  <p className="text-xs text-slate-400 mt-1">Pay with cash when items arrive at your doorstep.</p>
                </div>
              </button>

              {/* Stripe Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`p-5 rounded-2xl border text-left flex items-start space-x-3.5 transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-primary-600 bg-primary-500/5 ring-1 ring-primary-600'
                    : 'border-slate-200/60 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <CreditCard className={`h-5 w-5 ${paymentMethod === 'stripe' ? 'text-primary-500' : 'text-slate-400'}`} />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Credit Card (Stripe)</h3>
                  <p className="text-xs text-slate-400 mt-1">Process credit cards securely via Stripe gateway.</p>
                </div>
              </button>
            </div>

            {/* Simulated Card Payment Module */}
            {paymentMethod === 'stripe' && (
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-4 mt-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Simulated Stripe Card Gateway</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Card Number</label>
                    <input
                      type="text"
                      name="number"
                      placeholder="4242 4242 4242 4242"
                      required={paymentMethod === 'stripe'}
                      maxLength={16}
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-1.5 text-xs text-slate-850 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Expiration Date</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      required={paymentMethod === 'stripe'}
                      maxLength={5}
                      value={cardDetails.expiry}
                      onChange={handleCardChange}
                      className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-1.5 text-xs text-slate-850 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">CVC</label>
                    <input
                      type="password"
                      name="cvc"
                      placeholder="123"
                      required={paymentMethod === 'stripe'}
                      maxLength={3}
                      value={cardDetails.cvc}
                      onChange={handleCardChange}
                      className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-1.5 text-xs text-slate-850 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Pricing Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              Checkout Summary
            </h2>

            {/* Items display */}
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1 space-y-3">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="flex items-center space-x-3 py-3 first:pt-0">
                  <img src={item.image} alt={item.name} className="h-11 w-11 object-cover rounded-xl border border-slate-100 dark:border-slate-800" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {item.qty} × ${item.price.toFixed(2)}
                      {item.size || item.color ? ` | ${[item.size, item.color].filter(Boolean).join(' / ')}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-850 dark:text-slate-200">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing math */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span>${itemsPrice.toFixed(2)}</span>
              </div>

              {discountPrice > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo Discount</span>
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

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-slate-900 dark:text-white font-extrabold text-base">
                <span>Total Balance Due</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingOrder}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-primary-500/10 flex items-center justify-center space-x-2.5 hover:scale-102 disabled:opacity-40 transition-all"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>{submittingOrder ? 'Placing Order...' : 'Place Order'}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
