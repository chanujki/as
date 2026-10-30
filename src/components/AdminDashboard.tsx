import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ShoppingBag,
  Package,
  Plus,
  Trash2,
  Edit2,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  ArrowLeft,
  Phone,
  MapPin,
  Image as ImageIcon,
  Check,
  Megaphone,
  Bell,
  Sparkles,
  Eye,
  Palette,
  Upload,
  LayoutDashboard,
  Sliders,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  Send,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, ProductCategory, Order, HeroBannerSlide } from '../types';
import { AdminChatInbox } from './AdminChatInbox';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE, DEFAULT_BANNER_IMAGE } from '../utils/imageUtils';

// Helper to compress and read image files from gallery/disk to prevent localStorage quota exhaustion
const compressAndReadImage = (file: File, maxWidth = 900, maxHeight = 900, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Preset Color Palettes for 1-click theme customizer
const THEME_PALETTES = [
  { id: 'cyber-blue', name: '⚡ সাইবার ব্লু (Electric Blue)', primary: '#168BFF', accent: '#00D4FF', badge: 'Default' },
  { id: 'fire-red', name: '🔥 ফায়ার রেড (Crimson Red)', primary: '#E11D48', accent: '#FB7185', badge: 'Vibrant' },
  { id: 'emerald-green', name: '🌿 এমারেল্ড গ্রীন (Tech Green)', primary: '#059669', accent: '#34D399', badge: 'Fresh' },
  { id: 'royal-purple', name: '👑 রয়্যাল পার্পল (Royal Purple)', primary: '#7C3AED', accent: '#A78BFA', badge: 'Premium' },
  { id: 'neon-amber', name: '🏆 নিয়ন গোল্ডেন (Amber Gold)', primary: '#D97706', accent: '#FBBF24', badge: 'Warm' },
  { id: 'cyber-pink', name: '💖 নিয়ন পিঙ্ক (Cyber Hot Pink)', primary: '#DB2777', accent: '#F472B6', badge: 'Neon' },
  { id: 'ocean-teal', name: '🌌 ডিপ ওশান টিল (Ocean Teal)', primary: '#0D9488', accent: '#2DD4BF', badge: 'Cool' },
  { id: 'stealth-slate', name: '🖤 স্টিলথ ডার্ক (Dark Slate)', primary: '#475569', accent: '#94A3B8', badge: 'Minimal' },
];

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    deleteOrder,
    formatBDT,
    setInvoiceOrder,
    setCurrentView,
    settings,
    updateSettings,
    language,
    showToast,
    chatMessages,
    sendChatMessage,
    isFirestoreConnected
  } = useApp();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'notice-banner' | 'theme' | 'settings' | 'chat'>('dashboard');
  const [orderFilter, setOrderFilter] = useState<'all' | 'Pending' | 'Accepted' | 'Rejected' | 'Delivered'>('all');

  // Live Chat management state
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<string>('');
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isAdminSendingReply, setIsAdminSendingReply] = useState(false);

  // Product Search & Filter in Admin
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  // Product addition state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(1500);
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState(1800);
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('computer-accessories');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('AS Tech');
  const [newProdImage, setNewProdImage] = useState('/images/category_mechanical_keyboard_1793020164307.jpg');
  const [newProdImage2, setNewProdImage2] = useState('');
  const [newProdImage3, setNewProdImage3] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Warranty & Return Policy settings per product (User Request #1)
  const [warrantyType, setWarrantyType] = useState<string>('1-year');
  const [customWarrantyInput, setCustomWarrantyInput] = useState<string>('');
  const [returnPolicyType, setReturnPolicyType] = useState<string>('7-days');
  const [customReturnInput, setCustomReturnInput] = useState<string>('');

  // Hidden file input refs for gallery uploads
  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const secondImageFileRef = useRef<HTMLInputElement>(null);
  const thirdImageFileRef = useRef<HTMLInputElement>(null);
  const bannerImageFileRef = useRef<HTMLInputElement>(null);

  // Inline editing state for quick stock/price/warranty updates
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [editWarranty, setEditWarranty] = useState('');
  const [editReturnPolicy, setEditReturnPolicy] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Confirmation state for deleting items without browser-blocking window.confirm
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);

  // Store Settings
  const [storeLogoUrl, setStoreLogoUrl] = useState(settings.logoUrl || 'https://i.imgur.com/OfCvr1N.jpeg');
  const [ownerName, setOwnerName] = useState(settings.ownerName || 'Md. Amir Hamza');
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [freeThreshold, setFreeThreshold] = useState(settings.freeShippingThreshold);
  const [insideDhakaFee, setInsideDhakaFee] = useState(settings.shippingFeeInsideDhaka);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState(settings.shippingFeeOutsideDhaka);
  const [hotline, setHotline] = useState(settings.supportPhone);

  // Notice Bar State
  const [noticeEnabled, setNoticeEnabled] = useState(settings.noticeEnabled !== false);
  const [noticeBadgeText, setNoticeBadgeText] = useState(settings.noticeBadgeText || 'NOTICE');
  const [noticeText, setNoticeText] = useState(
    settings.noticeText ||
    'বিকাশ ছাড়া নগদ ও রকেটে লেনদেন করার আগে অবশ্যই আমাদের হটলাইন ০১৭২৩-৩৭৩১-৩৩ নাম্বারে কল দিয়ে নিশ্চিত হয়ে নিন। প্রতারক চক্র থেকে সতর্ক থাকুন। প্রতারিত হলে কর্তৃপক্ষ দায়ী থাকবে না।'
  );
  const [noticeBgColor, setNoticeBgColor] = useState<'red' | 'amber' | 'emerald' | 'blue' | 'purple' | 'custom'>(settings.noticeBgColor || 'red');
  const [noticeCustomBg, setNoticeCustomBg] = useState(settings.noticeCustomBg || '#991B1B');
  const [noticeScrollable, setNoticeScrollable] = useState(settings.noticeScrollable !== false);

  // Multi-Banner Carousel Slides State (User Request #2: 1 banner or 2-3 scrolling banners)
  const [bannerSlides, setBannerSlides] = useState<HeroBannerSlide[]>(() => {
    if (settings.banners && settings.banners.length > 0) {
      return settings.banners;
    }
    return [
      {
        id: 'banner-1',
        image: settings.bannerImage || '/images/hero_setup_showcase_1793020165334.jpg',
        title: settings.bannerTitle || 'AS Computer — কম্পিউটার এক্সেসরিজ ও গ্যাজেট শপ',
        titleBn: settings.bannerTitleBn || settings.bannerTitle || 'AS Computer — কম্পিউটার এক্সেসরিজ ও গ্যাজেট শপ',
        subtitle: settings.bannerSubtitle || 'কিবোর্ড, মাউস, মিনি ফ্যান, কেবল, কনভার্টার, অডিও ও কুলিং ফ্যান সহ সকল কম্পিউটার সামগ্রী সহজে ও দ্রুত অর্ডার করুন।',
        subtitleBn: settings.bannerSubtitleBn || settings.bannerSubtitle || 'কিবোর্ড, মাউস, মিনি ফ্যান, কেবল, কনভার্টার, অডিও ও কুলিং ফ্যান সহ সকল কম্পিউটার সামগ্রী সহজে ও দ্রুত অর্ডার করুন।',
        buttonText: settings.bannerButtonText || 'সকল প্রোডাক্ট দেখুন',
        buttonTextBn: settings.bannerButtonTextBn || settings.bannerButtonText || 'সকল প্রোডাক্ট দেখুন',
        link: settings.bannerLink || 'all',
      }
    ];
  });
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Website Theme & Colors State
  const [themePrimary, setThemePrimary] = useState(settings.themePrimary || '#168BFF');
  const [themeAccent, setThemeAccent] = useState(settings.themeAccent || '#00D4FF');
  const [themePreset, setThemePreset] = useState(settings.themePreset || 'cyber-blue');

  // Pre-configured Banner Presets
  const bannerPresets = [
    { label: 'Gaming & Desk Setup', url: '/images/hero_setup_showcase_1793020165334.jpg' },
    { label: 'Mechanical Keyboard Showcase', url: '/images/category_mechanical_keyboard_1793020164307.jpg' },
    { label: 'Headphones & Audio Gear', url: '/images/category_headphones_audio_1793020166252.jpg' },
    { label: 'Cooling Fans & Setup', url: '/images/category_cooling_fan_1793020166097.jpg' },
    { label: 'USB-C Docking Hubs & Cables', url: '/images/category_usbc_docking_hub_1793020166283.jpg' }
  ];

  // Pre-configured high quality image presets for accessories
  const imagePresets = [
    { label: 'Mechanical Keyboard', url: '/images/category_mechanical_keyboard_1793020164307.jpg' },
    { label: 'Audio Headphones', url: '/images/category_headphones_audio_1793020166252.jpg' },
    { label: 'USB-C Docking Hub', url: '/images/category_usbc_docking_hub_1793020166283.jpg' },
    { label: 'Desktop Cooling Fan', url: '/images/category_cooling_fan_1793020166097.jpg' },
    { label: 'Desk Setup Gear', url: '/images/hero_setup_showcase_1793020165334.jpg' },
  ];

  // Calculated Stats
  const pendingCount = orders.filter(o => o.orderStatus === 'Pending').length;
  const acceptedCount = orders.filter(o => o.orderStatus === 'Accepted' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Shipped').length;
  const rejectedCount = orders.filter(o => o.orderStatus === 'Rejected' || o.orderStatus === 'Cancelled').length;
  const deliveredCount = orders.filter(o => o.orderStatus === 'Delivered').length;
  const totalRevenue = orders.reduce((acc, curr) => (curr.orderStatus !== 'Rejected' && curr.orderStatus !== 'Cancelled' ? acc + curr.total : acc), 0);
  const lowStockProducts = products.filter(p => p.stock <= 5);

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'Pending') return o.orderStatus === 'Pending';
    if (orderFilter === 'Accepted') return o.orderStatus === 'Accepted' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Shipped';
    if (orderFilter === 'Rejected') return o.orderStatus === 'Rejected' || o.orderStatus === 'Cancelled';
    if (orderFilter === 'Delivered') return o.orderStatus === 'Delivered';
    return true;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle Gallery Upload for Product Photos
  const handleProductImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'image2' | 'image3') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const dataUrl = await compressAndReadImage(file);
      if (target === 'main') setNewProdImage(dataUrl);
      if (target === 'image2') setNewProdImage2(dataUrl);
      if (target === 'image3') setNewProdImage3(dataUrl);
      showToast('গ্যালারি থেকে ছবি সফলভাবে যুক্ত হয়েছে!', 'success');
    } catch (err) {
      console.error(err);
      showToast('ছবি আপলোড করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।', 'warning');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Handle Gallery Upload for Current Active Hero Banner Slide
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const dataUrl = await compressAndReadImage(file, 1280, 720, 0.82);
      handleUpdateSlide(activeSlideIndex, { image: dataUrl });
      showToast('ব্যানার ছবি সফলভাবে গ্যালারি থেকে লোড হয়েছে!', 'success');
    } catch (err) {
      console.error(err);
      showToast('ব্যানার ছবি আপলোড ব্যর্থ হয়েছে।', 'warning');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Helper to resolve effective warranty string
  const getEffectiveWarranty = () => {
    if (warrantyType === 'none') return 'No Warranty';
    if (warrantyType === '7-days') return '7 Days Replacement Warranty';
    if (warrantyType === '1-month') return '1 Month Warranty';
    if (warrantyType === '3-months') return '3 Months Warranty';
    if (warrantyType === '6-months') return '6 Months Official Warranty';
    if (warrantyType === '1-year') return '1 Year Official Warranty';
    if (warrantyType === '2-years') return '2 Years Official Warranty';
    if (warrantyType === 'custom') return customWarrantyInput.trim() || 'No Warranty';
    return '1 Year Official Warranty';
  };

  // Helper to resolve effective return / replacement policy
  const getEffectiveReturnPolicy = () => {
    if (returnPolicyType === 'none') return 'No Replacement / Non-returnable';
    if (returnPolicyType === '3-days') return '3 Days Check Warranty';
    if (returnPolicyType === '7-days') return '7 Days Replacement for physical defects';
    if (returnPolicyType === '10-days') return '10 Days Replacement';
    if (returnPolicyType === 'custom') return customReturnInput.trim() || 'No Replacement / Non-returnable';
    return '7 Days Replacement for physical defects';
  };

  // Handle Product Submission
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      showToast('অনুগ্রহ করে পণ্যের নাম দিন', 'warning');
      return;
    }

    const mainImg = newProdImage.trim() || '/images/category_mechanical_keyboard_1793020164307.jpg';
    const imagesList: string[] = [mainImg];
    if (newProdImage2.trim()) imagesList.push(newProdImage2.trim());
    if (newProdImage3.trim()) imagesList.push(newProdImage3.trim());

    if (imagesList.length === 1) {
      imagesList.push(mainImg);
    }

    const sku = `ASC-${Math.floor(100 + Math.random() * 900)}`;
    const effectiveCategory = (isCustomCategory && customCategoryInput.trim())
      ? (customCategoryInput.trim().toLowerCase().replace(/\s+/g, '-'))
      : newProdCategory;

    const finalWarranty = getEffectiveWarranty();
    const finalReturnPolicy = getEffectiveReturnPolicy();

    const desc = newProdDesc.trim() || 'AS Computer-এর সেরা মানের অথেনটিক কম্পিউটার ও গ্যাজেট পণ্য।';

    addProduct({
      sku,
      name: newProdName,
      nameBn: newProdName,
      brand: newProdBrand || 'AS Tech',
      category: effectiveCategory as any,
      price: Number(newProdPrice),
      originalPrice: Number(newProdOriginalPrice) > Number(newProdPrice) ? Number(newProdOriginalPrice) : undefined,
      discountPercent: Number(newProdOriginalPrice) > Number(newProdPrice)
        ? Math.round(((Number(newProdOriginalPrice) - Number(newProdPrice)) / Number(newProdOriginalPrice)) * 100)
        : undefined,
      stock: Number(newProdStock),
      rating: 5.0,
      reviewCount: 1,
      thumbnail: mainImg,
      images: imagesList,
      description: desc,
      descriptionBn: desc,
      specs: { 'Brand': newProdBrand, 'Warranty': finalWarranty },
      warranty: finalWarranty,
      returnPolicy: finalReturnPolicy,
      badges: ['New']
    });

    showToast('নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!', 'success');

    // Reset Form
    setNewProdName('');
    setNewProdDesc('');
    setNewProdImage2('');
    setNewProdImage3('');
    if (isCustomCategory) {
      setCustomCategoryInput('');
      setIsCustomCategory(false);
    }
  };

  const handleStartEdit = (p: Product) => {
    setEditingId(p.id);
    setEditPrice(p.price);
    setEditStock(p.stock);
    setEditWarranty(p.warranty || 'No Warranty');
    setEditReturnPolicy(p.returnPolicy || '7 Days Replacement for physical defects');
    setEditDesc(p.description || p.descriptionBn || '');
  };

  const handleSaveEdit = (id: string) => {
    updateProduct(id, {
      price: editPrice,
      stock: editStock,
      warranty: editWarranty,
      returnPolicy: editReturnPolicy,
      description: editDesc,
      descriptionBn: editDesc
    });
    setEditingId(null);
    showToast('প্রোডাক্ট তথ্য, বিবরণ ও ওয়ারেন্টি সফলভাবে আপডেট হয়েছে', 'success');
  };

  // Banner Slide Manipulation
  const handleAddNewSlide = () => {
    const newSlide: HeroBannerSlide = {
      id: `banner-${Date.now()}`,
      image: '/images/hero_setup_showcase_1793020165334.jpg',
      title: 'নতুন ধামাকা গ্যাজেট অফার',
      titleBn: 'নতুন ধামাকা গ্যাজেট অফার',
      subtitle: 'সেরা মানের গ্যাজেট ও কম্পিউটার এক্সেসরিজ আকর্ষণীয় মূল্যে কিনুন।',
      subtitleBn: 'সেরা মানের গ্যাজেট ও কম্পিউটার এক্সেসরিজ আকর্ষণীয় মূল্যে কিনুন।',
      buttonText: 'অফার দেখুন',
      buttonTextBn: 'অফার দেখুন',
      link: 'shop',
    };
    const updated = [...bannerSlides, newSlide];
    setBannerSlides(updated);
    setActiveSlideIndex(updated.length - 1);
    showToast('নতুন ব্যানার স্লাইড তৈরি হয়েছে! এবার ছবি ও লেখা পরিবর্তন করুন।', 'info');
  };

  const handleDeleteSlide = (idxToDelete: number) => {
    if (bannerSlides.length <= 1) {
      showToast('কমপক্ষে ১টি ব্যানার ছবি থাকা প্রয়োজন।', 'warning');
      return;
    }
    const updated = bannerSlides.filter((_, idx) => idx !== idxToDelete);
    setBannerSlides(updated);
    setActiveSlideIndex(0);
    showToast('স্লাইড মুছে ফেলা হয়েছে', 'info');
  };

  const handleUpdateSlide = (idx: number, patch: Partial<HeroBannerSlide>) => {
    const updated = bannerSlides.map((slide, i) => {
      if (i === idx) {
        return { ...slide, ...patch };
      }
      return slide;
    });
    setBannerSlides(updated);
  };

  const handleSaveNoticeBanner = (e: React.FormEvent) => {
    e.preventDefault();
    const primarySlide = bannerSlides[0] || {
      image: '/images/hero_setup_showcase_1793020165334.jpg',
      title: 'AS Computer',
      subtitle: '',
      buttonText: 'Shop',
      link: 'all'
    };

    updateSettings({
      noticeEnabled,
      noticeBadgeText,
      noticeText,
      noticeBgColor,
      noticeCustomBg,
      noticeScrollable,
      banners: bannerSlides,
      bannerImage: primarySlide.image,
      bannerTitle: primarySlide.title,
      bannerTitleBn: primarySlide.titleBn || primarySlide.title,
      bannerSubtitle: primarySlide.subtitle,
      bannerSubtitleBn: primarySlide.subtitleBn || primarySlide.subtitle,
      bannerButtonText: primarySlide.buttonText,
      bannerButtonTextBn: primarySlide.buttonTextBn || primarySlide.buttonText,
      bannerLink: primarySlide.link,
    });
    showToast('নোটিশ এবং ব্যানার স্লাইডার সফলভাবে সেভ করা হয়েছে!', 'success');
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      themePrimary,
      themeAccent,
      themePreset,
    });
    showToast('ওয়েবসাইটের রঙ ও থিম সফলভাবে আপডেট হয়েছে!', 'success');
  };

  const handleApplyPalette = (palette: typeof THEME_PALETTES[0]) => {
    setThemePrimary(palette.primary);
    setThemeAccent(palette.accent);
    setThemePreset(palette.id);
    updateSettings({
      themePrimary: palette.primary,
      themeAccent: palette.accent,
      themePreset: palette.id,
    });
    showToast(`${palette.name} থিম সফলভাবে সেট করা হয়েছে!`, 'success');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      logoUrl: storeLogoUrl,
      ownerName,
      storeAddress,
      supportEmail,
      freeShippingThreshold: Number(freeThreshold),
      shippingFeeInsideDhaka: Number(insideDhakaFee),
      shippingFeeOutsideDhaka: Number(outsideDhakaFee),
      supportPhone: hotline,
      supportWhatsApp: hotline.replace(/[^0-9]/g, '').startsWith('88') ? `+${hotline.replace(/[^0-9]/g, '')}` : `+88${hotline.replace(/[^0-9]/g, '')}`,
    });
    showToast('শপ সেটিংস সফলভাবে আপডেট হয়েছে!', 'success');
  };

  const currentActiveSlide = bannerSlides[activeSlideIndex] || bannerSlides[0];

  return (
    <div className="py-6 sm:py-8 bg-[#050914] min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-6">

        {/* ===================== TOP HEADER ===================== */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#08172B] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#168BFF]/20 text-[#00D4FF] border border-[#168BFF]/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {language === 'bn' ? 'এডমিন মাস্টার কন্ট্রোল প্যানেল' : 'AS Computer Master Admin Panel'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  {settings.ownerName || 'Md. Amir Hamza'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  সিস্টেম অ্যাক্টিভ
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                হটলাইন: <strong className="text-[#00D4FF] font-mono">{settings.supportPhone}</strong> · ইমেইল: <span className="font-mono text-slate-400">{settings.supportEmail}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                📍 {settings.storeAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#00D4FF] text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:bg-slate-800 shadow"
            >
              <ArrowLeft className="w-4 h-4 text-[#00D4FF]" />
              <span>{language === 'bn' ? 'স্টোরে ফিরুন (লাইভ সাইট)' : 'Back to Store'}</span>
            </button>
          </div>
        </div>

        {/* ===================== ORGANIZED TABS NAVIGATION ===================== */}
        <div className="bg-[#08172B] p-1.5 rounded-2xl border border-slate-800 shadow-md">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1.5 text-xs font-bold">
            {/* Tab 1: Dashboard Overview */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#168BFF] to-[#00D4FF] text-white shadow-lg'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>ড্যাশবোর্ড</span>
            </button>

            {/* Tab 2: Products & Stock */}
            <button
              onClick={() => setActiveTab('products')}
              className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'products'
                  ? 'bg-[#168BFF] text-white shadow-lg'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>প্রোডাক্ট ও ওয়ারেন্টি</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-[10px]">
                {products.length}
              </span>
            </button>

            {/* Tab 3: Order Management */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 relative ${
                activeTab === 'orders'
                  ? 'bg-[#168BFF] text-white shadow-lg'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>অর্ডার ও চালান</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Tab 4: Notice & Banner Carousel Control */}
            <button
              onClick={() => setActiveTab('notice-banner')}
              className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'notice-banner'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-300 shrink-0" />
              <span>নোটিশ ও ব্যানার ({bannerSlides.length})</span>
            </button>

            {/* Tab 5: Website Colors & Theme */}
            <button
              onClick={() => setActiveTab('theme')}
              className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'theme'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Palette className="w-4 h-4 text-pink-300 shrink-0" />
              <span>কালার ও থিম</span>
            </button>

            {/* Tab 6: Live Chat Inbox (Firebase Firestore) */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 relative ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>লাইভ চ্যাট</span>
              {chatMessages.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold text-[10px]">
                  {chatMessages.length}
                </span>
              )}
            </button>

            {/* Tab 7: Store Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-[#168BFF] text-white shadow-lg'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>শপ সেটিংস</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ===================== TAB 1: DASHBOARD OVERVIEW ========================= */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#08172B] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>মোট অর্ডার</span>
                  <ShoppingBag className="w-4 h-4 text-[#00D4FF]" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">{orders.length}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-bold">✓ {deliveredCount} ডেলিভারড</span>
                  <span>·</span>
                  <span className="text-amber-400 font-bold">⏳ {pendingCount} পেন্ডিং</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#08172B] border border-amber-500/30 shadow-md bg-gradient-to-br from-[#08172B] to-amber-950/20">
                <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
                  <span>পেন্ডিং রিকোয়েস্ট</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-mono">{pendingCount}</p>
                <button
                  onClick={() => { setActiveTab('orders'); setOrderFilter('Pending'); }}
                  className="mt-2 text-[11px] text-[#00D4FF] hover:underline font-bold inline-flex items-center gap-1"
                >
                  এখনই প্রসেস করুন →
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#08172B] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>মোট বিক্রয় আয়</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-mono">{formatBDT(totalRevenue)}</p>
                <p className="text-[11px] text-slate-400 mt-2">সফল ও প্রক্রিয়াধীন অর্ডার হতে</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#08172B] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>ক্যাটালগ প্রোডাক্ট</span>
                  <Package className="w-4 h-4 text-[#168BFF]" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">{products.length}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px]">
                  {lowStockProducts.length > 0 ? (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {lowStockProducts.length}টি পণ্যের স্টক কম
                    </span>
                  ) : (
                    <span className="text-emerald-400">সকল পণ্যে পর্যাপ্ত স্টক আছে</span>
                  )}
                </div>
              </div>
            </div>

            {/* Firebase Firestore Database Status Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0B1A36] via-[#081F3D] to-[#0A182F] border border-[#168BFF]/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Firebase Firestore ক্লাউড ডেটাবেস সক্রিয় (Active)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      লাইভ কানেক্টেড
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    ফায়ারবেস প্রজেক্ট: <code className="text-[#00D4FF] font-mono bg-black/40 px-1.5 py-0.5 rounded">ascom-4118d</code> · কাস্টমার লাইভ চ্যাট ও যে কোনো ডেটা ইনপুট স্বয়ংক্রিয়ভাবে ফায়ারবেসে সেভ হচ্ছে।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('chat')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow flex items-center gap-2 shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>লাইভ চ্যাট ইনবক্স খুলুন ({chatMessages.length})</span>
              </button>
            </div>

            {/* Quick Action Hub */}
            <div className="p-6 rounded-2xl bg-[#08172B] border border-slate-800 space-y-4 shadow-lg">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                <span>একশন শর্টকাট (Quick Actions)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <button
                  onClick={() => setActiveTab('products')}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#168BFF] text-left transition-all hover:bg-slate-800/80 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#168BFF]/20 text-[#00D4FF] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm">নতুন প্রোডাক্ট ও ওয়ারেন্টি</h3>
                  <p className="text-slate-400 mt-1">কাস্টম ওয়ারেন্টি ও রিপ্লেসমেন্ট সহ প্রোডাক্ট এড করুন</p>
                </button>

                <button
                  onClick={() => setActiveTab('notice-banner')}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-left transition-all hover:bg-slate-800/80 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm">ব্যানার স্লাইডার (১ বা একাধিক)</h3>
                  <p className="text-slate-400 mt-1">হোমপেজের ব্যানার স্লাইড বা একক ব্যানার কনফিগার করুন</p>
                </button>

                <button
                  onClick={() => setActiveTab('theme')}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500 text-left transition-all hover:bg-slate-800/80 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Palette className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm">ওয়েবসাইট কালার পরিবর্তন</h3>
                  <p className="text-slate-400 mt-1">আপনার যেমন ইচ্ছা তেমন কালার দিয়ে ওয়েবসাইট সাজান</p>
                </button>

                <button
                  onClick={() => { setActiveTab('orders'); setOrderFilter('Pending'); }}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-left transition-all hover:bg-slate-800/80 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm">পেন্ডিং অর্ডার প্রসেস</h3>
                  <p className="text-slate-400 mt-1">গ্রাহকের ফোন নাম্বার, ঠিকানা দেখে কুরিয়ারে বুকিং দিন</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ===================== TAB 2: PRODUCTS & WARRANTY POLICY ================== */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Hidden file inputs for direct device/phone gallery picking */}
            <input
              type="file"
              ref={mainImageFileRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleProductImageFileUpload(e, 'main')}
            />
            <input
              type="file"
              ref={secondImageFileRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleProductImageFileUpload(e, 'image2')}
            />
            <input
              type="file"
              ref={thirdImageFileRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleProductImageFileUpload(e, 'image3')}
            />

            {/* ADD NEW PRODUCT FORM */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#08172B] border border-cyan-500/40 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#00D4FF]" />
                    <span>নতুন প্রোডাক্ট যোগ করুন (Add New Product)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    গ্যালারি থেকে ফটো বাছাই এবং প্রতিটি পণ্যের জন্য নির্দিষ্ট ওয়ারেন্টি ও রিপ্লেসমেন্ট পলিসি সেট করুন।
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
                  🛡️ ওয়ারেন্টি ও রিপ্লেসমেন্ট কন্ট্রোল সক্রিয়
                </span>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-5 text-xs">
                {/* Product Name & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-200">প্রোডাক্টের পুরো নাম * (Product Full Title)</label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={e => setNewProdName(e.target.value)}
                      placeholder="e.g. RGB Mechanical Keyboard, Turbo 10000mAh Mini Fan, ইত্যাদি"
                      className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:outline-none focus:border-[#168BFF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-200">ব্র্যান্ড (Brand)</label>
                    <input
                      type="text"
                      value={newProdBrand}
                      onChange={e => setNewProdBrand(e.target.value)}
                      placeholder="e.g. AS Tech, Vortex, Logitech"
                      className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:outline-none focus:border-[#168BFF]"
                    />
                  </div>
                </div>

                {/* Price, Original Price, Stock, Category */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-200">বিক্রয় মূল্য ৳ BDT *</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={newProdPrice}
                      onChange={e => setNewProdPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:outline-none focus:border-[#168BFF] font-mono font-bold text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">পূর্বের মূল্য ৳ (কাটা দাগ)</label>
                    <input
                      type="number"
                      min={10}
                      value={newProdOriginalPrice}
                      onChange={e => setNewProdOriginalPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-300 p-3 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-200">স্টক পরিমাণ * (Stock)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newProdStock}
                      onChange={e => setNewProdStock(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:outline-none focus:border-[#168BFF] font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-200">ক্যাটাগরি</label>
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(!isCustomCategory)}
                        className="text-[11px] text-[#00D4FF] hover:underline"
                      >
                        {isCustomCategory ? 'তালিকা' : '➕ নতুন'}
                      </button>
                    </div>

                    {!isCustomCategory ? (
                      <select
                        value={newProdCategory}
                        onChange={e => {
                          if (e.target.value === 'custom') {
                            setIsCustomCategory(true);
                          } else {
                            setNewProdCategory(e.target.value as any);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:outline-none focus:border-[#168BFF]"
                      >
                        <option value="power-supply">পাওয়ার সাপ্লাই (Power Supply / PSU)</option>
                        <option value="mini-fans">মিনি ফ্যান (Mini & Desk Fans)</option>
                        <option value="cooling-fans">কুলিং ও কেসিং ফ্যান (Cooling & Case Fans)</option>
                        <option value="cables-connectors">কেবল ও কানেক্টর (Cables & Docks)</option>
                        <option value="power-charging">পাওয়ার ও চার্জিং (Power & GaN)</option>
                        <option value="headphones-audio">হেডফোন ও অডিও (Audio & Headsets)</option>
                        <option value="computer-accessories">কিবোর্ড ও মাউস (Keyboard & Mice)</option>
                        <option value="pc-components">পিসি কম্পোনেন্টস (PC Components)</option>
                        <option value="storage-devices">স্টোরেজ (Storage & SSD)</option>
                        <option value="networking">নেটওয়ার্কিং (Routers & WiFi)</option>
                        <option value="adapters-converters">অ্যাডাপ্টার ও কনভার্টার (Adapters)</option>
                        <option value="gaming-accessories">গেমিং গিয়ার (Gaming Gear)</option>
                        <option value="smart-desk">স্মার্ট ডেস্ক গ্যাজেট (Desk Accessories)</option>
                        <option value="laptop-accessories">ল্যাপটপ এক্সেসরিজ (Laptop Stands)</option>
                        <option value="electronic-tools">ইলেকট্রনিক টুলস (Tools & Kits)</option>
                        <option value="custom">➕ নতুন ক্যাটাগরি লিখুন (Custom Category)...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={customCategoryInput}
                          onChange={e => setCustomCategoryInput(e.target.value)}
                          placeholder="নতুন ক্যাটাগরির নাম (যেমন: পাওয়ার সাপ্লাই)..."
                          className="flex-1 bg-slate-900 border border-[#00D4FF] text-white p-3 rounded-xl focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => { setIsCustomCategory(false); setCustomCategoryInput(''); }}
                          className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-xl text-xs"
                        >
                          বাতিল
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= WARRANTY & RETURN POLICY SETTINGS ================= */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>ওয়ারেন্টি ও রিপ্লেসমেন্ট পলিসি নির্ধারণ (Warranty & Returns):</span>
                    </span>
                    <span className="text-[11px] text-amber-400">
                      সব পণ্যে একই ওয়ারেন্টি থাকবে না, নির্দিষ্ট করে দিন
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Warranty Selector */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <label className="font-semibold text-slate-200 block">
                        ওয়ারেন্টি সুবিধা (Warranty Duration / Type)
                      </label>
                      <select
                        value={warrantyType}
                        onChange={e => setWarrantyType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg focus:outline-none focus:border-[#168BFF]"
                      >
                        <option value="none">❌ কোনো ওয়ারেন্টি নেই (No Warranty)</option>
                        <option value="7-days">⚡ ৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি (7 Days Replacement)</option>
                        <option value="1-month">১ মাসের ওয়ারেন্টি (1 Month Warranty)</option>
                        <option value="3-months">৩ মাসের ওয়ারেন্টি (3 Months Warranty)</option>
                        <option value="6-months">৬ মাসের অফিসিয়াল ওয়ারেন্টি (6 Months Official)</option>
                        <option value="1-year">১ বছরের অফিসিয়াল ওয়ারেন্টি (1 Year Official)</option>
                        <option value="2-years">২ বছরের অফিসিয়াল ওয়ারেন্টি (2 Years Official)</option>
                        <option value="custom">✍️ নিজের ইচ্ছামতো লিখে দিন (Custom Warranty)...</option>
                      </select>

                      {warrantyType === 'custom' && (
                        <input
                          type="text"
                          required
                          value={customWarrantyInput}
                          onChange={e => setCustomWarrantyInput(e.target.value)}
                          placeholder="যেমন: ১০ দিনের চেক ওয়ারেন্টি, লাইফটাইম, ইত্যাদি..."
                          className="w-full bg-slate-900 border border-[#00D4FF] text-white p-2.5 rounded-lg text-xs mt-2 focus:outline-none"
                        />
                      )}
                    </div>

                    {/* Return / Replacement Selector */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <label className="font-semibold text-slate-200 block">
                        রিপ্লেসমেন্ট / রিটার্ন পলিসি (Replacement Policy)
                      </label>
                      <select
                        value={returnPolicyType}
                        onChange={e => setReturnPolicyType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg focus:outline-none focus:border-[#168BFF]"
                      >
                        <option value="7-days">✓ ৭ দিনের রিপ্লেসমেন্ট (7 Days Replacement for physical defects)</option>
                        <option value="3-days">✓ ৩ দিনের চেক রিপ্লেসমেন্ট (3 Days Check Warranty)</option>
                        <option value="10-days">✓ ১০ দিনের সহজ রিপ্লেসমেন্ট (10 Days Replacement)</option>
                        <option value="none">❌ কোনো রিপ্লেসমেন্ট সুবিধা প্রযোজ্য নয় (Non-returnable)</option>
                        <option value="custom">✍️ কাস্টম রিটার্ন পলিসি লিখে দিন (Custom)...</option>
                      </select>

                      {returnPolicyType === 'custom' && (
                        <input
                          type="text"
                          required
                          value={customReturnInput}
                          onChange={e => setCustomReturnInput(e.target.value)}
                          placeholder="যেমন: শুধুমাত্র আনবক্সিং ভিডিও থাকলে ৩ দিনে রিপ্লেসমেন্ট..."
                          className="w-full bg-slate-900 border border-[#00D4FF] text-white p-2.5 rounded-lg text-xs mt-2 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* ================= GALLERY IMAGE UPLOADS ================= */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800">
                    <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#00D4FF]" />
                      <span>প্রোডাক্টের ছবি আপলোড করুন (Gallery / Device Upload):</span>
                    </span>
                    <span className="text-[11px] text-[#00D4FF]">
                      মেইন ছবি + নিচের থাম্বনেইলের জন্য ২টি ছবি
                    </span>
                  </div>

                  {/* 3 Images Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Main Photo */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">১. প্রধান ছবি * (Main Photo)</span>
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">প্রয়োজনীয়</span>
                      </div>

                      <div className="aspect-square rounded-xl bg-slate-900 border-2 border-dashed border-slate-700 overflow-hidden relative group flex flex-col items-center justify-center p-2">
                        {newProdImage && newProdImage.trim() ? (
                          <>
                            <img
                              src={getSafeImageSrc(newProdImage, DEFAULT_PRODUCT_IMAGE)}
                              alt="Main Preview"
                              className="w-full h-full object-cover rounded-lg"
                              onError={e => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                              <button
                                type="button"
                                onClick={() => mainImageFileRef.current?.click()}
                                className="px-3 py-1.5 rounded-lg bg-[#168BFF] text-white text-xs font-bold shadow"
                              >
                                ছবি পরিবর্তন
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                            <p className="text-slate-400 text-xs">কোনো ছবি সিলেক্ট করা নেই</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => mainImageFileRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#168BFF]/20 hover:bg-[#168BFF]/30 border border-[#168BFF]/50 text-[#00D4FF] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>গ্যালারি থেকে ছবি বাছুন</span>
                      </button>

                      <input
                        type="url"
                        value={newProdImage}
                        onChange={e => setNewProdImage(e.target.value)}
                        placeholder="বা ছবির লিংক পেস্ট করুন..."
                        className="w-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 p-2 rounded-lg font-mono"
                      />
                    </div>

                    {/* 2. Second Photo */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">২. অতিরিক্ত ছবি ২ (Side View)</span>
                        <span className="text-[10px] text-slate-500">ঐচ্ছিক</span>
                      </div>

                      <div className="aspect-square rounded-xl bg-slate-900 border-2 border-dashed border-slate-700 overflow-hidden relative group flex flex-col items-center justify-center p-2">
                        {newProdImage2 && newProdImage2.trim() ? (
                          <>
                            <img
                              src={getSafeImageSrc(newProdImage2, DEFAULT_PRODUCT_IMAGE)}
                              alt="Preview 2"
                              className="w-full h-full object-cover rounded-lg"
                              onError={e => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                              <button
                                type="button"
                                onClick={() => setNewProdImage2('')}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold shadow"
                              >
                                মুছে ফেলুন
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                            <p className="text-slate-400 text-xs">দ্বিতীয় ছবি দিন</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => secondImageFileRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                        <span>গ্যালারি থেকে ২য় ছবি</span>
                      </button>

                      <input
                        type="url"
                        value={newProdImage2}
                        onChange={e => setNewProdImage2(e.target.value)}
                        placeholder="বা ২য় ছবির লিংক..."
                        className="w-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 p-2 rounded-lg font-mono"
                      />
                    </div>

                    {/* 3. Third Photo */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">৩. অতিরিক্ত ছবি ৩ (Back/Box)</span>
                        <span className="text-[10px] text-slate-500">ঐচ্ছিক</span>
                      </div>

                      <div className="aspect-square rounded-xl bg-slate-900 border-2 border-dashed border-slate-700 overflow-hidden relative group flex flex-col items-center justify-center p-2">
                        {newProdImage3 && newProdImage3.trim() ? (
                          <>
                            <img
                              src={getSafeImageSrc(newProdImage3, DEFAULT_PRODUCT_IMAGE)}
                              alt="Preview 3"
                              className="w-full h-full object-cover rounded-lg"
                              onError={e => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                              <button
                                type="button"
                                onClick={() => setNewProdImage3('')}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold shadow"
                              >
                                মুছে ফেলুন
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                            <p className="text-slate-400 text-xs">তৃতীয় ছবি দিন</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => thirdImageFileRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                        <span>গ্যালারি থেকে ৩য় ছবি</span>
                      </button>

                      <input
                        type="url"
                        value={newProdImage3}
                        onChange={e => setNewProdImage3(e.target.value)}
                        placeholder="বা ৩য় ছবির লিংক..."
                        className="w-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 p-2 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Images */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold">অথবা রেডিমেড ছবির প্রি-সেট বাছুন:</span>
                    {imagePresets.map(preset => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setNewProdImage(preset.url)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors border border-slate-700"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">প্রোডাক্টের বিবরণ ও স্পেসিফিকেশন (Description)</label>
                  <textarea
                    rows={2}
                    value={newProdDesc}
                    onChange={e => setNewProdDesc(e.target.value)}
                    placeholder="পণ্যটির বিশেষ ফিচার, সাইজ এবং গুণগত মান সম্পর্কে সংক্ষেপে লিখুন..."
                    className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:outline-none focus:border-[#168BFF]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:from-[#1272d4] hover:to-[#00b4d8] text-white text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  <span>প্রোডাক্ট ক্যাটালগে সেভ করুন (Publish Product)</span>
                </button>
              </form>
            </div>

            {/* PRODUCT CATALOG INVENTORY TABLE */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#08172B] border border-slate-800 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#00D4FF]" />
                    <span>বর্তমান স্টক ও প্রোডাক্ট তালিকা ({filteredProducts.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    এক ক্লিকে দাম, স্টক এবং পণ্যের নির্দিষ্ট ওয়ারেন্টি এডিট করুন।
                  </p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="নাম বা কোড খুঁজুন..."
                      className="bg-slate-900 border border-slate-700 text-white pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-[#168BFF] w-40 sm:w-52"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={e => setProductCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="all">সব ক্যাটাগরি</option>
                    <option value="power-supply">পাওয়ার সাপ্লাই</option>
                    <option value="mini-fans">মিনি ফ্যান</option>
                    <option value="cooling-fans">কুলিং ফ্যান</option>
                    <option value="computer-accessories">কিবোর্ড ও মাউস</option>
                    <option value="headphones-audio">হেডফোন ও অডিও</option>
                    <option value="cables-connectors">কেবল ও ডক</option>
                  </select>
                </div>
              </div>

              {/* Table / List */}
              <div className="divide-y divide-slate-800">
                {filteredProducts.map(product => {
                  const isEditing = editingId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/30 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getSafeImageSrc(product.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                          onError={e => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                            {product.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                            <span className="text-[#00D4FF]">{product.sku}</span>
                            <span>·</span>
                            <span>{product.brand}</span>
                            <span>·</span>
                            <span className="text-slate-300 font-sans">{product.category}</span>
                            <span>·</span>
                            <span className="text-emerald-400 font-sans font-semibold">
                              🛡️ {product.warranty || 'No Warranty'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price, Stock, Warranty and Actions */}
                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        {isEditing ? (
                          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                              <span className="text-xs text-slate-400">৳</span>
                              <input
                                type="number"
                                value={editPrice}
                                onChange={e => setEditPrice(Number(e.target.value))}
                                className="w-16 bg-transparent text-xs text-white font-mono focus:outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                              <span className="text-xs text-slate-400">স্টক:</span>
                              <input
                                type="number"
                                value={editStock}
                                onChange={e => setEditStock(Number(e.target.value))}
                                className="w-12 bg-transparent text-xs text-white font-mono focus:outline-none"
                              />
                            </div>

                            <input
                              type="text"
                              value={editWarranty}
                              onChange={e => setEditWarranty(e.target.value)}
                              placeholder="ওয়ারেন্টি..."
                              className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 text-xs text-white w-28 focus:outline-none"
                            />

                            <input
                              type="text"
                              value={editDesc}
                              onChange={e => setEditDesc(e.target.value)}
                              placeholder="পণ্যের বিবরণ..."
                              className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 text-xs text-white w-36 sm:w-48 focus:outline-none"
                              title="পণ্যের বিবরণ"
                            />

                            <button
                              onClick={() => handleSaveEdit(product.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="সেভ করুন"
                            >
                              <Check className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                              title="বাতিল"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs font-bold text-white font-mono">{formatBDT(product.price)}</p>
                              <p className={`text-[11px] font-mono font-semibold ${product.stock <= 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                স্টক: {product.stock} টি
                              </p>
                            </div>

                            <button
                              onClick={() => handleStartEdit(product)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-[#00D4FF] hover:border-[#00D4FF]"
                              title="দ্রুত এডিট"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {confirmDeleteProductId === product.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/60 p-1.5 rounded-lg shadow-md animate-fadeIn">
                                <span className="text-[10px] text-rose-200 font-bold">মুছবেন?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteProduct(product.id);
                                    setConfirmDeleteProductId(null);
                                    showToast('প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে', 'info');
                                  }}
                                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold shadow"
                                >
                                  হ্যাঁ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteProductId(null)}
                                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px]"
                                >
                                  না
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteProductId(product.id)}
                                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-400 transition-colors"
                                title="মুছে ফেলুন (Delete)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ===================== TAB 3: ORDER MANAGEMENT & INVOICE ================= */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold mr-1">ফিল্টার:</span>

              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  orderFilter === 'all'
                    ? 'bg-slate-800 border-slate-600 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                সব অর্ডার ({orders.length})
              </button>

              <button
                onClick={() => setOrderFilter('Pending')}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                  orderFilter === 'Pending'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-amber-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>পেন্ডিং ({pendingCount})</span>
              </button>

              <button
                onClick={() => setOrderFilter('Accepted')}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                  orderFilter === 'Accepted'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-emerald-300'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>অ্যাকসেপ্টেড ({acceptedCount})</span>
              </button>

              <button
                onClick={() => setOrderFilter('Delivered')}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                  orderFilter === 'Delivered'
                    ? 'bg-[#168BFF]/20 border-[#168BFF] text-[#00D4FF] font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-[#00D4FF]'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>ডেলিভারড ({deliveredCount})</span>
              </button>

              <button
                onClick={() => setOrderFilter('Rejected')}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                  orderFilter === 'Rejected'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-rose-300'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>বাতিলকৃত ({rejectedCount})</span>
              </button>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#08172B]/60 border border-slate-800 text-xs text-slate-400">
                এই ক্যাটাগরিতে কোনো অর্ডার পাওয়া যায়নি।
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => {
                  const isPending = order.orderStatus === 'Pending';
                  const isAccepted = order.orderStatus === 'Accepted' || order.orderStatus === 'Confirmed' || order.orderStatus === 'Shipped';
                  const isRejected = order.orderStatus === 'Rejected' || order.orderStatus === 'Cancelled';
                  const isDelivered = order.orderStatus === 'Delivered';

                  return (
                    <div
                      key={order.id}
                      className="p-5 sm:p-6 rounded-2xl bg-[#08172B] border border-slate-800 space-y-4 shadow-lg hover:border-slate-700 transition-all"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-white text-sm sm:text-base">
                            #{order.id}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400 font-mono">
                            {new Date(order.createdAt).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Status & Invoice */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                              isPending
                                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                                : isAccepted
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                                : isRejected
                                ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                                : 'bg-[#168BFF]/15 border-[#168BFF]/50 text-[#00D4FF]'
                            }`}
                          >
                            {order.orderStatus}
                          </span>

                          <button
                            onClick={() => setInvoiceOrder(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white flex items-center gap-1.5"
                            title="ইনভয়েস প্রিন্ট করুন"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">ইনভয়েস</span>
                          </button>
                        </div>
                      </div>

                      {/* Customer Details & Ordered Items */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        {/* Customer Info */}
                        <div className="md:col-span-5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                          <div className="flex items-center gap-2 text-white font-bold pb-1 border-b border-slate-800">
                            <MapPin className="w-3.5 h-3.5 text-[#00D4FF]" />
                            <span>গ্রাহক ও ডেলিভারি তথ্য:</span>
                          </div>
                          <p className="font-bold text-white text-sm">{order.shipping.fullName}</p>
                          <a
                            href={`tel:${order.shipping.phone}`}
                            className="text-[#00D4FF] hover:underline font-mono font-bold flex items-center gap-1.5 pt-0.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{order.shipping.phone}</span>
                          </a>
                          <p className="text-slate-300 leading-relaxed pt-1">
                            {order.shipping.address}, {order.shipping.district}, {order.shipping.division}
                          </p>
                          {order.shipping.deliveryNotes && (
                            <p className="text-amber-400/90 bg-amber-950/30 p-2 rounded-lg border border-amber-900/40 text-[11px] mt-1.5">
                              নোট: {order.shipping.deliveryNotes}
                            </p>
                          )}
                          <div className="pt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                            <span>পেমেন্ট: </span>
                            <span className="uppercase text-amber-300 font-mono font-bold">
                              {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : order.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="md:col-span-7 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-white font-bold pb-1 border-b border-slate-800">
                            <span>অর্ডারকৃত পণ্যসমূহ:</span>
                            <span className="text-emerald-400 font-mono text-sm">{formatBDT(order.total)}</span>
                          </div>

                          <div className="divide-y divide-slate-800 max-h-40 overflow-y-auto space-y-2 pr-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-2 pt-2 first:pt-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={getSafeImageSrc(item.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                                    alt={item.productName}
                                    className="w-8 h-8 rounded-lg object-cover bg-slate-950 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-white truncate max-w-xs">{item.productName}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">
                                      {item.productSku} {item.variant ? `(${item.variant})` : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 font-mono font-bold">
                                  <span className="text-slate-400 text-[11px]">{item.quantity} × </span>
                                  <span className="text-white">{formatBDT(item.price)}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                            <span>পণ্যমূল্য: {formatBDT(order.subtotal)} + ডেলিভারি: {formatBDT(order.shippingFee)}</span>
                            <span className="font-bold text-white font-mono text-xs">মোট: {formatBDT(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Accepted', 'Steadfast Courier', `ST-${Math.floor(100000 + Math.random() * 900000)}`)}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>অ্যাকসেপ্ট করুন (Accept)</span>
                              </button>

                              <button
                                onClick={() => updateOrderStatus(order.id, 'Rejected')}
                                className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold flex items-center gap-1.5"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>বাতিল করুন</span>
                              </button>
                            </>
                          )}

                          {isAccepted && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Delivered')}
                                className="px-3.5 py-1.5 rounded-lg bg-[#168BFF] hover:bg-[#1272d4] text-white font-bold flex items-center gap-1.5 shadow"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>ডেলিভারি সম্পন্ন (Mark Delivered)</span>
                              </button>

                              <button
                                onClick={() => updateOrderStatus(order.id, 'Pending')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
                              >
                                পুনরায় পেন্ডিং করুন
                              </button>
                            </>
                          )}

                          {isDelivered && (
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4" />
                              <span>ডেলিভারি সফলভাবে সম্পন্ন হয়েছে</span>
                            </span>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Pending')}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-bold"
                            >
                              পুনর্বিবেচনা / পেন্ডিং করুন
                            </button>
                          )}
                        </div>

                        {confirmDeleteOrderId === order.id ? (
                          <div className="flex items-center gap-2 ml-auto bg-rose-950/90 border border-rose-500/60 p-2 rounded-xl shadow-lg animate-fadeIn">
                            <span className="text-xs text-rose-200 font-bold">নিশ্চিত মুছবেন?</span>
                            <button
                              type="button"
                              onClick={() => {
                                deleteOrder(order.id);
                                setConfirmDeleteOrderId(null);
                                showToast(`অর্ডার #${order.id} স্থায়ীভাবে ডিলিট করা হয়েছে`, 'info');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-colors"
                            >
                              হ্যাঁ, ডিলিট করুন
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteOrderId(null)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteOrderId(order.id)}
                            className="text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all"
                            title={`অর্ডার #${order.id} মুছে ফেলুন`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>অর্ডার ডিলিট</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ===================== TAB 4: NOTICE & MULTI-BANNER CAROUSEL ============= */}
        {/* ========================================================================= */}
        {activeTab === 'notice-banner' && (
          <div className="space-y-6">
            <input
              type="file"
              ref={bannerImageFileRef}
              accept="image/*"
              className="hidden"
              onChange={handleBannerFileUpload}
            />

            <form onSubmit={handleSaveNoticeBanner} className="space-y-6">
              {/* ================= 1. NOTICE BAR CONTROL ================= */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#08172B] border border-rose-500/40 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
                      ১
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {language === 'bn' ? 'টপ নোটিশ বার কন্ট্রোল (Top Notification Bar)' : 'Top Notification Bar'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        ওয়েবসাইটের একদম ওপরে স্ক্রোলিং বা ফিক্সড নোটিশ টেক্সট নিয়ন্ত্রণ করুন
                      </p>
                    </div>
                  </div>

                  {/* Toggle Notice Switch */}
                  <div className="flex items-center gap-2.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <span className="text-xs font-semibold text-slate-300">
                      নোটিশ বার চালু রাখবেন?
                    </span>
                    <button
                      type="button"
                      onClick={() => setNoticeEnabled(!noticeEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        noticeEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          noticeEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span>ওয়েবসাইটে নোটিশটি যেভাবে দেখাবে (Live Preview):</span>
                  </span>

                  {noticeEnabled ? (
                    <div
                      className={`p-2.5 rounded-xl text-white font-medium shadow-md transition-colors overflow-hidden ${
                        noticeBgColor === 'amber'
                          ? 'bg-amber-600 border border-amber-500'
                          : noticeBgColor === 'blue'
                          ? 'bg-[#168BFF] border border-blue-400'
                          : noticeBgColor === 'emerald'
                          ? 'bg-emerald-600 border border-emerald-500'
                          : noticeBgColor === 'purple'
                          ? 'bg-purple-700 border border-purple-600'
                          : noticeBgColor === 'custom'
                          ? 'border border-black/20'
                          : 'bg-rose-600 border border-rose-500'
                      }`}
                      style={noticeBgColor === 'custom' ? { backgroundColor: noticeCustomBg } : undefined}
                    >
                      <div className="flex items-center justify-center gap-2 text-center">
                        <span className="px-2 py-0.5 rounded bg-black/30 font-black text-[10px] tracking-wider uppercase shrink-0">
                          {noticeBadgeText || 'NOTICE'}
                        </span>
                        {noticeScrollable ? (
                          <div className="overflow-hidden whitespace-nowrap w-full">
                            <span className="text-xs font-semibold inline-block animate-[marquee_20s_linear_infinite]">
                              {noticeText} ✦ {noticeText}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold leading-relaxed">
                            {noticeText || 'কোনো নোটিশ টেক্সট দেওয়া হয়নি'}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 text-center text-xs text-slate-500">
                      ⚠️ নোটিশ বার বন্ধ রাখা হয়েছে।
                    </div>
                  )}
                </div>

                {/* Notice Settings Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      নোটিশ ব্যাজ (Badge Text)
                    </label>
                    <input
                      type="text"
                      value={noticeBadgeText}
                      onChange={e => setNoticeBadgeText(e.target.value)}
                      placeholder="e.g. NOTICE, জরুরী নোটিশ, অফার"
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-xl font-bold focus:outline-none focus:border-[#168BFF]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">
                      নোটিশ ব্যাকগ্রাউন্ড রঙ (Notice Bar Color)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      <button
                        type="button"
                        onClick={() => setNoticeBgColor('red')}
                        className={`p-2 rounded-xl text-[11px] font-bold transition-all border ${
                          noticeBgColor === 'red'
                            ? 'bg-rose-600 text-white border-white ring-2 ring-rose-500/40'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        🔴 লাল
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoticeBgColor('amber')}
                        className={`p-2 rounded-xl text-[11px] font-bold transition-all border ${
                          noticeBgColor === 'amber'
                            ? 'bg-amber-600 text-white border-white ring-2 ring-amber-500/40'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        🟡 অ্যাম্বার
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoticeBgColor('blue')}
                        className={`p-2 rounded-xl text-[11px] font-bold transition-all border ${
                          noticeBgColor === 'blue'
                            ? 'bg-[#168BFF] text-white border-white ring-2 ring-blue-500/40'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        🔵 নীল
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoticeBgColor('emerald')}
                        className={`p-2 rounded-xl text-[11px] font-bold transition-all border ${
                          noticeBgColor === 'emerald'
                            ? 'bg-emerald-600 text-white border-white ring-2 ring-emerald-500/40'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        🟢 সবুজ
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoticeBgColor('purple')}
                        className={`p-2 rounded-xl text-[11px] font-bold transition-all border ${
                          noticeBgColor === 'purple'
                            ? 'bg-purple-700 text-white border-white ring-2 ring-purple-500/40'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        🟣 পার্পল
                      </button>
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2">
                        <input
                          type="color"
                          value={noticeCustomBg}
                          onChange={e => {
                            setNoticeCustomBg(e.target.value);
                            setNoticeBgColor('custom');
                          }}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                          title="কাস্টম রঙ পছন্দ করুন"
                        />
                        <span className="text-[10px] text-slate-400">কাস্টম</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marquee scroll toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="scrollableNotice"
                    checked={noticeScrollable}
                    onChange={e => setNoticeScrollable(e.target.checked)}
                    className="w-4 h-4 rounded text-[#168BFF] bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <label htmlFor="scrollableNotice" className="text-xs font-semibold text-slate-200 cursor-pointer">
                    স্মুথ স্ক্রোলিং নোটিফিকেশন চালু রাখুন (Running Marquee Text)
                  </label>
                </div>

                {/* Main Notice Message Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    নোটিশের মূল বার্তা * (Notice Text)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={noticeText}
                    onChange={e => setNoticeText(e.target.value)}
                    placeholder="নোটিশের লেখা লিখুন..."
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-[#168BFF] leading-relaxed"
                  />

                  {/* Ready Suggestions */}
                  <div className="flex flex-wrap gap-2 pt-1 items-center">
                    <span className="text-[11px] text-slate-400">দ্রুত রেডিমেড টেক্সট:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNoticeBadgeText('NOTICE');
                        setNoticeBgColor('red');
                        setNoticeText('বিকাশ ছাড়া নগদ ও রকেটে লেনদেন করার আগে অবশ্যই আমাদের হটলাইন ০১৭২৩-৩৭৩১-৩৩ নাম্বারে কল দিয়ে নিশ্চিত হয়ে নিন। প্রতারক চক্র থেকে সতর্ক থাকুন। প্রতারিত হলে কর্তৃপক্ষ দায়ী থাকবে না।');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300"
                    >
                      🛡️ বিকাশ ও লেনদেন সতর্কতা
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNoticeBadgeText('OFFER');
                        setNoticeBgColor('emerald');
                        setNoticeText('🎉 ধামাকা অফার: ২,০০০ টাকার বেশি যেকোনো অর্ডারে সারা বাংলাদেশে সম্পূর্ণ ফ্রি হোম ডেলিভারি! কোড: TECHBOOST');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300"
                    >
                      🎁 ফ্রি ডেলিভারি অফার
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNoticeBadgeText('NOTICE');
                        setNoticeBgColor('amber');
                        setNoticeText('⚡ AS Computer পুঠিয়া, রাজশাহী শোরুমে সরাসরি এসে পণ্য পরখ করে কেনার জন্য আমন্ত্রণ রইল। হটলাইন: ০১৭২৩-৩৭৩১-৩৩');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300"
                    >
                      🏪 ফিজিক্যাল শপ নোটিশ
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= 2. HERO BANNER MULTI-SLIDE CAROUSEL MANAGER ================= */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#08172B] border border-cyan-500/40 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-[#00D4FF] border border-cyan-500/30 flex items-center justify-center font-bold">
                      ২
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {language === 'bn' ? 'হোমপেজ ব্যানার স্লাইডার কন্ট্রোল (Hero Banner Carousel)' : 'Hero Banner Carousel Manager'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        চাইলে ১টি ব্যানার অথবা ২-৩টি ব্যানার স্লাইড রাখুন—হোমপেজে একা একাই একটার পর একটা স্ক্রোল করবে
                      </p>
                    </div>
                  </div>

                  {/* Add New Slide Button */}
                  <button
                    type="button"
                    onClick={handleAddNewSlide}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন ব্যানার স্লাইড যোগ করুন</span>
                  </button>
                </div>

                {/* Banner Slide Switcher Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold shrink-0 mr-1">
                    ব্যানার নির্বাচন:
                  </span>
                  {bannerSlides.map((slide, idx) => (
                    <button
                      key={slide.id || idx}
                      type="button"
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                        activeSlideIndex === idx
                          ? 'bg-[#168BFF] text-white shadow-md shadow-[#168BFF]/30'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>স্লাইড {idx + 1}</span>
                      {bannerSlides.length > 1 && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(idx);
                          }}
                          className="hover:text-rose-400 p-0.5"
                          title="এই স্লাইড মুছে ফেলুন"
                        >
                          ✕
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Active Slide Live Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#00D4FF]" />
                      <span>স্লাইড {activeSlideIndex + 1}-এর লাইভ প্রিভিউ:</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (হোমপেজে ২ বা ততোধিক স্লাইড থাকলে প্রতি ৫ সেকেন্ডে অটো-স্ক্রোল করবে)
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-gradient-to-r from-[#050914] via-[#08172B] to-[#0c1c36] p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
                    <div className="flex-1 space-y-2 text-left">
                      <span className="text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider bg-[#168BFF]/20 px-2.5 py-1 rounded-md border border-[#00D4FF]/30">
                        স্লাইড {activeSlideIndex + 1}
                      </span>
                      <h4 className="text-base sm:text-xl font-black text-white leading-tight">
                        {currentActiveSlide.title || 'AS Computer — কম্পিউটার এক্সেসরিজ ও গ্যাজেট শপ'}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {currentActiveSlide.subtitle || 'কিবোর্ড, মাউস, মিনি ফ্যান, কেবল, কনভার্টার, অডিও ও কুলিং ফ্যান সহ সকল কম্পিউটার সামগ্রী সহজে ও দ্রুত অর্ডার করুন।'}
                      </p>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#168BFF] to-[#00D4FF] text-white text-[11px] font-bold shadow-md">
                          {currentActiveSlide.buttonText || 'সকল প্রোডাক্ট দেখুন'} →
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-56 h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                      <img
                        src={getSafeImageSrc(currentActiveSlide?.image, DEFAULT_BANNER_IMAGE)}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = DEFAULT_BANNER_IMAGE;
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Gallery Upload Button & URL for Active Slide */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#00D4FF]" />
                      <span>স্লাইড {activeSlideIndex + 1}-এর জন্য গ্যালারি থেকে ছবি আপলোড করুন:</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => bannerImageFileRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:from-[#1272d4] hover:to-[#00b4d8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>📁 ফোন / পিসি থেকে ছবি বাছুন</span>
                    </button>
                  </div>

                  {/* Fallback Direct URL */}
                  <div className="flex gap-2 items-center pt-1">
                    <input
                      type="url"
                      value={currentActiveSlide.image}
                      onChange={e => handleUpdateSlide(activeSlideIndex, { image: e.target.value })}
                      placeholder="বা সরাসরি ব্যানার ছবির লিংক পেস্ট করুন (Image URL)..."
                      className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-xl font-mono focus:outline-none focus:border-[#168BFF]"
                    />
                  </div>
                </div>

                {/* Quick Banner Presets */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-300">
                    অথবা স্লাইড {activeSlideIndex + 1}-এর জন্য রেডিমেড ব্যানার বাছুন:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {bannerPresets.map(preset => (
                      <button
                        type="button"
                        key={preset.url}
                        onClick={() => handleUpdateSlide(activeSlideIndex, { image: preset.url })}
                        className={`p-2 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                          currentActiveSlide.image === preset.url
                            ? 'bg-[#168BFF]/20 border-[#00D4FF] ring-2 ring-[#00D4FF]/30'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={getSafeImageSrc(preset.url, DEFAULT_BANNER_IMAGE)}
                          alt={preset.label}
                          className="w-full h-16 object-cover rounded-lg bg-slate-950"
                        />
                        <span className="text-[10px] font-semibold text-slate-300 truncate">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Slide Texts & Link Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">ব্যানার শিরোনাম (Title)</label>
                    <input
                      type="text"
                      value={currentActiveSlide.title}
                      onChange={e => handleUpdateSlide(activeSlideIndex, { title: e.target.value, titleBn: e.target.value })}
                      placeholder="AS Computer — কম্পিউটার এক্সেসরিজ ও গ্যাজেট শপ"
                      className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-[#168BFF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">বাটনের লেখা (Button Text)</label>
                    <input
                      type="text"
                      value={currentActiveSlide.buttonText}
                      onChange={e => handleUpdateSlide(activeSlideIndex, { buttonText: e.target.value, buttonTextBn: e.target.value })}
                      placeholder="সকল প্রোডাক্ট দেখুন"
                      className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-[#168BFF]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-300">ব্যানার সাব-টাইটেল / বিবরণ (Subtitle)</label>
                    <input
                      type="text"
                      value={currentActiveSlide.subtitle}
                      onChange={e => handleUpdateSlide(activeSlideIndex, { subtitle: e.target.value, subtitleBn: e.target.value })}
                      placeholder="কিবোর্ড, মাউস, মিনি ফ্যান, কেবল, কনভার্টার..."
                      className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-[#168BFF]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-300">ব্যানারে ক্লিক করলে কোন পেইজে যাবে?</label>
                    <select
                      value={currentActiveSlide.link}
                      onChange={e => handleUpdateSlide(activeSlideIndex, { link: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-[#168BFF]"
                    >
                      <option value="shop">সকল পণ্য ক্যাটালগ (All Products Shop)</option>
                      <option value="mini-fans">মিনি ফ্যান (Mini Fans)</option>
                      <option value="cooling-fans">কুলিং ও কেসিং ফ্যান (Cooling & Fans)</option>
                      <option value="power-supply">পাওয়ার সাপ্লাই (Power Supply / PSU)</option>
                      <option value="computer-accessories">কিবোর্ড ও মাউস (Keyboard & Mice)</option>
                      <option value="headphones-audio">হেডফোন ও অডিও (Audio Gear)</option>
                      <option value="cables-connectors">কেবল ও কানেক্টর (Cables & Hubs)</option>
                    </select>
                  </div>
                </div>

                {/* Delete Slide Button if more than 1 */}
                {bannerSlides.length > 1 && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(activeSlideIndex)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>এই স্লাইড মুছে ফেলুন (Delete Slide {activeSlideIndex + 1})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Save Button for Notice & Banner */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-[#168BFF] hover:from-rose-500 hover:to-[#00D4FF] text-white text-xs sm:text-sm font-bold shadow-xl shadow-rose-600/20 flex items-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Check className="w-4 h-4" />
                  <span>নোটিশ ও ব্যানার পরিবর্তন সেভ করুন (Save Changes)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-[#00D4FF]" />
                  <span>হোমপেজে গিয়ে দেখুন (View Live)</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ===================== TAB 5: WEBSITE COLOR & THEME CUSTOMIZER ============ */}
        {/* ========================================================================= */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-[#08172B] border border-pink-500/40 space-y-6 shadow-xl">
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center font-bold">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {language === 'bn' ? 'ওয়েবসাইট কালার ও থিম কাস্টমাইজেশন' : 'Website Theme & Colors Customizer'}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      "ওয়েবসাইটটা আমি যেমন ইচ্ছা তেমন রং করতে পারব" — এক ক্লিকে সম্পূর্ণ ওয়েবসাইটের রঙ বদলে ফেলুন।
                    </p>
                  </div>
                </div>
              </div>

              {/* LIVE DEMO CARD IN CHOSEN COLORS */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#00D4FF]" />
                  <span>নির্বাচিত রঙের লাইভ প্রিভিউ (যেভাবে বোতাম, কার্ড ও ব্যাজ দেখাবে):</span>
                </span>

                <div className="p-4 rounded-xl bg-[#08172B] border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                      style={{ backgroundColor: themePrimary }}
                    >
                      AS
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">AS Computer Store</h4>
                      <p className="text-xs" style={{ color: themeAccent }}>
                        স্মার্ট গ্যাজেট ও কম্পিউটার এক্সেসরিজ
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: themePrimary }}
                    >
                      প্রাইমারি বাটন
                    </span>

                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold border"
                      style={{ borderColor: themeAccent, color: themeAccent }}
                    >
                      আউটলাইন ব্যাজ
                    </span>

                    <span
                      className="px-3 py-1 rounded-full text-xs font-black text-white"
                      style={{ background: `linear-gradient(to right, ${themePrimary}, ${themeAccent})` }}
                    >
                      গ্রেডিয়েন্ট অ্যাকসেন্ট
                    </span>
                  </div>
                </div>
              </div>

              {/* ONE-TOUCH THEME PRESETS */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">
                  এক ক্লিকে আকর্ষণীয় থিম নির্বাচন করুন (Ready Themes):
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {THEME_PALETTES.map(palette => {
                    const isSelected = themePrimary.toLowerCase() === palette.primary.toLowerCase();

                    return (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => handleApplyPalette(palette)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-2 relative ${
                          isSelected
                            ? 'bg-slate-800/90 border-white ring-2 ring-white/30 shadow-lg'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{palette.name}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                              অ্যাক্টিভ
                            </span>
                          )}
                        </div>

                        {/* Dual Color Bar */}
                        <div className="h-4 rounded-lg overflow-hidden flex shadow-inner">
                          <div className="w-1/2 h-full" style={{ backgroundColor: palette.primary }} />
                          <div className="w-1/2 h-full" style={{ backgroundColor: palette.accent }} />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{palette.primary}</span>
                          <span>{palette.accent}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM COLOR PICKER */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  <span>নিজের ইচ্ছামতো যেকোনো কাস্টম রঙ বাছাই করুন (Custom Color Pickers):</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Color Picker */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-white block">
                      প্রধান রঙ (Primary Theme Color)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      মেনু বার, প্রধান বোতাম, হেডারের আইকন ও একটিভ ট্যাবের রঙ
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="color"
                        value={themePrimary}
                        onChange={e => setThemePrimary(e.target.value)}
                        className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={themePrimary}
                        onChange={e => setThemePrimary(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono uppercase text-xs p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Accent Color Picker */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-white block">
                      সেকেন্ডারি / অ্যাকসেন্ট রঙ (Accent Glow Color)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      হাইলাইট টেক্সট, অফার ব্যাজ এবং গ্রেডিয়েন্ট এন্ডিং রঙ
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="color"
                        value={themeAccent}
                        onChange={e => setThemeAccent(e.target.value)}
                        className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={themeAccent}
                        onChange={e => setThemeAccent(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono uppercase text-xs p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveTheme}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:from-[#1272d4] hover:to-[#00b4d8] text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <Check className="w-4 h-4" />
                    <span>নির্বাচিত রঙ সংরক্ষণ করুন (Apply & Save Colors)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setThemePrimary('#168BFF');
                      setThemeAccent('#00D4FF');
                      updateSettings({ themePrimary: '#168BFF', themeAccent: '#00D4FF', themePreset: 'cyber-blue' });
                      showToast('ডিফল্ট ইলেকট্রিক সায়ান রঙে রিসেট হয়েছে', 'info');
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ডিফল্ট কালারে ফেরত যান</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ===================== TAB 6: STORE & DELIVERY SETTINGS ================== */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#08172B] border border-slate-800 space-y-5 max-w-2xl shadow-xl">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">দোকান ও ব্যবসা সংক্রান্ত তথ্য (Store Information)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                হটলাইন, ঠিকানা এবং কুরিয়ার ডেলিভারি চার্জ পরিবর্তন করুন
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {/* Website Logo Preview & URL */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-900 border border-slate-700">
                <label className="font-semibold text-slate-200 block">ওয়েবসাইটের লোগো (Website Logo)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border-2 border-[#168BFF]/40 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                    <img
                      src={storeLogoUrl}
                      alt="Website Logo Preview"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://i.imgur.com/OfCvr1N.jpeg';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      value={storeLogoUrl}
                      onChange={e => setStoreLogoUrl(e.target.value)}
                      placeholder="https://i.imgur.com/OfCvr1N.jpeg"
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded-xl font-mono text-xs focus:outline-none focus:border-[#168BFF]"
                    />
                    <p className="text-[10px] text-slate-400">
                      লোগোটি ওয়েবসাইটের হেডার, ফুটার, লাইভ চ্যাট ও ইনভয়েসে স্বয়ংক্রিয়ভাবে প্রদর্শিত হয়।
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">প্রোপাইটার নাম (Owner Name)</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="Md. Amir Hamza"
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:outline-none focus:border-[#168BFF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">দোকানের পূর্ণ ঠিকানা (Store Physical Address)</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={e => setStoreAddress(e.target.value)}
                  placeholder="School Market, Baneshwer Bazzar, Sarda Road, Puthia, Rajshahi-6260."
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:outline-none focus:border-[#168BFF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">সাপোর্ট হটলাইন / ফোন</label>
                  <input
                    type="text"
                    value={hotline}
                    onChange={e => setHotline(e.target.value)}
                    placeholder="01723-373133"
                    className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl font-mono focus:outline-none focus:border-[#168BFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">অফিসিয়াল ইমেইল</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    placeholder="amircmt373133@gmail.com"
                    className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl font-mono focus:outline-none focus:border-[#168BFF]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-4">
                <h4 className="font-bold text-slate-200">কুরিয়ার ডেলিভারি চার্জ সেটিংস</h4>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">ফ্রি ডেলিভারি থ্রেশহোল্ড (টাকা)</label>
                  <input
                    type="number"
                    value={freeThreshold}
                    onChange={e => setFreeThreshold(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-slate-400">এই পরিমাণ বা তার বেশি অর্ডারে স্বয়ংক্রিয়ভাবে ফ্রি ডেলিভারি হবে</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-200">ঢাকার ভিতরে চার্জ (৳)</label>
                    <input
                      type="number"
                      value={insideDhakaFee}
                      onChange={e => setInsideDhakaFee(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-200">ঢাকার বাইরে / রাজশাহী চার্জ (৳)</label>
                    <input
                      type="number"
                      value={outsideDhakaFee}
                      onChange={e => setOutsideDhakaFee(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#168BFF] hover:bg-[#1272d4] text-white font-bold transition-colors shadow-md"
              >
                সেটিংস সেভ করুন (Save Settings)
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ===================== TAB 7: LIVE CHAT INBOX ============================ */}
        {/* ========================================================================= */}
        {activeTab === 'chat' && <AdminChatInbox />}

      </div>
    </div>
  );
};
