import { useState, useEffect } from 'react';
import { Package, MapPin, Calendar, Clock, CreditCard, ChevronRight, Printer, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { TableSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null); // Triggers invoice modal

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/api/orders/myorders');
      setOrders(data);
      if (data.length > 0) {
        setSelectedOrder(data[0]); // Default to first order
      }
    } catch (error) {
      console.error('Failed to load user orders:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePrintInvoice = () => {
    const printContent = document.getElementById('printable-invoice-content').innerHTML;
    const originalContent = document.body.innerHTML;

    // Open clean window and write invoice structure
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Rainbow Fashions Invoice - ${invoiceOrder?.invoiceNumber}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 24px; font-weight: bold; color: #D4AF37; }
            .title { font-size: 20px; font-weight: bold; margin: 0; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .meta div { width: 45%; }
            .meta h4 { font-weight: bold; margin-bottom: 8px; color: #64748b; font-size: 12px; text-transform: uppercase; }
            .meta p { margin: 4px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; }
            th { background: #f8fafc; font-weight: bold; text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .totals { width: 40%; margin-left: auto; font-size: 14px; space-y: 8px; }
            .totals flex { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .totals .grand { font-size: 16px; font-weight: bold; border-top: 2px solid #e2e8f0; pt-8px; margin-top: 8px; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusStepClass = (currentStatus, targetStatus) => {
    const statusOrder = ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const targetIndex = statusOrder.indexOf(targetStatus);

    if (currentStatus === 'cancelled') {
      return 'bg-rose-500 text-white';
    }

    if (currentIndex >= targetIndex) {
      return 'bg-emerald-500 text-white'; // Completed or current
    }
    return 'bg-slate-200 dark:bg-slate-800 text-slate-400'; // Upcoming
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Order History & Tracking</h1>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Orders list selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Orders</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
              {orders.map((ord) => (
                <button
                  key={ord._id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`w-full text-left p-5 flex items-center justify-between transition-colors ${
                    selectedOrder?._id === ord._id
                      ? 'bg-slate-50 dark:bg-slate-800/40'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      Ref: {ord.invoiceNumber}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()} • {ord.orderItems.length} {ord.orderItems.length === 1 ? 'item' : 'items'}
                    </p>
                    <div className="flex items-center space-x-1.5 pt-1">
                      <span className={`h-2 w-2 rounded-full ${ord.orderStatus === 'delivered' ? 'bg-emerald-500' : ord.orderStatus === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">${ord.totalPrice.toFixed(2)}</span>
                    <ChevronRight className="h-4.5 w-4.5 text-slate-350" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Tracking & Receipt Viewer */}
          {selectedOrder && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Status Tracking card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 dark:text-white">Order Status & Invoice</h3>
                    <p className="text-xs text-slate-400">Order ID: {selectedOrder._id}</p>
                  </div>
                  <button
                    onClick={() => setInvoiceOrder(selectedOrder)}
                    className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    <span>View Invoice</span>
                  </button>
                </div>

                {/* Progress bar line */}
                {selectedOrder.orderStatus === 'cancelled' ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center space-x-3 text-rose-600 dark:text-rose-400 text-sm">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">This order has been cancelled. If payment was made, funds will be refunded.</span>
                  </div>
                ) : (
                  <div className="relative pt-2">
                    {/* Status node line */}
                    <div className="flex items-center justify-between relative z-10 text-center">
                      {['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered'].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center space-y-2 flex-1">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shadow ${getStatusStepClass(selectedOrder.orderStatus, step)}`}>
                            {idx + 1}
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500 block max-w-16">
                            {step.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery and Payment logistics details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-sm">
                  <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary-500" />
                    <span>Delivery Address</span>
                  </h4>
                  <div className="text-slate-650 dark:text-slate-300 space-y-1">
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-sm">
                  <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-primary-500" />
                    <span>Payment Methods</span>
                  </h4>
                  <div className="text-slate-650 dark:text-slate-300 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-450">Payment Type:</span>
                      <span className="font-semibold uppercase">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2">
                      <span className="text-slate-450">Payment Status:</span>
                      <span className={`font-bold capitalize ${selectedOrder.isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    {selectedOrder.paidAt && (
                      <div className="flex justify-between items-center text-xs text-slate-450">
                        <span>Paid Date:</span>
                        <span>{new Date(selectedOrder.paidAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white">Ordered Items</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded-xl border border-slate-100 dark:border-slate-800" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</h4>
                          <p className="text-xs text-slate-400">
                            {item.qty} × ${item.price.toFixed(2)}
                            {item.size || item.color ? ` | ${[item.size, item.color].filter(Boolean).join(' / ')}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-850 dark:text-white text-sm">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals breakdown */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span>${selectedOrder.itemsPrice.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discountPrice > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Applied Discounts</span>
                      <span>-${selectedOrder.discountPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping fee</span>
                    <span>${selectedOrder.shippingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Tax (8%)</span>
                    <span>${selectedOrder.taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                    <span>Total Balance</span>
                    <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6">
            
            {/* Header Controls */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Invoice Summary</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrintInvoice}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-2 px-4 rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="printable-invoice-content" className="space-y-6 text-slate-800 dark:text-slate-200">
              
              {/* Brand Header */}
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary-600">Rainbow Fashions Store</h3>
                  <p className="text-xs text-slate-400 mt-1">123 E-Commerce Way, NY 10001</p>
                </div>
                <div className="text-right">
                  <h4 className="text-base font-bold uppercase tracking-wider text-slate-450">Invoice Receipt</h4>
                  <p className="text-sm font-semibold mt-1">{invoiceOrder.invoiceNumber}</p>
                </div>
              </div>

              {/* Meta billing/shipping address info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase mb-1">Billed To:</h4>
                  <p className="font-semibold">{invoiceOrder.user?.name || 'Customer'}</p>
                  <p className="text-slate-450">{invoiceOrder.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-400 uppercase mb-1">Shipped To:</h4>
                  <p>{invoiceOrder.shippingAddress.street}</p>
                  <p>{invoiceOrder.shippingAddress.city}, {invoiceOrder.shippingAddress.state} {invoiceOrder.shippingAddress.postalCode}</p>
                  <p>{invoiceOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Meta dates and payments info */}
              <div className="grid grid-cols-3 gap-4 text-xs border-y border-slate-100 dark:border-slate-800 py-3">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase mb-1">Invoice Date:</h4>
                  <p>{new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-400 uppercase mb-1">Payment Type:</h4>
                  <p className="uppercase">{invoiceOrder.paymentMethod}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-400 uppercase mb-1">Payment Status:</h4>
                  <p className="font-semibold capitalize">{invoiceOrder.isPaid ? 'Paid' : 'COD Pending'}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoiceOrder.orderItems.map((item) => (
                    <tr key={item._id}>
                      <td className="p-3 font-semibold">
                        {item.name}
                        {item.size || item.color ? (
                          <div className="text-[10px] text-slate-400 font-normal">
                            {[item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : ''].filter(Boolean).join(' | ')}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3 text-center">{item.qty}</td>
                      <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold">${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals math */}
              <div className="w-60 ml-auto space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>${invoiceOrder.itemsPrice.toFixed(2)}</span>
                </div>
                {invoiceOrder.discountPrice > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-${invoiceOrder.discountPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping:</span>
                  <span>${invoiceOrder.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (8%):</span>
                  <span>${invoiceOrder.taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm border-t border-slate-200/60 dark:border-slate-800 pt-2 text-slate-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span>${invoiceOrder.totalPrice.toFixed(2)}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
