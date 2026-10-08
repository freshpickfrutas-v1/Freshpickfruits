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

/** Publishing workflow fields shared by recipes and articles (written by the content automation). */
export type ContentStatus = 'publicado' | 'borrador';
export type ContentMode = 'automatico' | 'revision';
export type ImageKind = 'propia' | 'stock' | 'generada';

export interface ContentSource {
  titulo: string;
  url: string;
  /** Publisher, e.g. "PubMed", "ScienceDaily", "USDA". */
  medio: string;
  /** ISO date of the source, if known. */
  fecha?: string;
  /** Language of the source; "en" is labeled "(en inglés)". */
  idioma?: 'es' | 'en';
}

interface ContentWorkflow {
  estado?: ContentStatus;
  modo?: ContentMode;
  imagenTipo?: ImageKind;
  /** Caption shown under the image, e.g. "Imagen ilustrativa generada con IA". */
  imagenCredit?: string;
}

export type RecipeCategoryId =
  | 'smoothies-batidos'
  | 'desayunos'
  | 'postres-saludables'
  | 'snacks-meriendas'
  | 'ensaladas-platos-frescos'
  | 'bebidas-refrescos'
  | 'preparaciones-conservas'
  | 'recetas-rapidas';

export interface RecipeCategory {
  id: RecipeCategoryId;
  name: string;
  description: string;
  emoji: string;
}

export interface RecipeIngredient {
  text: string;
  /** Highlights the ingredient as Fresh Pick blueberries. */
  freshPick?: boolean;
}

export type RecipeDifficulty = 'Fácil' | 'Intermedio' | 'Avanzado';

export interface Recipe extends ContentWorkflow {
  /** URL slug: /recetas/<slug> */
  slug: string;
  title: string;
  excerpt: string;
  /** Leave empty to show the branded placeholder until a real photo exists. */
  image?: string;
  imageAlt: string;
  /** Primary category. "recetas-rapidas" is assigned automatically when total time is 15 min or less. */
  category: Exclude<RecipeCategoryId, 'recetas-rapidas'>;
  extraCategories?: Exclude<RecipeCategoryId, 'recetas-rapidas'>[];
  prepMinutes: number;
  cookMinutes: number;
  /** Waiting time (fridge, freezer, resting). Counts toward total time. */
  restMinutes?: number;
  difficulty: RecipeDifficulty;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  tips: string[];
  featured?: boolean;
  /** Tie-breaker for recipes published the same day (lower first). */
  orden?: number;
  /** ISO publication date; newest recipes are listed first. */
  date?: string;
  /** Exact publication time (set by the automation) to order recipes published the same day. */
  publicadoEn?: string;
}

export type BlogCategoryId =
  | 'beneficios-arandanos'
  | 'nutricion-ciencia'
  | 'salud-digestiva-bienestar'
  | 'estilo-vida-saludable'
  | 'cultivo-origen';

export interface BlogCategory {
  id: BlogCategoryId;
  name: string;
  description: string;
}

/** Content blocks for long-form articles; keeps headings semantic (h2/h3) for SEO. */
export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][]; caption?: string };

export interface BlogArticle extends ContentWorkflow {
  /** URL slug: /noticias/<slug> */
  slug: string;
  title: string;
  /** Used for <meta name="description"> (ideally 140–160 characters). */
  metaDescription: string;
  excerpt: string;
  category: BlogCategoryId;
  /** ISO date, e.g. "2026-09-20". */
  date: string;
  /** Exact publication time (set by the automation) to order news published the same day. */
  publicadoEn?: string;
  readMinutes: number;
  author: string;
  image?: string;
  imageAlt: string;
  blocks: BlogBlock[];
  /** Sources shown at the end of the article (required for health claims and news). */
  fuentes?: ContentSource[];
  /** Slugs of recipes to suggest at the end of the article. */
  relatedRecipes?: string[];
  featured?: boolean;
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

export type StaffRole = 'admin' | 'finanzas' | 'poscosecha' | 'contabilidad' | 'asistente' | 'domiciliario';
export type UserRole = StaffRole | 'customer';

export const STAFF_ROLES: StaffRole[] = ['admin', 'finanzas', 'poscosecha', 'contabilidad', 'asistente', 'domiciliario'];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  finanzas: 'Finanzas / Tesorería',
  poscosecha: 'Poscosecha',
  contabilidad: 'Auxiliar contable',
  asistente: 'Asistente todero',
  domiciliario: 'Domiciliario',
  customer: 'Cliente'
};

