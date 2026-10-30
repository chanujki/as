import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  CartItem,
  Order,
  ActiveView,
  StoreSettings,
  Coupon,
  PaymentMethod,
  ShippingDetails,
  ProductCategory,
  ChatMessage,
  AuthUser
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from '../data/mockProducts';
import { TRANSLATIONS } from '../data/translations';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  setDoc
} from 'firebase/firestore';
import {
  saveChatMessageToFirestore,
  saveOrderToFirestore,
  updateOrderInFirestore,
  deleteOrderFromFirestore,
  saveProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  saveSettingsToFirestore,
  handleFirestoreError,
  OperationType
} from '../firebase/firestoreService';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface AppContextType {
  // Navigation & View
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  openProductDetail: (product: Product) => void;

  // Language
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
  formatBDT: (amount: number) => string;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Compare
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isComparing: (productId: string) => boolean;

  // Coupon
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Orders & Checkout
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  createOrder: (shipping: ShippingDetails, paymentMethod: PaymentMethod) => Order | null;
  createDirectOrder: (product: Product, quantity: number, shipping: ShippingDetails, paymentMethod: PaymentMethod) => Order | null;
  updateOrderStatus: (orderId: string, status: Order['orderStatus'], courier?: string, trackingNo?: string) => void;
  deleteOrder: (orderId: string) => void;

  // Quick Order Modal
  quickOrderProduct: Product | null;
  setQuickOrderProduct: (product: Product | null) => void;

  // Store Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Invoice modal
  invoiceOrder: Order | null;
  setInvoiceOrder: (order: Order | null) => void;

  // Live Chat & Firebase Firestore
  chatMessages: ChatMessage[];
  sendChatMessage: (
    text: string,
    senderName?: string,
    senderPhone?: string,
    isAdmin?: boolean,
    targetSessionId?: string,
    senderEmail?: string,
    userId?: string
  ) => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  chatSessionId: string;
  isFirestoreConnected: boolean;

  // User Authentication
  currentUser: AuthUser | null;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithPhoneOrDemo: (role: 'customer' | 'admin', name?: string, phone?: string, email?: string) => void;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<AuthUser>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SETTINGS: StoreSettings = {
  ownerName: 'Md. Amir Hamza',
  freeShippingThreshold: 2000,
  shippingFeeInsideDhaka: 60,
  shippingFeeOutsideDhaka: 120,
  supportPhone: '01723-373133',
  supportEmail: 'amircmt373133@gmail.com',
  supportWhatsApp: '+8801723373133',
  announcementText: '⚡ AS Computer | প্রোপাইটার: মোঃ আমির হামজা | হটলাইন: 01723-373133 | বানেশ্বর বাজার, পুঠিয়া, রাজশাহী',
  announcementTextBn: '⚡ AS Computer | প্রোপাইটার: মোঃ আমির হামজা | হটলাইন: ০১৭২৩-৩৭৩১৩৩ | বানেশ্বর বাজার, পুঠিয়া, রাজশাহী',
  storeAddress: 'School Market, Baneshwer Bazzar, Sarda Road, Puthia, Rajshahi-6260.',

  // Notice Bar defaults
  noticeEnabled: true,
  noticeBadgeText: 'NOTICE',
  noticeText: 'বিকাশ ছাড়া নগদ ও রকেটে লেনদেন করার আগে অবশ্যই আমাদের হটলাইন ০১৭২৩-৩৭৩১-৩৩ নাম্বারে কল দিয়ে নিশ্চিত হয়ে নিন। প্রতারক চক্র থেকে সতর্ক থাকুন। প্রতারিত হলে কর্তৃপক্ষ দায়ী থাকবে না।',
  noticeBgColor: 'red',
  noticeScrollable: true,

  // Hero Banners defaults (Supports 1 single banner or multi-slide scrolling carousel)
  banners: [
    {
      id: 'banner-1',
      image: '/images/hero_setup_showcase_1793020165334.jpg',
      title: 'AS Computer — কম্পিউটার এক্সেসরিজ ও গ্যাজেট শপ',
      titleBn: 'AS Computer — কম্পিউটার এক্সেসরিজ ও গ্যাজেট শপ',
      subtitle: 'কিবোর্ড, মাউস, মিনি ফ্যান, কেবল, কনভার্টার, অডিও ও কুলিং ফ্যান সহ সকল কম্পিউটার সামগ্রী সহজে ও দ্রুত অর্ডার করুন।',
      subtitleBn: 'কিবোর্ড, মাউস, মিনি ফ্যান, কেবল, কনভার্টার, অডিও ও কুলিং ফ্যান সহ সকল কম্পিউটার সামগ্রী সহজে ও দ্রুত অর্ডার করুন।',
      buttonText: 'সকল প্রোডাক্ট দেখুন',
      buttonTextBn: 'সকল প্রোডাক্ট দেখুন',
      link: 'all',
    },
    {
      id: 'banner-2',
      image: '/images/category_mechanical_keyboard_1793020164307.jpg',
      title: 'গেমিং ও প্রফেশনাল মেকানিক্যাল কিবোর্ড স্পেশাল',
      titleBn: 'গেমিং ও প্রফেশনাল মেকানিক্যাল কিবোর্ড স্পেশাল',
      subtitle: 'হট-সোয়াপ গ্যাটেরন ও চেরি সুইচ কিবোর্ড এখন সেরা দামে পাচ্ছেন AS Computer-এ।',
      subtitleBn: 'হট-সোয়াপ গ্যাটেরন ও চেরি সুইচ কিবোর্ড এখন সেরা দামে পাচ্ছেন AS Computer-এ।',
      buttonText: 'কিবোর্ড কালেকশন দেখুন',
      buttonTextBn: 'কিবোর্ড কালেকশন দেখুন',
      link: 'computer-accessories',
    },
    {
      id: 'banner-3',
      image: '/images/category_headphones_audio_1793020166252.jpg',
      title: 'হাই-ফাই স্টুডিও হেডফোন ও প্রিমিয়াম অডিও গিয়ার',
      titleBn: 'হাই-ফাই স্টুডিও হেডফোন ও প্রিমিয়াম অডিও গিয়ার',
      subtitle: 'ক্রিস্টাল ক্লিয়ার সাউন্ড ও ডিপ বাসের ওয়্যারলেস ও গেমিং হেডসেট।',
      subtitleBn: 'ক্রিস্টাল ক্লিয়ার সাউন্ড ও ডিপ বাসের ওয়্যারলেস ও গেমিং হেডসেট।',
      buttonText: 'অডিও গিয়ার কালেকশন',
      buttonTextBn: 'অডিও গিয়ার কালেকশন',
      link: 'headphones-audio',
    }
  ],
  bannerImage: '/images/hero_setup_showcase_1793020165334.jpg',
  bannerTitle: 'AS Computer — কম্পিউটার এক্সেসরিজ ও গ্যাজেট শপ',
  bannerTitleBn: 'AS Computer — কম্পিউটার এক্সেসরিজ ও গ্যাজেট শপ',
  bannerSubtitle: 'কিবোর্ড, মাউস, মিনি ফ্যান, কেবল, কনভার্টার, অডিও ও কুলিং ফ্যান সহ সকল কম্পিউটার সামগ্রী সহজে ও দ্রুত অর্ডার করুন।',
  bannerSubtitleBn: 'কিবোর্ড, মাউস, মিনি ফ্যান, কেবল, কনভার্টার, অডিও ও কুলিং ফ্যান সহ সকল কম্পিউটার সামগ্রী সহজে ও দ্রুত অর্ডার করুন।',
  bannerButtonText: 'সকল প্রোডাক্ট দেখুন',
  bannerButtonTextBn: 'সকল প্রোডাক্ট দেখুন',
  bannerLink: 'all',

  // Store Logo
  logoUrl: 'https://i.imgur.com/OfCvr1N.jpeg',

  // Website Theme & Color defaults ("যেমন ইচ্ছা তেমন রং করতে পারব")
  themePrimary: '#168BFF',
  themeAccent: '#00D4FF',
  themePreset: 'cyber-blue',
};

const INITIAL_ORDERS: Order[] = [];

export const ADMIN_EMAIL = 'mdrakibhasanrion404@gmail.com';

export const isUserAdmin = (user: AuthUser | null | undefined): boolean => {
  if (!user || !user.email) return false;
  return user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role === 'admin';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('as_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map(p => ({
          ...p,
          thumbnail: p.thumbnail ? p.thumbnail.replace(/\/src\/assets\/images\//g, '/images/') : '/images/category_mechanical_keyboard_1793020164307.jpg',
          images: Array.isArray(p.images)
            ? p.images.map(img => (typeof img === 'string' ? img.replace(/\/src\/assets\/images\//g, '/images/') : '/images/category_mechanical_keyboard_1793020164307.jpg'))
            : ['/images/category_mechanical_keyboard_1793020164307.jpg']
        }));
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('as_cart');
    if (saved) {
      try {
        const parsed: CartItem[] = JSON.parse(saved);
        return parsed.map(item => ({
          ...item,
          product: {
            ...item.product,
            thumbnail: item.product.thumbnail ? item.product.thumbnail.replace(/\/src\/assets\/images\//g, '/images/') : '/images/category_mechanical_keyboard_1793020164307.jpg'
          }
        }));
      } catch {
        return [];
      }
    }
    return [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedVariant: 'Linear Yellow (Smooth)'
      }
    ];
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('as_wishlist');
    return saved ? JSON.parse(saved) : ['prod-02', 'prod-03'];
  });

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [coupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('as_orders');
    if (saved) {
      try {
        const parsed: Order[] = JSON.parse(saved);
        // Purge mock demo orders and keep only real orders placed by authenticated customers
        const realOrders = Array.isArray(parsed)
          ? parsed.filter(o => 
              o &&
              !o.id.startsWith('ASC-89421') &&
              !o.id.startsWith('ASC-78214') &&
              !o.id.startsWith('ASC-78190') &&
              !o.id.startsWith('ASC-77901') &&
              !o.shipping?.fullName?.toLowerCase().includes('customer order') &&
              !o.shipping?.email?.includes('@ascomputer.com')
            )
          : [];
        localStorage.setItem('as_orders', JSON.stringify(realOrders));
        return realOrders;
      } catch {
        return [];
      }
    }
    return [];
  });
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('as_settings');
    if (saved) {
      try {
        const parsed: StoreSettings = JSON.parse(saved);
        if (parsed.supportEmail !== 'amircmt373133@gmail.com' || parsed.supportPhone !== '01723-373133') {
          localStorage.setItem('as_settings', JSON.stringify(INITIAL_SETTINGS));
          return INITIAL_SETTINGS;
        }
        const merged = { ...INITIAL_SETTINGS, ...parsed };
        if (merged.bannerImage) {
          merged.bannerImage = merged.bannerImage.replace(/\/src\/assets\/images\//g, '/images/');
        }
        if (!merged.banners || merged.banners.length === 0) {
          merged.banners = INITIAL_SETTINGS.banners;
        } else {
          merged.banners = merged.banners.map(b => ({
            ...b,
            image: b.image ? b.image.replace(/\/src\/assets\/images\//g, '/images/') : '/images/hero_setup_showcase_1793020165334.jpg'
          }));
        }
        if (!merged.logoUrl) {
          merged.logoUrl = INITIAL_SETTINGS.logoUrl;
        }
        return merged;
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Live Chat state & persistent session ID
  const [chatSessionId] = useState<string>(() => {
    let sid = localStorage.getItem('as_chat_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('as_chat_session_id', sid);
    }
    return sid;
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('as_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(isFirebaseConfigured);

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('as_auth_user');
    if (saved) {
      try {
        const parsed: AuthUser = JSON.parse(saved);
        // Strictly sanitize: Only mdrakibhasanrion404@gmail.com can ever have role === 'admin'
        if (parsed.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          parsed.role = 'admin';
        } else {
          parsed.role = 'customer';
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Persist logged in user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('as_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('as_auth_user');
    }
  }, [currentUser]);

  // Firebase Auth state listener
  useEffect(() => {
    if (!auth) return;
    try {
      const unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const userEmail = (fbUser.email || '').trim().toLowerCase();
          const isTargetAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
          setCurrentUser((prev) => {
            const updated: AuthUser = {
              id: fbUser.uid,
              name: fbUser.displayName || prev?.name || (isTargetAdmin ? 'Rakib Hasan (Admin)' : fbUser.email?.split('@')[0] || 'User'),
              email: fbUser.email || prev?.email || '',
              phone: prev?.phone,
              role: isTargetAdmin ? 'admin' : 'customer',
              avatar: fbUser.photoURL || prev?.avatar,
              division: prev?.division,
              district: prev?.district,
              address: prev?.address,
              joinedDate: prev?.joinedDate || new Date().toISOString()
            };
            return updated;
          });
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Auth state change listener error', e);
    }
  }, []);

  // Sync chat messages to local storage as safety fallback
  useEffect(() => {
    localStorage.setItem('as_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Real-time Firestore Sync
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    // 1. Orders live sync
    let unsubOrders: () => void = () => {};
    try {
      unsubOrders = onSnapshot(
        collection(db, 'orders'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Order[] = [];
            snapshot.forEach((d) => list.push(d.data() as Order));
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
      );
    } catch (e) {
      console.warn('Orders live sync init error', e);
    }

    // 2. Products live sync
    let unsubProducts: () => void = () => {};
    try {
      unsubProducts = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((d) => list.push(d.data() as Product));
            setProducts(list);
          } else {
            // Seed initial products to Firestore
            INITIAL_PRODUCTS.forEach((p) => {
              setDoc(doc(db, 'products', p.id), p).catch(() => {});
            });
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'products')
      );
    } catch (e) {
      console.warn('Products live sync init error', e);
    }

    // 3. Settings live sync
    let unsubSettings: () => void = () => {};
    try {
      unsubSettings = onSnapshot(
        doc(db, 'settings', 'store'),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as StoreSettings;
            setSettings((prev) => ({ ...prev, ...data }));
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'settings/store')
      );
    } catch (e) {
      console.warn('Settings live sync init error', e);
    }

    // 4. Live Chat messages sync
    let unsubChat: () => void = () => {};
    try {
      const q = query(collection(db, 'chat_messages'), orderBy('timestamp', 'asc'));
      unsubChat = onSnapshot(
        q,
        (snapshot) => {
          const list: ChatMessage[] = [];
          snapshot.forEach((d) => list.push(d.data() as ChatMessage));
          setChatMessages(list);
          setIsFirestoreConnected(true);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'chat_messages')
      );
    } catch (e) {
      console.warn('Chat live sync init error', e);
    }

    return () => {
      unsubOrders();
      unsubProducts();
      unsubSettings();
      unsubChat();
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('as_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('as_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('as_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('as_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('as_settings', JSON.stringify(settings));

    // Dynamic website color update ("যেমন ইচ্ছা তেমন রং করতে পারব")
    const primary = settings.themePrimary || '#168BFF';
    const accent = settings.themeAccent || '#00D4FF';

    document.documentElement.style.setProperty('--color-electric', primary);
    document.documentElement.style.setProperty('--color-cyan', accent);
    document.documentElement.style.setProperty('--theme-primary', primary);
    document.documentElement.style.setProperty('--theme-accent', accent);

    let styleEl = document.getElementById('as-dynamic-theme-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'as-dynamic-theme-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      :root {
        --color-electric: ${primary} !important;
        --color-cyan: ${accent} !important;
        --theme-primary: ${primary} !important;
        --theme-accent: ${accent} !important;
      }
      .bg-\\[\\#168BFF\\] { background-color: ${primary} !important; }
      .text-\\[\\#168BFF\\] { color: ${primary} !important; }
      .border-\\[\\#168BFF\\] { border-color: ${primary} !important; }
      .from-\\[\\#168BFF\\] { --tw-gradient-from: ${primary} var(--tw-gradient-from-position) !important; --tw-gradient-to: rgb(22 139 255 / 0) var(--tw-gradient-to-position) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .to-\\[\\#00D4FF\\] { --tw-gradient-to: ${accent} var(--tw-gradient-to-position) !important; }
      .hover\\:bg-\\[\\#168BFF\\]:hover { background-color: ${primary} !important; }
      .hover\\:text-\\[\\#168BFF\\]:hover { color: ${primary} !important; }
      .hover\\:border-\\[\\#168BFF\\]:hover { border-color: ${primary} !important; }
      .text-\\[\\#00D4FF\\] { color: ${accent} !important; }
      .bg-\\[\\#00D4FF\\] { background-color: ${accent} !important; }
      .border-\\[\\#00D4FF\\] { border-color: ${accent} !important; }
      .shadow-\\[0_0_20px_rgba\\(22\\,139\\,255\\,0\\.35\\)\\] { box-shadow: 0 0 20px ${primary}55 !important; }
      ::-webkit-scrollbar-thumb:hover { background: ${primary} !important; }
    `;
  }, [settings]);

  // Toast notification system
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Translations helper
  const t = (key: keyof typeof TRANSLATIONS.en): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key] || key;
  };

  // Currency formatter
  const formatBDT = (amount: number): string => {
    return `৳${amount.toLocaleString('en-IN')}`;
  };

  // Open Product Detail
  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, variant?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedVariant === variant
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }
      return [...prev, { product, quantity, selectedVariant: variant }];
    });
    showToast(
      language === 'bn' 
        ? `${product.nameBn || product.name} কার্টে যোগ করা হয়েছে` 
        : `${product.name} added to cart`, 
      'success'
    );
  };

  const removeFromCart = (productId: string, variant?: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedVariant === variant)));
    showToast(language === 'bn' ? 'পণ্য কার্ট থেকে অপসারণ করা হয়েছে' : 'Item removed from cart', 'info');
  };

  const updateQuantity = (productId: string, quantity: number, variant?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.selectedVariant === variant
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(language === 'bn' ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast(language === 'bn' ? 'উইশলিস্টে যোগ করা হয়েছে' : 'Added to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Compare operations
  const compareList = useMemo(() => {
    return products.filter(p => compareIds.includes(p.id));
  }, [products, compareIds]);

  const addToCompare = (product: Product) => {
    if (compareIds.includes(product.id)) {
      showToast(language === 'bn' ? 'ইতিমধ্যে তুলনামূলক তালিকায় আছে' : 'Already in comparison list', 'info');
      return;
    }
    if (compareIds.length >= 4) {
      showToast(language === 'bn' ? 'সর্বোচ্চ ৪টি পণ্য তুলনা করা যাবে' : 'You can compare maximum 4 items', 'warning');
      return;
    }
    setCompareIds(prev => [...prev, product.id]);
    showToast(language === 'bn' ? 'তুলনা করার তালিকায় যোগ করা হয়েছে' : 'Added to compare list', 'success');
  };

  const removeFromCompare = (productId: string) => {
    setCompareIds(prev => prev.filter(id => id !== productId));
  };

  const clearCompare = () => {
    setCompareIds([]);
  };

  const isComparing = (productId: string) => compareIds.includes(productId);

  // Coupon application
  const applyCouponCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code === cleanCode);
    if (!coupon) {
      return { success: false, message: language === 'bn' ? 'ভুল কুপন কোড' : 'Invalid coupon code' };
    }
    if (coupon.minSpend && cartSubtotal < coupon.minSpend) {
      return {
        success: false,
        message: language === 'bn'
          ? `এই কুপনের জন্য সর্বনিম্ন ৳${coupon.minSpend} খরচ করতে হবে`
          : `Minimum order of ৳${coupon.minSpend} required for this coupon`
      };
    }
    setAppliedCoupon(coupon);
    showToast(language === 'bn' ? `কুপন '${coupon.code}' প্রয়োগ করা হয়েছে!` : `Coupon '${coupon.code}' applied!`, 'success');
    return { success: true, message: 'Coupon applied successfully!' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast(language === 'bn' ? 'কুপন অপসারণ করা হয়েছে' : 'Coupon removed', 'info');
  };

  // Orders creation (Requires Logged-In User)
  const createOrder = (shipping: ShippingDetails, paymentMethod: PaymentMethod): Order | null => {
    if (!currentUser) {
      showToast(
        language === 'bn'
          ? 'অর্ডার কনফার্ম করার আগে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন বা একাউন্ট তৈরি করুন।'
          : 'Please sign in or create an account to confirm your order.',
        'warning'
      );
      openAuthModal('login');
      return null;
    }

    const isDhaka = shipping.district.toLowerCase().includes('dhaka') || shipping.division.toLowerCase() === 'dhaka';
    const isFree = cartSubtotal >= settings.freeShippingThreshold;
    const shippingFee = isFree ? 0 : (isDhaka ? settings.shippingFeeInsideDhaka : settings.shippingFeeOutsideDhaka);

    let discountAmount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        discountAmount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
      } else {
        discountAmount = appliedCoupon.discountValue;
      }
    }

    const total = Math.max(0, cartSubtotal + shippingFee - discountAmount);
    const orderNumber = `ASC-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = `BD-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newOrder: Order = {
      id: orderNumber,
      trackingNumber,
      courierName: isDhaka ? 'Steadfast Express' : 'Pathao Nationwide',
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productSku: item.product.sku,
        price: item.product.price,
        quantity: item.quantity,
        variant: item.selectedVariant,
        thumbnail: item.product.thumbnail
      })),
      shipping,
      subtotal: cartSubtotal,
      shippingFee,
      discount: discountAmount,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentUser.id,
      userEmail: currentUser.email,
      userPhone: currentUser.phone || shipping.phone
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    setAppliedCoupon(null);
    setCurrentView('order-success');
    showToast(language === 'bn' ? `অর্ডার #${orderNumber} সাবমিট হয়েছে! স্ট্যাটাস: পেন্ডিং` : `Order #${orderNumber} placed! Status: Pending`, 'success');
    
    // Save order into Firebase Firestore
    saveOrderToFirestore(newOrder);
    return newOrder;
  };

  // Direct 1-Click Order for any product (Requires Logged-In User)
  const createDirectOrder = (
    product: Product,
    quantity: number,
    shipping: ShippingDetails,
    paymentMethod: PaymentMethod
  ): Order | null => {
    if (!currentUser) {
      showToast(
        language === 'bn'
          ? 'অর্ডার কনফার্ম করার আগে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন বা একাউন্ট তৈরি করুন।'
          : 'Please sign in or create an account to confirm your order.',
        'warning'
      );
      openAuthModal('login');
      return null;
    }

    const isDhaka = shipping.district.toLowerCase().includes('dhaka') || shipping.division.toLowerCase() === 'dhaka';
    const subtotal = product.price * quantity;
    const isFree = subtotal >= settings.freeShippingThreshold;
    const shippingFee = isFree ? 0 : (isDhaka ? settings.shippingFeeInsideDhaka : settings.shippingFeeOutsideDhaka);
    const total = subtotal + shippingFee;
    const orderNumber = `ASC-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = `BD-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newOrder: Order = {
      id: orderNumber,
      trackingNumber,
      courierName: isDhaka ? 'Steadfast Express' : 'Pathao Nationwide',
      items: [
        {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          price: product.price,
          quantity,
          thumbnail: product.thumbnail
        }
      ],
      shipping,
      subtotal,
      shippingFee,
      discount: 0,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentUser.id,
      userEmail: currentUser.email,
      userPhone: currentUser.phone || shipping.phone
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    setQuickOrderProduct(null);
    setCurrentView('order-success');
    showToast(
      language === 'bn'
        ? `অর্ডার #${orderNumber} সফলভাবে নিশ্চিত করা হয়েছে! (পেন্ডিং)`
        : `Order #${orderNumber} confirmed successfully! (Pending)`,
      'success'
    );

    // Save direct order into Firebase Firestore
    saveOrderToFirestore(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus'], courier?: string, trackingNo?: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              orderStatus: status,
              courierName: courier || order.courierName,
              trackingNumber: trackingNo || order.trackingNumber,
              updatedAt: new Date().toISOString()
            }
          : order
      )
    );
    showToast(`Order #${orderId} status: ${status}`, 'info');

    // Update in Firebase Firestore
    updateOrderInFirestore(orderId, {
      orderStatus: status,
      courierName: courier,
      trackingNumber: trackingNo
    });
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => {
      const updated = prev.filter(o => o.id !== orderId);
      try {
        localStorage.setItem('as_orders', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed saving orders to localStorage', e);
      }
      return updated;
    });

    if (activeOrder?.id === orderId) {
      setActiveOrder(null);
    }
    if (invoiceOrder?.id === orderId) {
      setInvoiceOrder(null);
    }

    showToast(language === 'bn' ? `অর্ডার #${orderId} সফলভাবে মুছে ফেলা হয়েছে` : `Order #${orderId} removed`, 'info');

    // Delete from Firebase Firestore
    deleteOrderFromFirestore(orderId);
  };

  // Product management for Admin
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now().toString(36)}`;
    const product: Product = { ...newProd, id };
    setProducts(prev => [product, ...prev]);
    showToast(language === 'bn' ? 'নতুন পণ্য সফলভাবে যুক্ত করা হয়েছে!' : 'New product added to catalog', 'success');

    // Save product into Firebase Firestore
    saveProductToFirestore(product);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast(language === 'bn' ? 'পণ্য আপডেট সম্পন্ন হয়েছে' : 'Product updated successfully', 'success');

    // Update in Firebase Firestore
    updateProductInFirestore(id, updates);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(language === 'bn' ? 'পণ্য ডিলিট করা হয়েছে' : 'Product removed from catalog', 'info');

    // Delete from Firebase Firestore
    deleteProductFromFirestore(id);
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('as_settings', JSON.stringify(updated));
      // Save settings into Firebase Firestore
      saveSettingsToFirestore(updated);
      return updated;
    });
    showToast(language === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Store settings updated successfully!', 'success');
  };

  // Send Live Chat Message (Firebase Firestore)
  const sendChatMessage = async (
    text: string,
    senderName?: string,
    senderPhone?: string,
    isAdmin = false,
    targetSessionId?: string,
    senderEmail?: string,
    userId?: string
  ) => {
    // Session is uniquely anchored to customer's account so that admin sees each user separately
    let sid = targetSessionId;
    if (!sid) {
      if (currentUser) {
        sid = `user_${currentUser.id || currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      } else {
        sid = chatSessionId;
      }
    }

    const newMsg: Omit<ChatMessage, 'id'> = {
      sessionId: sid,
      senderName: senderName || (isAdmin ? 'AS Computer অ্যাডমিন' : (currentUser?.name || 'কাস্টমার')),
      senderPhone: senderPhone || currentUser?.phone || '',
      senderEmail: senderEmail || currentUser?.email || '',
      userId: userId || currentUser?.id || '',
      text,
      isAdmin,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    };

    try {
      const id = await saveChatMessageToFirestore(newMsg);
      setChatMessages(prev => {
        if (prev.some(m => m.id === id)) return prev;
        return [...prev, { ...newMsg, id }];
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'chat_messages');
      const fallbackId = 'msg-' + Date.now();
      setChatMessages(prev => [...prev, { ...newMsg, id: fallbackId }]);
    }
  };

  // Auth Methods
  const isAdmin = Boolean(currentUser && currentUser.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && currentUser.role === 'admin');

  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const isTargetAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

    // 1. Try Firebase Auth
    try {
      if (auth) {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const fbUser = userCred.user;
        const loggedUser: AuthUser = {
          id: fbUser.uid,
          name: fbUser.displayName || (isTargetAdmin ? 'Rakib Hasan (Admin)' : cleanEmail.split('@')[0]),
          email: cleanEmail,
          role: isTargetAdmin ? 'admin' : 'customer'
        };
        setCurrentUser(loggedUser);
        setIsAuthModalOpen(false);
        showToast(
          isTargetAdmin
            ? (language === 'bn' ? 'অ্যাডমিন হিসেবে সফলভাবে লগইন হয়েছে!' : 'Logged in as Admin!')
            : (language === 'bn' ? 'স্বাগতম! সফলভাবে লগইন হয়েছে' : 'Welcome back! Logged in successfully'),
          'success'
        );
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Firebase login attempt:', err?.code || err?.message);
      // Fallback: If designated admin with fallback passcode
      if (isTargetAdmin && (pass === 'admin123' || pass === '123456' || pass === 'rakib404' || pass === 'admin')) {
        const adminUser: AuthUser = {
          id: 'admin_rakib_hasan',
          name: 'Rakib Hasan (Admin)',
          email: ADMIN_EMAIL,
          phone: '01723-373133',
          role: 'admin',
          address: 'AS Computer Store Admin'
        };
        setCurrentUser(adminUser);
        setIsAuthModalOpen(false);
        showToast(language === 'bn' ? 'অ্যাডমিন হিসেবে সফলভাবে লগইন হয়েছে' : 'Logged in as Admin successfully', 'success');
        return { success: true };
      }

      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        return {
          success: false,
          message: language === 'bn' ? 'ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে পুনরায় যাচাই করুন।' : 'Invalid email or password.'
        };
      }
      if (err?.code === 'auth/too-many-requests') {
        return {
          success: false,
          message: language === 'bn' ? 'অতিরিক্ত চেষ্টার কারণে সাময়িকভাবে বন্ধ আছে। কিছুক্ষণ পর চেষ্টা করুন।' : 'Too many attempts. Please try again later.'
        };
      }
      return {
        success: false,
        message: err?.message || (language === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.')
      };
    }

    return { success: false, message: 'Auth service not available' };
  };

  const register = async (name: string, email: string, pass: string, phone?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const isTargetAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

    try {
      if (auth) {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        const fbUser = userCred.user;
        if (cleanName) {
          try {
            await updateProfile(fbUser, { displayName: cleanName });
          } catch {}
        }
        const newUser: AuthUser = {
          id: fbUser.uid,
          name: cleanName || (isTargetAdmin ? 'Rakib Hasan (Admin)' : cleanEmail.split('@')[0]),
          email: cleanEmail,
          phone: phone?.trim(),
          role: isTargetAdmin ? 'admin' : 'customer',
          joinedDate: new Date().toISOString()
        };
        setCurrentUser(newUser);

        if (db) {
          setDoc(doc(db, 'users', fbUser.uid), newUser).catch(() => {});
        }

        setIsAuthModalOpen(false);
        showToast(language === 'bn' ? 'অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে' : 'Account created successfully!', 'success');
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Firebase register error:', err?.code || err?.message);
      if (err?.code === 'auth/email-already-in-use') {
        return {
          success: false,
          message: language === 'bn' ? 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করুন।' : 'This email is already in use. Please log in.'
        };
      }
      if (err?.code === 'auth/weak-password') {
        return {
          success: false,
          message: language === 'bn' ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.'
        };
      }
      return {
        success: false,
        message: err?.message || (language === 'bn' ? 'অ্যাকাউন্ট তৈরি করা সম্ভব হয়নি।' : 'Registration failed.')
      };
    }

    return { success: false, message: 'Auth service not available' };
  };

  const loginWithPhoneOrDemo = (role: 'customer' | 'admin', name?: string, phone?: string, email?: string) => {
    if (role === 'admin') {
      const adminUser: AuthUser = {
        id: 'admin_rakib_hasan',
        name: 'Rakib Hasan (Admin)',
        email: ADMIN_EMAIL,
        phone: '01723-373133',
        role: 'admin',
        address: 'School Market, Baneshwer Bazzar, Rajshahi',
        joinedDate: new Date().toISOString()
      };
      setCurrentUser(adminUser);
      setIsAuthModalOpen(false);
      showToast(language === 'bn' ? 'অ্যাডমিন হিসেবে লগইন সম্পন্ন হয়েছে' : 'Logged in as Store Admin', 'success');
    } else {
      const customerUser: AuthUser = {
        id: 'cust_' + Date.now().toString(36),
        name: name || 'Valued Customer',
        phone: phone || '01723-373133',
        email: email || `customer_${Date.now().toString(36).slice(-4)}@ascomputer.com`,
        role: 'customer',
        division: 'Dhaka',
        district: 'Dhaka (Inside City)',
        address: 'Mirpur-10, Dhaka',
        joinedDate: new Date().toISOString()
      };
      setCurrentUser(customerUser);
      setIsAuthModalOpen(false);
      showToast(language === 'bn' ? 'কাস্টমার হিসেবে সফলভাবে লগইন হয়েছে' : 'Logged in as Customer', 'success');
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Signout error', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('as_auth_user');
    showToast(language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Logged out successfully', 'info');
  };

  const updateUserProfile = (updates: Partial<AuthUser>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      // Do not allow changing role through update profile
      const safeUpdates = { ...updates };
      delete safeUpdates.role;
      delete safeUpdates.email;
      const updated = { ...prev, ...safeUpdates };
      localStorage.setItem('as_auth_user', JSON.stringify(updated));
      if (db && updated.id) {
        setDoc(doc(db, 'users', updated.id), updated, { merge: true }).catch(() => {});
      }
      return updated;
    });
    showToast(language === 'bn' ? 'প্রোফাইল তথ্য সংরক্ষিত হয়েছে' : 'Profile updated successfully', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProduct,
        setSelectedProduct,
        quickViewProduct,
        setQuickViewProduct,
        openProductDetail,
        language,
        setLanguage,
        t,
        formatBDT,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
        coupons,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        orders,
        activeOrder,
        setActiveOrder,
        createOrder,
        createDirectOrder,
        updateOrderStatus,
        deleteOrder,
        quickOrderProduct,
        setQuickOrderProduct,
        settings,
        updateSettings,
        toasts,
        showToast,
        removeToast,
        invoiceOrder,
        setInvoiceOrder,
        chatMessages,
        sendChatMessage,
        isChatOpen,
        setIsChatOpen,
        chatSessionId,
        isFirestoreConnected,
        currentUser,
        isAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        login,
        register,
        loginWithPhoneOrDemo,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
