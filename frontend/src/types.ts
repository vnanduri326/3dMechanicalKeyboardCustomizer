// frontend/src/types.ts

export interface ColorVariant {
  colorName: string;
  colorHex: string;
  price: number;
  sku: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  canonical_name: string;   // Maps to backend canonical_name
  handle: string;           // Asset slug / handle
  type: "keyboard" | "switch" | "keycaps" | "keycap" | "pcb_plate"; // API may use keycap or keycaps
  brand: string;
  product_type_raw?: string;
  min_price: number;        // Base price for cart total calculations
  tags: string[];           // Filter specs (e.g. "feel:linear", "layout:75%")
  image_url?: string;
  source_url?: string;
  color_variants?: ColorVariant[];
}

// Active selection state for the customizer workspace & cart
export interface CustomizerSelection {
  case?: Product;
  pcbPlate?: Product;
  switch?: Product;
  keycap?: Product;
}