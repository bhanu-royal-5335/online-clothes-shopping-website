import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Users,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Shield,
  Ban,
  Tag,
  BarChart3,
  Layers,
  ShoppingBasket,
  FileCheck2,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { StatsSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'products' | 'categories' | 'orders' | 'users'

  // Data states
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Product Form states
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    discountPrice: '',
    description: '',
    category: '',
    brand: '',
    stockQuantity: '',
    sku: '',
    specifications: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    subcategory: '',
    imageUrl: '', // Simple url seed input for development convenience
    sizes: '',
    colors: '',
    material: '',
    gender: 'Unisex',
  });

  // Category Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: '',
  });

  // 1. Fetch dashboard metrics
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get('/api/users/stats');
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoadingStats(false);
    }
  };

  // 2. Fetch catalogue products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await api.get('/api/products?pageSize=100'); // Load bulk products
      setProducts(data.products || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // 3. Fetch categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // 4. Fetch orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/api/orders');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  // 5. Fetch users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/api/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Sync tab loading
  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'products') {
      fetchProducts();
      fetchCategories(); // Needed for category selection in product forms
    }
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // Handle Product Create / Update Submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!productForm.category) {
      toast.error('Please select a Category');
      return;
    }

    try {
      let specificationsParsed = [];
      if (productForm.specifications) {
        try {
          specificationsParsed = JSON.parse(productForm.specifications);
        } catch (e) {
          // Fallback parsing if plain string of key:value
          specificationsParsed = productForm.specifications
            .split(',')
            .map((item) => {
              const [key, val] = item.split(':');
              return { key: key.trim(), value: val.trim() };
            })
            .filter((x) => x.key && x.value);
        }
      }

      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : undefined,
        stockQuantity: parseInt(productForm.stockQuantity),
        specifications: specificationsParsed,
        sizes: productForm.sizes ? productForm.sizes.split(',').map((x) => x.trim()).filter(Boolean) : [],
        colors: productForm.colors ? productForm.colors.split(',').map((x) => x.trim()).filter(Boolean) : [],
        material: productForm.material || '',
        gender: productForm.gender || 'Unisex',
      };

      if (productForm.imageUrl) {
        payload.images = [productForm.imageUrl];
      }

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/api/products', payload);
        toast.success('Product created successfully!');
      }

      // Reset
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '', price: '', discountPrice: '', description: '', category: '',
        brand: '', stockQuantity: '', sku: '', specifications: '', weight: '',
        length: '', width: '', height: '', subcategory: '', imageUrl: '',
        sizes: '', colors: '', material: '', gender: 'Unisex',
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Product submit failed');
    }
  };

  // Trigger editing product modal
  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
      description: product.description,
      category: product.category?._id || '',
      brand: product.brand,
      stockQuantity: product.stockQuantity.toString(),
      sku: product.sku,
      specifications: JSON.stringify(product.specifications || []),
      weight: product.weight || '',
      length: product.dimensions?.length || '',
      width: product.dimensions?.width || '',
      height: product.dimensions?.height || '',
      subcategory: product.subcategory || '',
      imageUrl: product.images[0] || '',
      sizes: (product.sizes || []).join(', '),
      colors: (product.colors || []).join(', '),
      material: product.material || '',
      gender: product.gender || 'Unisex',
    });
    setShowProductModal(true);
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  // Handle Category Create Submit
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/categories', categoryForm);
      toast.success('Category created successfully!');
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '', image: '' });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Category creation failed');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this category? This might make some products uncategorized.')) {
      try {
        await api.delete(`/api/categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        toast.error('Failed to delete category');
      }
    }
  };

  // Update Order Status
  const handleOrderStatusChange = async (id, status) => {
    try {
      await api.put(`/api/orders/${id}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Toggle user block
  const handleToggleBlock = async (id) => {
    try {
      const { data } = await api.put(`/api/users/${id}/block`);
      toast.success(data.message || 'User status changed');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to change block status');
    }
  };

  // Delete User
  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer account?')) {
      try {
        await api.delete(`/api/users/${id}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user account');
      }
    }
  };

  // Change user role
  const handleRoleToggle = async (id, currentRole) => {
    const role = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      await api.put(`/api/users/${id}/role`, { role });
      toast.success(`User role updated to ${role}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200/50 dark:border-slate-800/40 gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin Control Panel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rainbow Fashions e-commerce operations dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-2.5">
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'stats' ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="h-4.5 w-4.5" />
            <span>Store Metrics</span>
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'products' ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <ShoppingBasket className="h-4.5 w-4.5" />
            <span>Catalog Products</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'categories' ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Layers className="h-4.5 w-4.5" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'orders' ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileCheck2 className="h-4.5 w-4.5" />
            <span>Manage Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'users' ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Customer Accounts</span>
          </button>
        </aside>

        {/* Dashboard Display Area */}
        <main className="lg:col-span-4 space-y-8">
          
          {/* TAB 1: STORE METRICS */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              {loadingStats ? (
                <StatsSkeleton />
              ) : stats ? (
                <>
                  {/* Statistics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Sales Revenue</span>
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">${stats.metrics.totalSales.toFixed(2)}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Orders Logged</span>
                        <Package className="h-5 w-5 text-primary-500" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.metrics.orders}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
                        <Users className="h-5 w-5 text-indigo-500" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.metrics.users}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Catalog Inventory</span>
                        <ShoppingBag className="h-5 w-5 text-amber-500" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.metrics.products}</p>
                    </div>
                  </div>

                  {/* Operational status details */}
                  <div className="grid grid-cols-3 gap-6 bg-slate-100 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800">
                    <div className="text-center space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase">Pending Delivery</p>
                      <div className="flex items-center justify-center space-x-1.5 text-amber-500">
                        <Clock className="h-4.5 w-4.5" />
                        <span className="font-extrabold text-lg">{stats.metrics.pendingOrders}</span>
                      </div>
                    </div>
                    <div className="text-center space-y-1 border-x border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400 font-bold uppercase">Completed</p>
                      <div className="flex items-center justify-center space-x-1.5 text-emerald-500">
                        <CheckCircle className="h-4.5 w-4.5" />
                        <span className="font-extrabold text-lg">{stats.metrics.deliveredOrders}</span>
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase">Cancelled</p>
                      <div className="flex items-center justify-center space-x-1.5 text-rose-500">
                        <XCircle className="h-4.5 w-4.5" />
                        <span className="font-extrabold text-lg">{stats.metrics.cancelledOrders}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recharts Area Chart */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white">Revenue Timeline ($)</h3>
                    <div className="h-80 w-full text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.chartData}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#5c7aff" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#5c7aff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}/>
                          <Area type="monotone" dataKey="sales" stroke="#5c7aff" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-slate-400">Failed to render dashboard analytics.</p>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Catalogue Products ({products.length})</h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '', price: '', discountPrice: '', description: '', category: categories[0]?._id || '',
                      brand: '', stockQuantity: '', sku: '', specifications: '', weight: '',
                      length: '', width: '', height: '', subcategory: '', imageUrl: '',
                    });
                    setShowProductModal(true);
                  }}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {loadingProducts ? (
                <TableSkeleton />
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-x-auto shadow-sm">
                  <table className="w-full text-xs text-left min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-450 font-bold uppercase tracking-wider">
                        <th className="p-4">Info</th>
                        <th className="p-4">SKU</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4 text-center">Stock</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                          <td className="p-4 flex items-center space-x-3.5">
                            <img src={p.images[0]} alt={p.name} className="h-10 w-10 object-cover rounded-lg border dark:border-slate-800" />
                            <div className="min-w-0 max-w-44">
                              <p className="font-bold text-slate-800 dark:text-slate-150 truncate">{p.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{p.brand}</p>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-500">{p.sku}</td>
                          <td className="p-4 capitalize text-slate-650 dark:text-slate-350">{p.category?.name || 'Category'}</td>
                          <td className="p-4 font-bold">
                            {p.discountPrice ? (
                              <div className="flex flex-col">
                                <span className="text-slate-850 dark:text-white">${p.discountPrice.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400 line-through">${p.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span>${p.price.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`font-bold px-2 py-0.5 rounded-full ${p.stockQuantity > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                              {p.stockQuantity}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-200 rounded-lg"
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 rounded-lg"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Store Categories ({categories.length})</h2>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Category</span>
                </button>
              </div>

              {loadingCategories ? (
                <TableSkeleton />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {categories.map((c) => (
                    <div key={c._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <img src={c.image} alt={c.name} className="h-12 w-12 object-cover rounded-xl border dark:border-slate-800" />
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-850 dark:text-white truncate">{c.name}</h3>
                          <p className="text-xs text-slate-400 truncate capitalize">{c.slug}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(c._id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 rounded-xl"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORDER STATUS CONTROLLER */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Customer Orders ({orders.length})</h2>

              {loadingOrders ? (
                <TableSkeleton />
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-x-auto shadow-sm">
                  <table className="w-full text-xs text-left min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-450 font-bold uppercase tracking-wider">
                        <th className="p-4">Invoice</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Grand Total</th>
                        <th className="p-4">Paid Status</th>
                        <th className="p-4 text-right">Order Status Router</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                      {orders.map((o) => (
                        <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                          <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">{o.invoiceNumber}</td>
                          <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{o.user?.name || 'Customer'}</td>
                          <td className="p-4 text-slate-450">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 font-bold">${o.totalPrice.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`font-bold px-2 py-0.5 rounded-full ${o.isPaid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                              {o.isPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={o.orderStatus}
                              disabled={o.orderStatus === 'cancelled' || o.orderStatus === 'delivered'}
                              onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}
                              className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none cursor-pointer disabled:opacity-40"
                            >
                              <option value="pending">Pending</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CUSTOMER ACCOUNT MANAGER */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Customer Profiles ({users.length})</h2>

              {loadingUsers ? (
                <TableSkeleton />
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-x-auto shadow-sm">
                  <table className="w-full text-xs text-left min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-450 font-bold uppercase tracking-wider">
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Authorization</th>
                        <th className="p-4">Status Check</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                          <td className="p-4 font-mono text-slate-500">{u.email}</td>
                          <td className="p-4 capitalize font-semibold">
                            <button
                              onClick={() => handleRoleToggle(u._id, u.role)}
                              className="flex items-center space-x-1 hover:text-primary-500 transition-colors"
                              title="Toggle Role"
                            >
                              <Shield className="h-3.5 w-3.5 text-primary-500" />
                              <span>{u.role}</span>
                            </button>
                          </td>
                          <td className="p-4">
                            <span className={`font-semibold px-2 py-0.5 rounded-full ${u.isBlocked ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                              {u.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleToggleBlock(u._id)}
                              className={`p-1.5 rounded-lg ${u.isBlocked ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' : 'bg-amber-50 hover:bg-amber-100 text-amber-600'}`}
                              title={u.isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 rounded-lg"
                              title="Delete User Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* PRODUCT CREATION/EDITING MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white border-b pb-4">
              {editingProduct ? 'Modify Product Listing' : 'Add Product to Catalogue'}
            </h2>

            <form onSubmit={handleProductSubmit} className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">SKU Reference</label>
                <input
                  type="text"
                  required
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Discount Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  value={productForm.discountPrice}
                  onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Brand</label>
                <input
                  type="text"
                  required
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Product Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Sub-Category</label>
                <input
                  type="text"
                  placeholder="e.g. Headphones"
                  value={productForm.subcategory}
                  onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Image URL (Unsplash or Static Link)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Catalogue Description</label>
                <textarea
                  rows={2}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-955 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1"
                ></textarea>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Sizes (comma-separated)</label>
                <input
                  type="text"
                  placeholder="S, M, L, XL"
                  value={productForm.sizes}
                  onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Colors (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Black, Beige, Navy"
                  value={productForm.colors}
                  onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Garment Material</label>
                <input
                  type="text"
                  placeholder="100% Cashmere / Organic Cotton"
                  value={productForm.material}
                  onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-955 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Gender Category</label>
                <select
                  value={productForm.gender}
                  onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-955 border-none rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Specs (JSON or key:value format)</label>
                <input
                  type="text"
                  placeholder='e.g. [{"key":"Color","value":"Midnight Black"}] or Color:Black, Fit:Slim'
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-955 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end col-span-2 gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-semibold py-2 px-5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-5 rounded-xl transition-colors shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY CREATION MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative space-y-6 text-xs">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-4">
              Add Store Category
            </h2>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Appliances"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Cover Image Link</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Short Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-semibold py-2 px-5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-5 rounded-xl transition-colors shadow"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
