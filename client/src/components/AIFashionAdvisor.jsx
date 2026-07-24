import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

const AIFashionAdvisor = ({ currentProduct, allProducts = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I'm your Rainbow AI Fashion Stylist ✨ How can I help you style ${currentProduct ? `"${currentProduct.name}"` : 'your wardrobe'} today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = "I recommend pairing this with dark tailored trousers and gold minimalist accessories for an effortless evening look!";
      const lower = userMsg.toLowerCase();

      if (lower.includes('size') || lower.includes('fit')) {
        aiResponse = "This item runs true to size! If you prefer a relaxed oversized silhouette, we recommend sizing up one size.";
      } else if (lower.includes('color') || lower.includes('match')) {
        aiResponse = "Neutral shades like beige, cream, and jet black highlight the vibrant craftsmanship of Rainbow Fashions apparel.";
      } else if (lower.includes('wedding') || lower.includes('party') || lower.includes('formal')) {
        aiResponse = "For formal occasions, layer with a structured blazer and polished leather footwear to create a commanding presence.";
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
      setIsTyping(false);
    }, 1000);
  };

  const pairingSuggestions = allProducts.filter((p) => p._id !== currentProduct?._id).slice(0, 2);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-amber-500 via-primary-600 to-amber-600 hover:from-amber-600 hover:to-primary-700 text-white p-3.5 rounded-full shadow-xl shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center space-x-2 border border-white/20"
        title="Rainbow AI Fashion Stylist"
      >
        <Sparkles className="h-5 w-5 text-amber-200 animate-pulse" />
        <span className="text-xs font-extrabold tracking-wide pr-1">AI Stylist</span>
      </button>

      {/* Drawer Backdrop & Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl z-10"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-primary-600 rounded-2xl shadow-md">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white flex items-center space-x-1.5">
                      <span>Rainbow AI Stylist</span>
                      <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Pro
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Personalized Fashion & Outfit Intelligence</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Chat Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    <div
                      className={`p-2 rounded-xl flex-shrink-0 ${
                        msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-slate-800 text-amber-400 border border-slate-700'
                      }`}
                    >
                      {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-primary-600 text-white rounded-tr-none'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-750 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center space-x-2 text-xs text-amber-400 italic">
                    <Bot className="h-4 w-4 animate-bounce" />
                    <span>Stylist is crafting your fashion guidance...</span>
                  </div>
                )}

                {/* AI Outfit Pairing Showcase Card */}
                {pairingSuggestions.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Recommended Outfit Pairing</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {pairingSuggestions.map((item) => (
                        <Link
                          key={item._id}
                          to={`/product/${item._id}`}
                          onClick={() => setIsOpen(false)}
                          className="bg-slate-800/50 hover:bg-slate-800 border border-slate-750 rounded-2xl p-2.5 transition-all group block"
                        >
                          <img
                            src={item.images?.[0]}
                            alt={item.name}
                            className="h-24 w-full object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                          />
                          <h4 className="text-[11px] font-bold text-slate-200 truncate">{item.name}</h4>
                          <p className="text-[10px] font-bold text-primary-400 mt-0.5">{formatCurrency(item.price)}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask about size, styling, or pairings..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition-all shadow"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIFashionAdvisor;
