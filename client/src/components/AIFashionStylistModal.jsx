import { useState, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Upload,
  Camera,
  ShoppingBag,
  CheckCircle2,
  Sliders,
  Ruler,
  RefreshCw,
  Search,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';

const AIFashionStylistModal = ({ isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'outfits' | 'size' | 'search'

  // Image Upload & Camera states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Camera capture states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Outfit Generator states
  const [selectedOccasion, setSelectedOccasion] = useState('Casual');
  const [outfitBundle, setOutfitBundle] = useState(null);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);

  // Size Estimator states
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [fitPref, setFitPref] = useState('Regular Fit');
  const [sizeResult, setSizeResult] = useState(null);

  // Natural Language Search states
  const [nlQuery, setNlQuery] = useState('');
  const [nlResults, setNlResults] = useState([]);
  const [isSearchingNL, setIsSearchingNL] = useState(false);

  // Handle file select
  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
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
      const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
      handleFileSelect(file);
      stopCamera();
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
        toast.success('AI Vision Analysis Complete! Store recommendations generated.');
      }
    } catch (err) {
      toast.error('AI Analysis Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsScanning(false);
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
      }
    } catch (err) {
      toast.error('Size Calculator Error');
    }
  };

  // Natural Language Search
  const runNLSearch = async (e) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setIsSearchingNL(true);
    try {
      const res = await axios.post('/api/ai/natural-search', { query: nlQuery });
      if (res.data.success) {
        setNlResults(res.data.results);
        if (res.data.results.length === 0) {
          toast('No matching store items found. Try adjusting keywords.', { icon: '🔍' });
        }
      }
    } catch (err) {
      toast.error('Search error');
    } finally {
      setIsSearchingNL(false);
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Main Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 z-10 my-8"
        >
          {/* Header Bar */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-tr from-amber-500 via-primary-600 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20">
                <Sparkles className="h-6 w-6 text-slate-950 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                  Rainbow AI Stylist Pro
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    Store-Only AI Engine
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Personalized Outfit Recommendations & Trait Analysis</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-3 space-x-2 overflow-x-auto">
            {[
              { id: 'scanner', label: '📸 AI Photo Scanner', icon: Camera },
              { id: 'outfits', label: '👗 Outfit Bundler', icon: Sliders },
              { id: 'size', label: '📏 Fit & Size Estimator', icon: Ruler },
              { id: 'search', label: '💬 AI Smart Search', icon: Search },
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
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                    isActive
                      ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* TAB 1: AI PHOTO SCANNER */}
            {activeTab === 'scanner' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload / Camera Box */}
                  <div className="bg-slate-950/50 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden group">
                    {isCameraActive ? (
                      <div className="w-full space-y-3">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover rounded-xl border border-slate-700" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={capturePhoto}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5"
                          >
                            <Camera className="h-4 w-4" />
                            <span>Snap Photo</span>
                          </button>
                          <button
                            onClick={stopCamera}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : imagePreview ? (
                      <div className="w-full space-y-4">
                        <div className="relative">
                          <img src={imagePreview} alt="User Preview" className="w-full h-56 object-cover rounded-xl border border-amber-500/30 shadow-lg" />
                          {isScanning && (
                            <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[2px] rounded-xl border-2 border-amber-400 animate-pulse flex flex-col items-center justify-center">
                              <Sparkles className="h-10 w-10 text-amber-400 animate-spin mb-2" />
                              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest bg-slate-950/80 px-3 py-1 rounded-full">
                                Scanning Body Traits & Color Palette...
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={runAIScanner}
                            disabled={isScanning}
                            className="bg-gradient-to-r from-amber-500 to-primary-600 hover:from-amber-600 hover:to-primary-700 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg flex items-center space-x-2"
                          >
                            <Zap className="h-4 w-4" />
                            <span>{isScanning ? 'Analyzing...' : 'Analyze Photo Traits'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                              setAnalysisResult(null);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl text-xs"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 py-6">
                        <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full inline-block">
                          <Upload className="h-8 w-8" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-200">Upload Selfie or Full Body Photo</h4>
                          <p className="text-xs text-slate-500 max-w-xs mt-1">Supports JPG, PNG, WEBP. AI analyzes skin tone, build, and current style.</p>
                        </div>
                        <div className="flex justify-center gap-3 pt-2">
                          <label className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all shadow">
                            <span>Choose Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e.target.files[0])}
                            />
                          </label>
                          <button
                            onClick={startCamera}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5"
                          >
                            <Camera className="h-4 w-4 text-amber-400" />
                            <span>Use Camera</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Trait Breakdown Panel */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Extracted Feature Breakdown</span>
                    </h3>

                    {analysisResult ? (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Body Shape</span>
                            <span className="font-bold text-slate-100">{analysisResult.traits.bodyType}</span>
                          </div>
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Skin Tone</span>
                            <span className="font-bold text-amber-300">{analysisResult.traits.skinTone}</span>
                          </div>
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Style Profile</span>
                            <span className="font-bold text-slate-100">{analysisResult.traits.detectedStyle}</span>
                          </div>
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Hair Accent</span>
                            <span className="font-bold text-slate-100">{analysisResult.traits.hairColor}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] mb-1">Recommended Complementary Colors</span>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.traits.complementaryColors.map((col, idx) => (
                              <span key={idx} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {col}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] mb-1">Optimal Fit Recommendations</span>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.traits.recommendedFits.map((fit, idx) => (
                              <span key={idx} className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded-full">
                                {fit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-500 text-xs">
                        Upload or capture a photo to view AI skin tone and body feature extractions.
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Store Recommendations Catalog Grid */}
                {analysisResult && analysisResult.recommendations?.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Matching MongoDB Store Catalog ({analysisResult.recommendations.length} Items)</span>
                      <span className="text-[10px] text-amber-400 font-extrabold">100% In-Stock Guaranteed</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {analysisResult.recommendations.map((item) => (
                        <div key={item._id} className="bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-3 transition-all group relative">
                          <img
                            src={item.images?.[0] || item.thumbnail}
                            alt={item.name}
                            className="w-full h-32 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                          />
                          <h5 className="text-xs font-bold text-slate-200 truncate">{item.name}</h5>
                          <p className="text-xs font-extrabold text-amber-400 mt-0.5">{formatCurrency(item.price)}</p>
                          <div className="mt-2 flex gap-1.5">
                            <button
                              onClick={() => {
                                addToCart(item, 1);
                                toast.success(`${item.name} added to cart!`);
                              }}
                              className="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center space-x-1"
                            >
                              <ShoppingBag className="h-3 w-3" />
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: OUTFIT BUNDLER */}
            {activeTab === 'outfits' && (
              <div className="space-y-6">
                {/* Occasion Selection Bar */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Occasion</label>
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
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Outfit Bundle Display Card */}
                {isGeneratingOutfit ? (
                  <div className="py-16 text-center space-y-3">
                    <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-slate-400">Curating store items for {selectedOccasion} ensemble...</p>
                  </div>
                ) : outfitBundle ? (
                  <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 space-y-6">
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

                    {/* Outfit Items Grid */}
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

                    {/* Add Complete Bundle Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleAddOutfitToCart}
                        className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-primary-600 hover:from-amber-600 hover:to-primary-700 text-slate-950 font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Add Complete Outfit to Cart</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* TAB 3: FIT & SIZE ESTIMATOR */}
            {activeTab === 'size' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 space-y-5">
                  <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                    <Ruler className="h-4 w-4" />
                    <span>AI Body & Fit Calculator</span>
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

            {/* TAB 4: NATURAL LANGUAGE SEARCH */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <form onSubmit={runNLSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder='Try: "Black blazer under 5000" or "College wear"...'
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-2xl flex items-center space-x-1.5 shadow"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search Store</span>
                  </button>
                </form>

                {isSearchingNL ? (
                  <div className="py-12 text-center text-xs text-amber-400 animate-pulse">Searching MongoDB catalog...</div>
                ) : nlResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {nlResults.map((item) => (
                      <div key={item._id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-2">
                        <img src={item.images?.[0] || item.thumbnail} alt={item.name} className="w-full h-32 object-cover rounded-xl" />
                        <h5 className="text-xs font-bold text-slate-200 truncate">{item.name}</h5>
                        <p className="text-xs font-extrabold text-amber-400">{formatCurrency(item.price)}</p>
                        <button
                          onClick={() => {
                            addToCart(item, 1);
                            toast.success(`${item.name} added!`);
                          }}
                          className="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold py-1.5 rounded-lg transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-500">
                    Type any query in plain English to search strictly across active inventory.
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIFashionStylistModal;
