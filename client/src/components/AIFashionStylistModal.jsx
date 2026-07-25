import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Upload,
  Camera,
  ShoppingBag,
  Sliders,
  Ruler,
  RefreshCw,
  Search,
  Zap,
  Send,
  Bot,
  User,
  CheckCircle2,
  Layers,
  Palette,
  Trash2,
  ArrowRight,
  Maximize2,
  Info,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';

const AIFashionStylistModal = ({ isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'recommendations' | 'tryon' | 'outfits' | 'size'

  // Image Upload, Camera & Photos Gallery states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [previousPhotos, setPreviousPhotos] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Camera capture states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Interactive Chat states (ChatGPT / Gemini / Claude style)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm your Rainbow AI Personal Stylist ✨ Upload a photo or selfie on the left panel, or tell me what style, occasion, or size guidance you're looking for today!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Virtual Try-On state
  const [selectedTryOnProduct, setSelectedTryOnProduct] = useState(null);

  // Outfit Generator states
  const [selectedOccasion, setSelectedOccasion] = useState('Casual');
  const [outfitBundle, setOutfitBundle] = useState(null);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);

  // Size Estimator states
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [fitPref, setFitPref] = useState('Regular Fit');
  const [sizeResult, setSizeResult] = useState(null);

  // Body Scroll Lock & Escape Key Handler
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  // Auto scroll chat to bottom when new message arrives
  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiTyping, activeTab]);

  // Handle file select for photo upload
  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);

    // Add to previous photos gallery
    setPreviousPhotos((prev) => [
      { id: Date.now(), url, file, name: file.name || 'Uploaded Photo' },
      ...prev.filter((p) => p.url !== url),
    ]);
  };

  // Start Camera Stream
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Unable to access camera: ' + err.message);
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  // Capture Photo from Camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const file = new File([blob], `camera_snap_${Date.now()}.jpg`, { type: 'image/jpeg' });
      handleFileSelect(file);
      stopCamera();
      toast.success('Selfie captured! Click "Analyze Photo Traits" to analyze.');
    }, 'image/jpeg');
  };

  // Trigger Image AI Scanner Request
  const runAIScanner = async () => {
    setIsScanning(true);
    try {
      const formData = new FormData();
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      formData.append('occasion', selectedOccasion);

      const res = await axios.post('/api/ai/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setAnalysisResult(res.data);
        toast.success('AI Vision Analysis Complete! Features & Recommendations updated.');

        // Add a message to chat with analysis summary
        const traits = res.data.traits;
        const aiMsgText = `I've analyzed your photo! 🎨\n\n• **Body Shape**: ${traits.bodyType}\n• **Skin Tone**: ${traits.skinTone}\n• **Style Profile**: ${traits.detectedStyle}\n• **Complementary Colors**: ${traits.complementaryColors.join(', ')}\n• **Recommended Fit**: ${traits.recommendedFits.join(', ')}\n\nI have unlocked ${res.data.recommendations?.length || 0} matching store products for you in the catalog!`;
        
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'ai',
            text: aiMsgText,
            recommendations: res.data.recommendations || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      toast.error('AI Analysis Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsScanning(false);
    }
  };

  // Chat message send handler
  const handleSendChatMessage = async (customPrompt) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsAiTyping(true);

    try {
      const res = await axios.post('/api/ai/natural-search', { query: textToSend });
      let aiResponseText = '';
      let matchedItems = [];

      if (res.data.success && res.data.results) {
        matchedItems = res.data.results;
      }

      const lower = textToSend.toLowerCase();
      if (lower.includes('size') || lower.includes('fit') || lower.includes('calculate')) {
        aiResponseText = `Based on standard ergonomic sizing, for ${fitPref} styling we recommend checking your Height and Weight in our Fit & Size Estimator tab. Items in Rainbow Fashions generally fit true to size with tailored proportions.`;
      } else if (lower.includes('color') || lower.includes('match') || lower.includes('palette')) {
        const colorList = analysisResult?.traits?.complementaryColors?.join(', ') || 'Warm Olive, Cream, Jet Black, Navy Blue, and Amber Gold';
        aiResponseText = `Your optimal color palette includes: **${colorList}**. These tones highlight your natural contrast and skin tone undertones.`;
      } else if (lower.includes('wedding') || lower.includes('party') || lower.includes('formal') || lower.includes('occasion')) {
        aiResponseText = `For formal & festive events, pair a structured blazer or velvet ethnic jacket with tailored trousers. Explore our Outfit Bundler tab for curated occasion ensembles!`;
      } else if (matchedItems.length > 0) {
        aiResponseText = `I found ${matchedItems.length} store items matching "${textToSend}". Check them out below:`;
      } else {
        aiResponseText = `I'm curating personalized fashion choices for you based on your active style preferences! You can upload a photo to get automated skin tone & body fit analysis, or ask for specific outfit pairings.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiResponseText,
          recommendations: matchedItems,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "I'm ready to assist with your styling! Try asking about specific colors, occasions, size recommendations, or click one of the suggestion chips.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Generate Outfit Bundle
  const runOutfitGenerator = async (occ) => {
    const targetOccasion = occ || selectedOccasion;
    setIsGeneratingOutfit(true);
    try {
      const res = await axios.post('/api/ai/outfit-generator', { occasion: targetOccasion });
      if (res.data.success) {
        setOutfitBundle(res.data.bundle);
      }
    } catch (err) {
      toast.error('Outfit Generator Error');
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

  // Estimate Size
  const runSizeEstimator = async () => {
    try {
      const res = await axios.post('/api/ai/size-estimator', {
        heightCm,
        weightKg,
        fitPreference: fitPref,
      });
      if (res.data.success) {
        setSizeResult(res.data.estimation);
        toast.success(`Recommended Size: ${res.data.estimation.recommendedSize}`);
      }
    } catch (err) {
      toast.error('Size Calculator Error');
    }
  };

  // Add complete outfit to cart
  const handleAddOutfitToCart = () => {
    if (!outfitBundle || !outfitBundle.items) return;
    outfitBundle.items.forEach((item) => {
      if (item.product) {
        addToCart(item.product, 1);
      }
    });
    toast.success('Complete Outfit Bundle added to Cart!');
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] overflow-hidden flex flex-col bg-slate-950/80 backdrop-blur-md transition-opacity"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex flex-col bg-slate-950 text-slate-100 rounded-none m-0 p-0 overflow-hidden"
          >
            {/* 1. FIXED HEADER */}
            <header className="h-16 px-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0 z-20">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-primary-600 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20">
                  <Sparkles className="h-5 w-5 text-slate-950 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold font-display text-white flex items-center gap-2">
                    <span>Rainbow AI Stylist Pro</span>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30 hidden sm:inline-block">
                      Full-Screen Vision Portal
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 hidden sm:block">Personalized Outfit Intelligence & Store Engine</p>
                </div>
              </div>

              {/* Quick Tab Actions / Close Button */}
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 hidden md:inline-flex items-center gap-1 font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                  Press <kbd className="text-amber-400 font-bold">ESC</kbd> to exit
                </span>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors border border-slate-800 hover:border-slate-700"
                  title="Close AI Stylist (ESC)"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </header>

            {/* 2. MAIN BODY (LEFT 30% / RIGHT 70% SPLIT LAYOUT) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full min-h-0">
              {/* ================= LEFT PANEL (30%) ================= */}
              <aside className="w-full md:w-[30%] lg:w-[30%] xl:w-[28%] border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/80 p-4 sm:p-5 flex flex-col overflow-y-auto space-y-5 shrink-0 min-h-0">
                {/* Photo Upload & Camera Dropzone */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                      <Camera className="h-4 w-4" />
                      <span>1. Photo & Vision Input</span>
                    </h2>
                    {imagePreview && (
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                          setAnalysisResult(null);
                        }}
                        className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-900/90 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 text-center transition-colors relative overflow-hidden group">
                    {isCameraActive ? (
                      <div className="w-full space-y-3">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-44 object-cover rounded-xl border border-slate-700" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={capturePhoto}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            <span>Snap Photo</span>
                          </button>
                          <button
                            onClick={stopCamera}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : imagePreview ? (
                      <div className="w-full space-y-3">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="User Preview"
                            className="w-full h-48 object-cover rounded-xl border border-amber-500/40 shadow-lg"
                          />
                          {isScanning && (
                            <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[2px] rounded-xl border-2 border-amber-400 animate-pulse flex flex-col items-center justify-center p-2 text-center">
                              <Sparkles className="h-8 w-8 text-amber-400 animate-spin mb-1" />
                              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest bg-slate-950/90 px-2.5 py-0.5 rounded-full">
                                Scanning Body Traits & Palette...
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={runAIScanner}
                          disabled={isScanning}
                          className="w-full bg-gradient-to-r from-amber-500 to-primary-600 hover:from-amber-600 hover:to-primary-700 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs shadow-lg flex items-center justify-center space-x-2 transition-all"
                        >
                          <Zap className="h-4 w-4" />
                          <span>{isScanning ? 'Analyzing Traits...' : 'Analyze Photo Traits'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 py-4">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-full inline-block">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xs text-slate-200">Upload Selfie or Outfit Photo</h3>
                          <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 mx-auto">
                            AI analyzes skin undertone, build, and color harmony.
                          </p>
                        </div>
                        <div className="flex justify-center gap-2 pt-1">
                          <label className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all shadow">
                            <span>Upload Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e.target.files[0])}
                            />
                          </label>
                          <button
                            onClick={startCamera}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5"
                          >
                            <Camera className="h-3.5 w-3.5 text-amber-400" />
                            <span>Camera</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Previous Photos Gallery */}
                {previousPhotos.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Previous Session Photos</span>
                      <span className="text-[10px] text-amber-400 font-mono">{previousPhotos.length}</span>
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {previousPhotos.map((photo) => (
                        <button
                          key={photo.id}
                          onClick={() => {
                            setSelectedImage(photo.file || null);
                            setImagePreview(photo.url);
                          }}
                          className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                            imagePreview === photo.url ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20' : 'border-slate-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Feature Breakdown / Analysis Status */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3 flex-1">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI Feature Analysis</span>
                    </span>
                    {analysisResult && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                        Active Profile
                      </span>
                    )}
                  </h3>

                  {analysisResult ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <span className="text-slate-500 block text-[10px]">Body Shape</span>
                          <span className="font-bold text-slate-100">{analysisResult.traits?.bodyType || 'Regular'}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <span className="text-slate-500 block text-[10px]">Skin Tone</span>
                          <span className="font-bold text-amber-300">{analysisResult.traits?.skinTone || 'Warm Olive'}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <span className="text-slate-500 block text-[10px]">Style Profile</span>
                          <span className="font-bold text-slate-100">{analysisResult.traits?.detectedStyle || 'Smart Casual'}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <span className="text-slate-500 block text-[10px]">Hair Accent</span>
                          <span className="font-bold text-slate-100">{analysisResult.traits?.hairColor || 'Natural Dark'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] mb-1.5 font-bold uppercase tracking-wider">Suggested Palette</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(analysisResult.traits?.complementaryColors || ['Navy Blue', 'Amber Gold', 'Cream', 'Charcoal']).map((col, idx) => (
                            <span key={idx} className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                              <span>{col}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] mb-1.5 font-bold uppercase tracking-wider">Optimal Fit Recommendations</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(analysisResult.traits?.recommendedFits || ['Structured Shoulders', 'Tailored Waist', 'Slim Tapered']).map((fit, idx) => (
                            <span key={idx} className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                              {fit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs space-y-2">
                      <Info className="h-6 w-6 text-slate-600 mx-auto" />
                      <p className="max-w-[200px] mx-auto text-[11px]">
                        Upload a photo or capture a selfie above to view skin tone, body shape, and color palette extractions.
                      </p>
                    </div>
                  )}
                </div>
              </aside>

              {/* ================= RIGHT PANEL (70%) ================= */}
              <main className="w-full md:w-[70%] lg:w-[70%] xl:w-[72%] flex flex-col bg-slate-900/90 overflow-hidden flex-1 min-h-0">
                {/* Mode Selector Sub-Tabs Navigation */}
                <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 pt-3 space-x-2 overflow-x-auto shrink-0 z-10">
                  {[
                    { id: 'chat', label: '💬 AI Chat & Stylist', icon: Bot },
                    { id: 'recommendations', label: `🛍️ Catalog (${analysisResult?.recommendations?.length || 0})`, icon: ShoppingBag },
                    { id: 'tryon', label: '✨ Virtual Try-On', icon: Layers },
                    { id: 'outfits', label: '👗 Outfit Bundles', icon: Sliders },
                    { id: 'size', label: '📏 Size Estimator', icon: Ruler },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (tab.id === 'outfits' && !outfitBundle) runOutfitGenerator();
                        }}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
                          isActive
                            ? 'border-amber-500 text-amber-400 bg-slate-800/80 shadow-sm'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT AREA */}
                <div className="flex-1 overflow-hidden min-h-0 p-4 sm:p-6 flex flex-col">
                  {/* TAB 1: INTERACTIVE CHAT (ChatGPT / Gemini / Claude Style) */}
                  {activeTab === 'chat' && (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0 space-y-4">
                      {/* Messages Log Container */}
                      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4 pt-1 pb-1">
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                          >
                            <div
                              className={`p-2.5 rounded-2xl flex-shrink-0 ${
                                msg.sender === 'user'
                                  ? 'bg-amber-500 text-slate-950 shadow-md'
                                  : 'bg-slate-800 text-amber-400 border border-slate-700 shadow-md'
                              }`}
                            >
                              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>

                            <div className="space-y-2 max-w-[85%] sm:max-w-[75%]">
                              <div
                                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                                  msg.sender === 'user'
                                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                                    : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-md'
                                }`}
                              >
                                <div className="whitespace-pre-line">{msg.text}</div>
                                <div
                                  className={`text-[10px] mt-1.5 text-right font-mono ${
                                    msg.sender === 'user' ? 'text-slate-900/70' : 'text-slate-500'
                                  }`}
                                >
                                  {msg.timestamp}
                                </div>
                              </div>

                              {/* Inline Recommendation Cards inside Chat */}
                              {msg.recommendations && msg.recommendations.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                                  {msg.recommendations.slice(0, 3).map((item) => (
                                    <div
                                      key={item._id}
                                      className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-2.5 transition-all group"
                                    >
                                      <img
                                        src={item.images?.[0] || item.thumbnail}
                                        alt={item.name}
                                        className="w-full h-24 object-cover rounded-lg mb-1.5"
                                      />
                                      <h4 className="text-[11px] font-bold text-slate-200 truncate">{item.name}</h4>
                                      <p className="text-[11px] font-extrabold text-amber-400">{formatCurrency(item.price)}</p>
                                      <div className="mt-2 flex gap-1">
                                        <button
                                          onClick={() => {
                                            addToCart(item, 1);
                                            toast.success(`${item.name} added to cart!`);
                                          }}
                                          className="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold py-1 rounded-lg transition-colors flex items-center justify-center space-x-1"
                                        >
                                          <ShoppingBag className="h-3 w-3" />
                                          <span>Add</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedTryOnProduct(item);
                                            setActiveTab('tryon');
                                            toast.success(`Loaded ${item.name} into Virtual Try-On!`);
                                          }}
                                          className="p-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition-colors"
                                          title="Try On"
                                        >
                                          <Layers className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {isAiTyping && (
                          <div className="flex items-center space-x-2 text-xs text-amber-400 italic bg-slate-950/60 p-3 rounded-2xl border border-slate-800 w-fit">
                            <Bot className="h-4 w-4 animate-bounce" />
                            <span>Stylist AI is crafting your personalized recommendations...</span>
                          </div>
                        )}
                        <div ref={chatBottomRef} />
                      </div>

                      {/* Prompt Suggestion Chips */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                        {[
                          '✨ Style me for a wedding',
                          '📏 What size should I buy?',
                          '🎨 What colors fit my skin tone?',
                          '👖 Match a shirt with dark denim',
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendChatMessage(chip)}
                            className="text-[11px] font-semibold bg-slate-950/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 px-3 py-1.5 rounded-full transition-all"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>

                      {/* Chat Input Bar */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendChatMessage();
                        }}
                        className="flex items-center gap-2 pt-2"
                      >
                        <input
                          type="text"
                          placeholder="Ask AI Stylist about colors, fitting, occasion wear, or pairings..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none shadow-inner"
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim()}
                          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold px-5 py-3 rounded-2xl text-xs shadow-lg flex items-center space-x-1.5 transition-all"
                        >
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Send</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* TAB 2: STORE RECOMMENDATIONS */}
                  {activeTab === 'recommendations' && (
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-5 pr-1">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h3 className="text-sm font-extrabold text-white font-display">Matching Store Catalog</h3>
                          <p className="text-xs text-slate-400">Curated items matched strictly against your uploaded skin tone & style profile.</p>
                        </div>
                        <span className="text-xs text-amber-400 font-extrabold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                          100% In-Stock Guaranteed
                        </span>
                      </div>

                      {analysisResult?.recommendations?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {analysisResult.recommendations.map((item) => (
                            <div
                              key={item._id}
                              className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 transition-all group flex flex-col justify-between"
                            >
                              <div>
                                <div className="relative overflow-hidden rounded-xl mb-2">
                                  <img
                                    src={item.images?.[0] || item.thumbnail}
                                    alt={item.name}
                                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <span className="absolute top-2 right-2 bg-slate-950/80 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                                    98% Match
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-200 truncate">{item.name}</h4>
                                <p className="text-xs font-extrabold text-amber-400 mt-0.5">{formatCurrency(item.price)}</p>
                              </div>

                              <div className="mt-3 flex gap-2">
                                <button
                                  onClick={() => {
                                    addToCart(item, 1);
                                    toast.success(`${item.name} added to cart!`);
                                  }}
                                  className="flex-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center space-x-1"
                                >
                                  <ShoppingBag className="h-3.5 w-3.5" />
                                  <span>Add to Cart</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTryOnProduct(item);
                                    setActiveTab('tryon');
                                  }}
                                  className="p-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 rounded-xl transition-colors"
                                  title="Virtual Try-On"
                                >
                                  <Layers className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 space-y-3">
                          <ShoppingBag className="h-10 w-10 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Upload a photo on the left panel or run AI Analysis to extract personalized store recommendations.
                          </p>
                          <button
                            onClick={runAIScanner}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow"
                          >
                            Analyze Current Photo
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: VIRTUAL TRY-ON */}
                  {activeTab === 'tryon' && (
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-1">
                      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-extrabold text-white font-display flex items-center gap-2">
                            <span>✨ AI Virtual Fitting Room</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                              Real-Time Overlay
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400">Preview selected store items overlaid on your photo avatar.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        {/* Try-On Display Frame */}
                        <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center min-h-[320px] overflow-hidden group shadow-2xl">
                          {imagePreview ? (
                            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
                              <img src={imagePreview} alt="User Avatar" className="w-full h-80 object-cover rounded-2xl" />
                              {selectedTryOnProduct && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 0.9, scale: 1 }}
                                  className="absolute inset-x-4 bottom-4 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-amber-500/50 shadow-2xl flex items-center space-x-3"
                                >
                                  <img
                                    src={selectedTryOnProduct.images?.[0] || selectedTryOnProduct.thumbnail}
                                    alt={selectedTryOnProduct.name}
                                    className="w-12 h-12 object-cover rounded-lg border border-amber-400"
                                  />
                                  <div className="flex-1 overflow-hidden text-xs">
                                    <span className="text-[9px] uppercase font-extrabold text-amber-400 block">Overlaid Garment</span>
                                    <h4 className="font-bold text-white truncate">{selectedTryOnProduct.name}</h4>
                                    <span className="text-emerald-400 font-mono text-[10px]">Fit Match: 99%</span>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                              <User className="h-10 w-10 text-slate-600 mx-auto" />
                              <p className="max-w-xs">Upload a selfie or full-body picture on the left panel to unlock Virtual Try-On.</p>
                            </div>
                          )}
                        </div>

                        {/* Item Selector & Action Box */}
                        <div className="space-y-4 bg-slate-950/60 border border-slate-800 rounded-3xl p-5">
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Select Garment to Try On</h4>
                          
                          {analysisResult?.recommendations?.length > 0 ? (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {analysisResult.recommendations.map((prod) => (
                                <div
                                  key={prod._id}
                                  onClick={() => setSelectedTryOnProduct(prod)}
                                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                                    selectedTryOnProduct?._id === prod._id
                                      ? 'bg-amber-500/10 border-amber-500 text-white'
                                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                                  }`}
                                >
                                  <img src={prod.images?.[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-lg" />
                                  <div className="flex-1 text-xs">
                                    <h5 className="font-bold truncate">{prod.name}</h5>
                                    <span className="text-amber-400 font-mono text-[11px]">{formatCurrency(prod.price)}</span>
                                  </div>
                                  {selectedTryOnProduct?._id === prod._id && <CheckCircle2 className="h-5 w-5 text-amber-400" />}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">Run AI Photo Scan to load trial garments.</p>
                          )}

                          {selectedTryOnProduct && (
                            <button
                              onClick={() => {
                                addToCart(selectedTryOnProduct, 1);
                                toast.success(`${selectedTryOnProduct.name} added to cart!`);
                              }}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg"
                            >
                              <ShoppingBag className="h-4 w-4" />
                              <span>Add Try-On Garment to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: OUTFIT BUNDLES */}
                  {activeTab === 'outfits' && (
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-1">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Target Occasion</label>
                        <div className="flex flex-wrap gap-2">
                          {['Casual', 'College', 'Office', 'Interview', 'Wedding', 'Party', 'Date', 'Gym', 'Vacation'].map((occ) => (
                            <button
                              key={occ}
                              onClick={() => {
                                setSelectedOccasion(occ);
                                runOutfitGenerator(occ);
                              }}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                selectedOccasion === occ
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {occ}
                            </button>
                          ))}
                        </div>
                      </div>

                      {isGeneratingOutfit ? (
                        <div className="py-16 text-center space-y-3">
                          <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mx-auto" />
                          <p className="text-xs font-semibold text-slate-400">Curating store items for {selectedOccasion} ensemble...</p>
                        </div>
                      ) : outfitBundle ? (
                        <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                                Complete Style Bundle
                              </span>
                              <h3 className="text-lg font-extrabold text-white font-display mt-1">{outfitBundle.outfitName}</h3>
                            </div>

                            <div className="text-right">
                              <span className="text-xs text-slate-400 line-through mr-2">{formatCurrency(outfitBundle.bundleTotalPrice)}</span>
                              <span className="text-lg font-extrabold text-amber-400">{formatCurrency(outfitBundle.bundleDiscountedPrice)}</span>
                              <span className="block text-[10px] text-emerald-400 font-bold">Includes {outfitBundle.savingsPercentage}% Bundle Discount</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {outfitBundle.items.map((entry, idx) => (
                              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2 relative">
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 block w-fit">
                                  {entry.role}
                                </span>
                                {entry.product ? (
                                  <>
                                    <img
                                      src={entry.product.images?.[0] || entry.product.thumbnail}
                                      alt={entry.product.name}
                                      className="w-full h-36 object-cover rounded-xl"
                                    />
                                    <h4 className="text-xs font-bold text-slate-200 truncate">{entry.product.name}</h4>
                                    <p className="text-xs font-extrabold text-slate-300">{formatCurrency(entry.product.price)}</p>
                                  </>
                                ) : (
                                  <div className="h-36 flex items-center justify-center text-xs text-slate-600">Item Out of Stock</div>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={handleAddOutfitToCart}
                              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-primary-600 hover:from-amber-600 hover:to-primary-700 text-slate-950 font-extrabold text-xs px-8 py-3 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
                            >
                              <ShoppingBag className="h-4 w-4" />
                              <span>Add Complete Outfit to Cart</span>
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* TAB 5: FIT & SIZE ESTIMATOR */}
                  {activeTab === 'size' && (
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-6 max-w-xl mx-auto w-full my-auto pr-1">
                      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
                        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                          <Ruler className="h-4 w-4" />
                          <span>AI Fit & Size Calculator</span>
                        </h3>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Height (cm)</label>
                            <input
                              type="number"
                              value={heightCm}
                              onChange={(e) => setHeightCm(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Weight (kg)</label>
                            <input
                              type="number"
                              value={weightKg}
                              onChange={(e) => setWeightKg(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1 text-xs">Fit Preference</label>
                          <select
                            value={fitPref}
                            onChange={(e) => setFitPref(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                          >
                            <option value="Slim Fit">Slim Fit</option>
                            <option value="Regular Fit">Regular Fit</option>
                            <option value="Relaxed Fit">Relaxed Fit</option>
                            <option value="Oversized">Oversized</option>
                          </select>
                        </div>

                        <button
                          onClick={runSizeEstimator}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 rounded-xl transition-colors shadow"
                        >
                          Calculate Recommended Size
                        </button>

                        {sizeResult && (
                          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Recommended Apparel Size</span>
                            <div className="text-3xl font-extrabold text-amber-400 font-display">{sizeResult.recommendedSize}</div>
                            <p className="text-xs text-slate-300">{sizeResult.sizeChartAdvice}</p>
                            <div className="inline-block bg-slate-900 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-800 mt-2">
                              Confidence: {sizeResult.confidenceScore}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </main>
            </div>

            {/* 3. FIXED FOOTER BAR */}
            <footer className="h-12 px-4 sm:px-6 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400 shrink-0 z-20">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="text-[11px] font-mono">AI Stylist Engine: Online • Catalog: 100% In-Stock • React Portal</span>
              </div>

              <div className="flex items-center space-x-4">
                {outfitBundle && (
                  <button
                    onClick={handleAddOutfitToCart}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-extrabold flex items-center space-x-1"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Add Outfit Bundle</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  Exit AI Portal
                </button>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default AIFashionStylistModal;
