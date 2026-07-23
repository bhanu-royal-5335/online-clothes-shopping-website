import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const cached = localStorage.getItem('cartItems');
    return cached ? JSON.parse(cached) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const cached = localStorage.getItem('appliedCoupon');
    return cached ? JSON.parse(cached) : null;
  });

  // Persist cart items to local storage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist coupon to local storage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product, qty = 1, size = '', color = '') => {
    // If product has sizes/colors but none selected, pick defaults
    const finalSize = size || (product.sizes && product.sizes[0]) || '';
    const finalColor = color || (product.colors && product.colors[0]) || '';
    const cartItemId = `${product._id}-${finalSize}-${finalColor}`;

    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x.cartItemId === cartItemId);
      const stockAvailable = product.stockQuantity;

      if (existItem) {
        const newQty = existItem.qty + qty;
        if (newQty > stockAvailable) {
          toast.error(`Only ${stockAvailable} items available in stock!`);
          return prevItems;
        }
        toast.success(`Updated ${product.name} (${finalSize} / ${finalColor}) quantity in cart`);
        return prevItems.map((x) =>
          x.cartItemId === cartItemId ? { ...x, qty: newQty } : x
        );
      } else {
        if (qty > stockAvailable) {
          toast.error(`Only ${stockAvailable} items available in stock!`);
          return prevItems;
        }
        toast.success(`Added ${product.name} (${finalSize} / ${finalColor}) to cart`);
        return [
          ...prevItems,
          {
            product: product._id,
            cartItemId,
            name: product.name,
            image: product.images[0] || '',
            price: product.discountPrice || product.price,
            originalPrice: product.price,
            stockQuantity: product.stockQuantity,
            qty,
            size: finalSize,
            color: finalColor,
          },
        ];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prevItems) => prevItems.filter((x) => x.cartItemId !== cartItemId));
    toast.success('Removed item from cart');
  };

  const updateQuantity = (cartItemId, qty) => {
    setCartItems((prevItems) =>
      prevItems.map((x) => {
        if (x.cartItemId === cartItemId) {
          if (qty > x.stockQuantity) {
            toast.error(`Only ${x.stockQuantity} items in stock`);
            return x;
          }
          return { ...x, qty: Math.max(1, qty) };
        }
        return x;
      })
    );
  };

  const increaseQuantity = (cartItemId) => {
    const item = cartItems.find((x) => x.cartItemId === cartItemId);
    if (item) {
      updateQuantity(cartItemId, item.qty + 1);
    }
  };

  const decreaseQuantity = (cartItemId) => {
    const item = cartItems.find((x) => x.cartItemId === cartItemId);
    if (item && item.qty > 1) {
      updateQuantity(cartItemId, item.qty - 1);
    }
  };


  const applyCouponCode = async (code) => {
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    try {
      const { data } = await api.post('/api/coupons/validate', {
        code,
        orderValue: itemsPrice,
      });

      setAppliedCoupon(data);
      toast.success(data.message || 'Coupon applied successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid coupon code';
      toast.error(msg);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Cost calculations
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  
  // Calculate discount based on coupon rules
  let discountPrice = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percent') {
      discountPrice = itemsPrice * (appliedCoupon.discountValue / 100);
    } else {
      discountPrice = appliedCoupon.discountValue;
    }
    // Prevent discount from exceeding total cost
    discountPrice = Math.min(discountPrice, itemsPrice);
  }

  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 10;
  const taxPrice = (itemsPrice - discountPrice) * 0.08; // 8% sales tax
  const totalPrice = itemsPrice - discountPrice + taxPrice + shippingPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        appliedCoupon,
        itemsPrice: parseFloat(itemsPrice.toFixed(2)),
        discountPrice: parseFloat(discountPrice.toFixed(2)),
        shippingPrice: parseFloat(shippingPrice.toFixed(2)),
        taxPrice: parseFloat(taxPrice.toFixed(2)),
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        applyCouponCode,
        removeCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
