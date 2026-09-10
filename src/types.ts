export interface Fruit {
  id: string;
  name: string;
  scientificName: string;
  variety: string;
  category: 'berries' | 'exoticas' | 'packs' | string;
  tagline: string;
  description: string;
  pricePerGram: number;
  defaultGramUnit: number;
  standardPrice: number;
  presentation: string;
  imageUrl: string;
  brix: string;
  altitude: string;
  benefits: string[];
  shelfLife: string;
  inStock: boolean;
  popular?: boolean;
}

export interface PackagingOption {
  id: string;
  name: string;
  description: string;
  extraPrice: number;
  iconName?: string;
  ecoFriendly?: boolean;
  bestFor?: string;
  badge?: string;
  imageUrl?: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  unit?: string;
  imageUrl: string;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  subtitle: string;
  weight: string;
  priceMonth: number;
  deliveryFrequency: string;
  isPopular?: boolean;
  idealFor: string;
  features: string[];
}

export interface Certification {
  id: string;
  title: string;
  code: string;
  description: string;
  issuer?: string;
  icon?: string;
}

export interface Recipe {
  id: string;
  title: string;
  prepTime: string;
  difficulty: string;
  image?: string;
  imageUrl?: string;
  description?: string;
  summary?: string;
  ingredients: string[];
  instructions: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  avatar: string;
  rating: number;
  comment: string;
  verifiedOrder: string;
}

export interface FAQ {
  id: string;
  category?: string;
  question: string;
  answer: string;
}

export interface CartItem {
  fruit: Fruit;
  quantity: number;
}

export interface CustomOrderItemFruit {
  fruitId: string;
  grams: number;
}

export interface CustomOrder {
  id: string;
  packagingId: string;
  fruits: CustomOrderItemFruit[];
  addOns: string[];
  ripeness: string;
  giftMessage?: string;
  recipientName?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  frequency: string;
  notes?: string;
  paymentMethod: string;
  subtotal: number;
  packagingCost: number;
  addOnsCost: number;
  discount: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
}
