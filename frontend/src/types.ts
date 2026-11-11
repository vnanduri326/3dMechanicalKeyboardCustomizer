// frontend/src/types.ts

export interface ColorVariant {
  color_name: string;
  color_hex?: string;
  plate_material?: string;
  price: number;
  sku: string;
  in_stock: boolean;
  options?: Record<string, string>;
}

export interface Product {
  id: string;
  canonical_name: string;   // Maps to backend canonical_name
  handle?: string;
  type: "keyboard" | "switch" | "keycap" | "keycaps" | "pcb_plate" | "other";
  brand: string;
  product_type_raw?: string;
  min_price?: number | null;
  tags: string[];
  image_url?: string;
  source_url?: string;
  color_variants?: ColorVariant[];
}

export interface PreferenceSelection {
  keyboardSize?: string;
  switch?: string;
  keycapProfile?: string;
  pcbPlate?: Product;
}

export interface RecommendationPreferences {
  keycap: string;
  switch: string;
  plate: string;
  size: string;
}

export interface RecommendationOptions {
  keycap: string[];
  switch: string[];
  plate: string[];
  size: string[];
}

export interface KeyboardRecommendation extends Product {
  score: number;
  matching_preferences: string[];
}