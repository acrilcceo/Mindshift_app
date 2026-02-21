import React, { useMemo, useState } from 'react';
import { AppState, MarketplaceCategoryId, MarketplaceProduct } from '../types';

interface MarketplaceProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

const categories: { id: MarketplaceCategoryId; label: string; description: string }[] = [
  {
    id: 'ritual_tools',
    label: 'Ritual Tools',
    description: 'Objects many people include in daily intention rituals.'
  },
  {
    id: 'protection_grounding',
    label: 'Protection & Grounding',
    description: 'Symbolic pieces often chosen for feeling held and anchored.'
  },
  {
    id: 'sleep_calm',
    label: 'Sleep & Calm',
    description: 'Soft tools people use to slow down at the end of the day.'
  },
  {
    id: 'focus_energy',
    label: 'Focus & Energy',
    description: 'Small supports for clear focus and gentle momentum.'
  }
];

const curatedProducts: MarketplaceProduct[] = [
  {
    id: 'ritual-journal-linen',
    title: 'Linen Ritual Journal',
    categoryId: 'ritual_tools',
    imageUrl: '/images/marketplace/journal-linen.jpg',
    shortDescription: 'A softly textured journal many people use for daily scripting.',
    oftenUsedFor: 'Evening gratitude and 3-6-9 writing.',
    ritualTags: ['369', 'journal'],
    sellerName: 'Calm Pages Studio',
    ratingAverage: 4.9,
    ratingCount: 124,
    priceCents: 189900,
    currency: 'INR',
    isFeatured: true
  },
  {
    id: 'ritual-affirmation-cards',
    title: 'Whisper Affirmation Cards',
    categoryId: 'ritual_tools',
    imageUrl: '/images/marketplace/affirmation-cards.jpg',
    shortDescription: 'A small deck of gentle phrases to pair with your rituals.',
    oftenUsedFor: 'Selecting an anchor sentence before 5-5-5 or Whisper practice.',
    ritualTags: ['555', 'whisper'],
    sellerName: 'Inner Voice Atelier',
    ratingAverage: 4.8,
    ratingCount: 88,
    priceCents: 149900,
    currency: 'INR'
  },
  {
    id: 'protection-evil-eye-band',
    title: 'Symbolic Protection Band',
    categoryId: 'protection_grounding',
    imageUrl: '/images/marketplace/evil-eye-band.jpg',
    shortDescription: 'A simple band many people wear as a reminder of inner safety.',
    oftenUsedFor: 'Grounding rituals and daily intention setting.',
    ritualTags: ['release', 'journal'],
    sellerName: 'Still Grounded Co.',
    ratingAverage: 4.7,
    ratingCount: 63,
    priceCents: 99900,
    currency: 'INR'
  },
  {
    id: 'grounding-mat-desk',
    title: 'Soft Grounding Desk Mat',
    categoryId: 'protection_grounding',
    imageUrl: '/images/marketplace/grounding-mat.jpg',
    shortDescription: 'A smooth surface people use to feel more anchored while they work.',
    oftenUsedFor: 'Focus sessions and SoundShift study mixes.',
    ritualTags: ['soundshift', '369'],
    sellerName: 'Neutral Studio',
    ratingAverage: 4.6,
    ratingCount: 41,
    priceCents: 229900,
    currency: 'INR'
  },
  {
    id: 'sleep-weighted-mask',
    title: 'Weighted Linen Eye Mask',
    categoryId: 'sleep_calm',
    imageUrl: '/images/marketplace/weighted-mask.jpg',
    shortDescription: 'A lightly weighted mask many people include in evening wind-down.',
    oftenUsedFor: 'Pairing with sleep-focused SoundShift sessions.',
    ritualTags: ['soundshift', 'whisper'],
    sellerName: 'Slow Evening Goods',
    ratingAverage: 4.9,
    ratingCount: 97,
    priceCents: 179900,
    currency: 'INR'
  },
  {
    id: 'sleep-herbal-tea',
    title: 'Herbal Evening Tea Blend',
    categoryId: 'sleep_calm',
    imageUrl: '/images/marketplace/herbal-tea.jpg',
    shortDescription: 'A gentle herbal blend often chosen for quiet evening routines.',
    oftenUsedFor: 'Sipping during journaling or visualization before sleep.',
    ritualTags: ['journal'],
    sellerName: 'Quiet Cup Collective',
    ratingAverage: 4.5,
    ratingCount: 52,
    priceCents: 129900,
    currency: 'INR'
  },
  {
    id: 'focus-desk-plant',
    title: 'Desk Plant Companion',
    categoryId: 'focus_energy',
    imageUrl: '/images/marketplace/desk-plant.jpg',
    shortDescription: 'A small, low-care plant many people place by their workspace.',
    oftenUsedFor: 'Creating a softer atmosphere during focus rituals.',
    ritualTags: ['369', 'soundshift'],
    sellerName: 'Green Corner Studio',
    ratingAverage: 4.8,
    ratingCount: 71,
    priceCents: 89900,
    currency: 'INR'
  },
  {
    id: 'focus-aroma-sticks',
    title: 'Subtle Focus Aroma Sticks',
    categoryId: 'focus_energy',
    imageUrl: '/images/marketplace/aroma-sticks.jpg',
    shortDescription: 'Lightly scented sticks people use to mark focused work blocks.',
    oftenUsedFor: 'Starting a 25–50 minute focus ritual or visualization.',
    ritualTags: ['369', 'visualize'],
    sellerName: 'Quiet Spark Studio',
    ratingAverage: 4.6,
    ratingCount: 58,
    priceCents: 79900,
    currency: 'INR'
  }
];