export type SubscriptionStatus = 'solicitada' | 'activa' | 'pausada' | 'cancelada';

export interface SubscriptionHistoryEntry {
  action: string;
  at: string;
  by: string;
  note?: string;
}

export interface SubscriptionDoc {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planId: string;
  planTitle: string;
  planWeight: string;
  deliveryFrequency: string;
  priceMonth: number;
  shippingAddress: string;
  shippingCity: string;
  status: SubscriptionStatus;
  createdAt: string;
  startDate?: string;
  nextDelivery?: string;
  notes?: string;
  /** What the customer asked for from their panel; the team applies it. */
  customerRequest?: 'pausar' | 'cancelar' | '';
  customerRequestAt?: string;
  history?: SubscriptionHistoryEntry[];
}

export interface SavedAddress {
  id: string;
  /** "Casa", "Oficina" or a custom name. */
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  /** Apto, torre, casa, oficina… */
  complement?: string;
  neighborhood?: string;
  city: string;
  /** Exact pin confirmed with Google Maps (only when the person picked a suggestion). */
  lat?: number;
  lng?: number;
  placeId?: string;
  notes?: string;
  timeSlot?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  addresses?: SavedAddress[];
  billing?: BillingData;
  createdAt: string;
}

/**
 * Order flow, in 7 stages. 'pendiente' is stage 1 ("Recibido"): it keeps the id the public checkout
 * and firestore.rules already use, so the rules do not need to change.
 */
export type OrderStatus =
  | 'pendiente'        // 1. Recibido / por confirmar
  | 'pago_verificado'  // 2. Pago verificado
  | 'en_proceso'       // 3. Poscosecha y facturación (en paralelo)
  | 'empacado'         // 4. Empacado / por despachar
  | 'en_ruta'          // 5. En ruta
  | 'entregado'        // 6. Entregado
  | 'cerrado'          // 7. Factura emitida y cierre
  | 'cancelado';

export interface BillingData {
  /** 'persona' = cédula; 'empresa' = factura con NIT. */
  type: 'persona' | 'empresa';
  document: string;       // cédula or NIT
  dv?: string;            // NIT verification digit
  businessName?: string;  // razón social
  taxRegime?: string;     // régimen fiscal
  billingEmail?: string;
  /** Billing address (can differ from the delivery one). */
  address?: string;
}

/** How the customer paid: kept on every order for reconciliation (gateway or manual capture). */
export interface PaymentRecord {
  /** Reference sent to the gateway, or the one the team writes for a manual payment. */
  reference: string;
  /** Transaction id from the gateway, or the bank/Nequi receipt number. */
  transactionId: string;
  /** 'tarjeta' | 'pse' | 'nequi' | 'daviplata' | 'transferencia' | 'bre_b' (other gateway methods are kept as received). */
  method: string;
  /** Amount charged, in COP. */
  amount: number;
  /** When the payment was approved (ISO). */
  approvedAt: string;
  source: 'wompi' | 'manual';
  recordedBy: string;
}

export interface OrderHistoryEntry {
  status: OrderStatus | 'factura' | 'pago' | 'despacho';
  at: string;
  by: string;
  note?: string;
}

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
  shippingComplement?: string;
  shippingLat?: number;
  shippingLng?: number;
  shippingMapsUrl?: string;
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
  billing?: BillingData;
  paymentStatus?: 'pendiente' | 'verificado';
  invoiceStatus?: 'pendiente' | 'emitida';
  invoiceNumber?: string;
  invoiceUrl?: string;
  payment?: PaymentRecord;
  /** Scheduled dispatch day (YYYY-MM-DD). */
  dispatchDate?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  history?: OrderHistoryEntry[];
}
