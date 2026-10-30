export const DEFAULT_PRODUCT_IMAGE = '/images/category_mechanical_keyboard_1793020164307.jpg';
export const DEFAULT_BANNER_IMAGE = '/images/hero_setup_showcase_1793020165334.jpg';

export const CDN_FALLBACK_IMAGES = {
  keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  accessories: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80',
  cooling: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
  setup: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
};

/**
 * Ensures an img src attribute NEVER receives an empty string ("")
 * and converts any legacy /src/assets/images/ paths to root /images/ paths.
 */
export function getSafeImageSrc(
  src: string | null | undefined,
  fallback = DEFAULT_PRODUCT_IMAGE
): string {
  if (!src || typeof src !== 'string' || src.trim() === '') {
    return fallback;
  }
  const clean = src.trim();
  if (clean.startsWith('/src/assets/images/')) {
    return clean.replace('/src/assets/images/', '/images/');
  }
  if (clean.startsWith('src/assets/images/')) {
    return clean.replace('src/assets/images/', '/images/');
  }
  return clean;
}

/**
 * Handles image onError so that broken or missing image URLs seamlessly fallback
 * to a local public image or reliable CDN asset without showing a broken icon.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = DEFAULT_PRODUCT_IMAGE
) {
  const target = e.currentTarget;
  if (target.dataset.triedFallback === 'true') {
    if (target.dataset.triedCdn !== 'true') {
      target.dataset.triedCdn = 'true';
      target.src = CDN_FALLBACK_IMAGES.keyboard;
    }
    return;
  }
  target.dataset.triedFallback = 'true';
  target.src = fallback;
}
