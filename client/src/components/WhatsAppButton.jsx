import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../utils/whatsapp';

const WhatsAppButton = () => {
  const defaultUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Rainbow Fashions! 👋 I have an inquiry about your products.')}`;

  return (
    <a
      href={defaultUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-lg hover:shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center space-x-2 group"
      title="Chat & Order on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 fill-white text-emerald-500" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 text-xs font-extrabold pr-1">
        Order on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;
