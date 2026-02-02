// ============================================
// AgroOrder - B2B Farm Produce Wholesale Platform
// Type Definitions
// ============================================

// Unit Types for wholesale products
export type UnitType = 'KG' | 'TON' | 'BAG' | 'CRATE' | 'DOZEN' | 'PIECE' | 'LITER';

// Order Status
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

// User Role
export type UserRole = 'buyer' | 'admin';

// ============================================
// USER & AUTHENTICATION
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  phone?: string;
  company?: string;
  address?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  token: string;
  user?: User;
}

// ============================================
// PRODUCT CATALOG
// ============================================

export interface Category {
  id: string;
  name: string;         // slug: "grains-pulses", "vegetables", etc.
  displayName: string;  // "Grains & Pulses", "Vegetables", etc.
  icon?: string;        // emoji or icon name
  description?: string;
  isOrganic: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  pricePerUnit: number;     // Price in base currency (INR)
  unitType: UnitType;
  minOrderQty: number;
  stockQty: number;
  images: string[];         // Array of image URLs
  supplierName?: string;
  isOrganic: boolean;
  isActive: boolean;
  isFeatured: boolean;
  lowStockAlert: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

// Tiered pricing for B2B bulk orders
export interface PriceTier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
  discount?: number;  // percentage discount from base price
}

// ============================================
// ORDERS
// ============================================

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  // Buyer info (for guest orders or stored at order time)
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCompany?: string;
  buyerAddress?: string;
  // Order details
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;    // Store name at time of order
  quantity: number;
  unitType: UnitType;
  pricePerUnit: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

// ============================================
// SETTINGS
// ============================================

export interface Settings {
  id: string;
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  whatsappNumber?: string;
  companyAddress?: string;
  orderNotificationEmail?: string;
  currency: string;
  currencySymbol: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    message: string;
    code?: string;
  };
}

// ============================================
// FORM/INPUT TYPES
// ============================================

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  pricePerUnit: number;
  unitType: UnitType;
  minOrderQty?: number;
  stockQty?: number;
  images?: string[];
  supplierName?: string;
  isOrganic?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  lowStockAlert?: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface CreateOrderInput {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCompany?: string;
  buyerAddress?: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitType: UnitType;
    pricePerUnit: number;
  }[];
}

export interface CreateCategoryInput {
  name: string;
  displayName: string;
  icon?: string;
  description?: string;
  isOrganic?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

// ============================================
// FILTER/QUERY TYPES
// ============================================

export interface ProductFilters {
  categoryId?: string;
  category?: string;       // category slug
  isOrganic?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  buyerEmail?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ============================================
// DASHBOARD/ANALYTICS TYPES
// ============================================

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  recentOrders: Order[];
}

export interface InventoryItem {
  product: Product;
  stockQty: number;
  lowStockAlert: number;
  isLowStock: boolean;
}