const formatPrice = (priceCents: number, currency: string) => {
  const value = priceCents / 100;
  if (currency === 'INR') {
    return `₹${value.toFixed(0)}`;
  }
  return `${currency} ${value.toFixed(2)}`;
};

const Marketplace: React.FC<MarketplaceProps> = ({ state, onUpdate }) => {
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategoryId | 'all'>('all');

  const wishlist = state.wishlistProductIds || [];

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return curatedProducts;
    return curatedProducts.filter(p => p.categoryId === activeCategory);
  }, [activeCategory]);

  const toggleWishlist = (productId: string) => {
    const existing = state.wishlistProductIds || [];
    const next = existing.includes(productId)
      ? existing.filter(id => id !== productId)
      : [...existing, productId];
    onUpdate({ wishlistProductIds: next });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif text-heading-primary">
          MindShift Marketplace
        </h2>
        <p className="text-sm text-body-main">
          Tools to support your inner work. Calm, curated, and intentionally minimal.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-[#E8F1EF] text-heading-secondary'
                : 'bg-[#EEF2F6] text-helper'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#E8F1EF] text-heading-secondary'
                  : 'bg-[#EEF2F6] text-helper'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs text-helper">
            Select a category to explore objects many people weave into their rituals.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const category = categories.find(c => c.id === product.categoryId);
          const isWishlisted = wishlist.includes(product.id);
          return (
            <article
              key={product.id}
              className="card-elevated flex flex-col overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3] bg-[#EEF2F6]">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {product.isFeatured && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-medium bg-white/80 text-heading-secondary">
                    Curated Pick
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-xs"
                >
                  <span className={isWishlisted ? 'text-heading-secondary' : 'text-helper'}>
                    {isWishlisted ? '♥' : '♡'}
                  </span>
                </button>
              </div>
              <div className="flex-1 flex flex-col p-5 space-y-3">
                <div className="space-y-1">
                  {category && (
                    <div className="text-[10px] uppercase tracking-[0.16em] text-helper">
                      {category.label}
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-heading-secondary">
                    {product.title}
                  </h3>
                  <p className="text-xs text-body-main">
                    {product.shortDescription}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] text-helper">
                    Often used for{' '}
                    <span className="text-body-main">
                      {product.oftenUsedFor}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-micro">
                    Offered by {product.sellerName}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-heading-secondary">
                      {formatPrice(product.priceCents, product.currency)}
                    </div>
                    <div className="text-[11px] text-helper">
                      {product.ratingAverage.toFixed(1)} · {product.ratingCount} reviews
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-[#E8F1EF] text-heading-secondary"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default Marketplace;

