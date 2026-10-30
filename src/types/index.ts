export type ProductCategory =
  | 'mini-fans'
  | 'power-supply'
  | 'cables-connectors'
  | 'power-charging'
  | 'headphones-audio'
  | 'computer-accessories'
  | 'pc-components'
  | 'cooling-fans'
  | 'storage-devices'
  | 'networking'
  | 'adapters-converters'
  | 'gaming-accessories'
  | 'smart-desk'
  | 'laptop-accessories'
  | 'electronic-tools'
  | 'deals-bundles'
  | (string & {});

export type ProductBadge = 'New' | 'Best Seller' | 'Sale' | 'Hot' | 'Demo';

export interface ProductReview {
  id: string;
  userName: string;
  userCity: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface ProductQA {
  id: string;
  question: string;
  askedBy: string;
  date: string;
  answer?: string;
  answeredBy?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameBn?: string;
  brand: string;
  category: ProductCategory;
  price: number; // in BDT (৳)
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  thumbnail: string;
  description: string;
  descriptionBn?: string;
  specs: Record<string, string>;
  compatibility?: string;
  warranty: string;
  returnPolicy?: string;
  badges?: ProductBadge[];
  variants?: {
    type: 'Color' | 'Length' | 'Capacity' | 'Wattage' | 'Switch';
    options: string[];
  };
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFlashDeal?: boolean;
  flashDealEndsAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type OrderStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Delivered' | 'Processing' | 'Confirmed' | 'Shipped' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card';

export interface OrderItem {
  productId: string;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  variant?: string;
  thumbnail: string;
}

export interface ShippingDetails {
  fullName: string;
  phone: string;
  email: string;
  division: string;
  district: string;
  address: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  courierName?: string;
  items: OrderItem[];
  shipping: ShippingDetails;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  userId?: string;
  userEmail?: string;
  userPhone?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number;
  description: string;
}

export interface HeroBannerSlide {
  id: string;
  image: string;
  title: string;
  titleBn?: string;
  subtitle: string;
  subtitleBn?: string;
  buttonText: string;
  buttonTextBn?: string;
  link: string;
}

export interface StoreSettings {
  ownerName?: string;
  freeShippingThreshold: number;
  shippingFeeInsideDhaka: number;
  shippingFeeOutsideDhaka: number;
  supportPhone: string;
  supportEmail: string;
  supportWhatsApp: string;
  announcementText: string;
  announcementTextBn: string;
  storeAddress: string;

  // Notice Bar Control
  noticeEnabled?: boolean;
  noticeText?: string;
  noticeBadgeText?: string;
  noticeBgColor?: 'red' | 'amber' | 'emerald' | 'blue' | 'purple' | 'custom';
  noticeCustomBg?: string;
  noticeScrollable?: boolean;

  // Hero Banners (Multi-slide carousel or single banner)
  banners?: HeroBannerSlide[];
  bannerImage?: string;
  bannerTitle?: string;
  bannerTitleBn?: string;
  bannerSubtitle?: string;
  bannerSubtitleBn?: string;
  bannerButtonText?: string;
  bannerButtonTextBn?: string;
  bannerLink?: string;

  // Store Logo & Branding
  logoUrl?: string;

  // Theme & Color Customizer ("যেমন ইচ্ছা তেমন রং করতে পারব")
  themePrimary?: string;
  themeAccent?: string;
  themePreset?: string;
}

export type ActiveView = 
  | 'home' 
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'order-success' 
  | 'account' 
  | 'admin' 
  | 'compare';

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  userId?: string;
  text: string;
  isAdmin: boolean;
  createdAt: string;
  timestamp: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  avatar?: string;
  division?: string;
  district?: string;
  address?: string;
  joinedDate?: string;
}
