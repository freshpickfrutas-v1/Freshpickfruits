export interface FruitItem {
  id: string;
  name: string;
  scientificName: string;
  variety: string;
  category: 'frescos' | 'jumbo' | 'familiar' | 'congelados' | string;
  tagline: string;
  description: string;
  pricePerGram: number; // in COP per gram, e.g., 28 COP/g (28.000 COP / kg)
  defaultGramUnit: number; // e.g. 250g
  standardPrice: number; // presentation standard price e.g. 250g
  presentation: string; // e.g. "Clamshell 250g"
  imageUrl: string;
  imageAlt?: string;
  brix: string; // e.g. "14° - 16° Brix"
  altitude: string; // e.g. "2.450 m.s.n.m."
  benefits: string[];
  shelfLife: string;
  inStock: boolean;
  popular?: boolean;
}

export interface CustomFruitSelection {
  fruitId: string;
  grams: number; // quantity in grams
}

export interface PackagingOption {
  id: string;
  name: string;
  description: string;
  extraPrice: number;
  iconName: string;
  bestFor: string;
  badge?: string;
}

export interface AddOnItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  imageAlt?: string;
}

export interface CustomOrder {
  id?: string;
  packagingId: string;
  fruits: CustomFruitSelection[];
  addOns: string[]; // ids of selected addons
  ripeness: 'ready_now' | 'firm_for_week' | 'ripe_for_smoothies';
  giftMessage?: string;
  recipientName?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: 'morning' | 'afternoon';
  frequency: 'one_time' | 'weekly' | 'biweekly';
  notes?: string;
  paymentMethod: 'nequi_daviplata' | 'transfer' | 'card' | 'cash_on_delivery';
  subtotal: number;
  packagingCost: number;
  addOnsCost: number;
  discount: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  subtitle: string;
  weight: string;
  priceMonth: number;
  deliveryFrequency: string;
  features: string[];
  isPopular?: boolean;
  idealFor: string;
}

export interface RecipeItem {
  id: string;
  title: string;
  prepTime: string;
  difficulty: string;
  image: string;
  imageAlt?: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  city: string;
  avatar: string;
  imageAlt?: string;
  rating: number;
  comment: string;
  verifiedOrder: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'pedidos' | 'calidad' | 'entregas' | 'pagos';
}

export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

export type OrderStatus = 'pendiente' | 'confirmado' | 'cosechando' | 'en_camino' | 'entregado' | 'cancelado';

export interface FirestoreOrderItem {
  name: string;
  quantityText: string;
  price: number;
}

export interface FirestoreOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  notes?: string;
  packaging?: string;
  items: FirestoreOrderItem[];
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
}
