// Store owner's WhatsApp phone number
export const WHATSAPP_NUMBER = '919705227709';

export const getProductWhatsAppUrl = (product, selectedSize, selectedColor) => {
  const currentUrl = window.location.href;
  const priceText = product.discountPrice ? `₹${product.discountPrice}` : `₹${product.price}`;
  const details = [];
  if (selectedSize) details.push(`Size: ${selectedSize}`);
  if (selectedColor) details.push(`Color: ${selectedColor}`);
  const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';

  const message = `Hi Rainbow Fashions! 👋\nI would like to order *${product.name}*${detailsStr}.\nPrice: ${priceText}\nLink: ${currentUrl}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const getCartWhatsAppUrl = (cartItems, totalPrice) => {
  const itemLines = cartItems
    .map((item, idx) => {
      const details = [];
      if (item.size) details.push(`Size: ${item.size}`);
      if (item.color) details.push(`Color: ${item.color}`);
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `${idx + 1}. *${item.name}*${detailsStr} - Qty: ${item.qty} (₹${(item.price * item.qty).toFixed(2)})`;
    })
    .join('\n');

  const message = `Hi Rainbow Fashions! 👋\nI would like to place an order for the following items:\n\n${itemLines}\n\n*Total Order Balance:* ₹${totalPrice.toFixed(2)}\n\nPlease confirm my order!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
