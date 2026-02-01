// Product Types
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'tech' | 'clothes';
  description: string;
  inStock: boolean;
  prices: Price[];
  gallery: string[];
  attributes: AttributeSet[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Price {
  currency: Currency;
  amount: number;
}

export interface Currency {
  label: string;  // "USD"
  symbol: string; // "$"
}

export interface AttributeSet {
  id: string;
  name: string;        // "Size", "Color"
  type: 'text' | 'swatch';
  items: Attribute[];
}

export interface Attribute {
  id: string;
  displayValue: string; // "Small"
  value: string;        // "S" or hex color for swatches
}

// Cart Types
export interface CartItem {
  product: Product;
  selectedAttributes: Record<string, string>; // { "Size": "M", "Color": "#000000" }
  quantity: number;
}

// Category Type
export interface Category {
  name: string;
  title: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
