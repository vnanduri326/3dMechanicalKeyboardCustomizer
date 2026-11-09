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

/** Cart slot aligned with CustomizerSelection keys (case, pcbPlate, switch, keycap). */
export type CartSlot = 'case' | 'pcbPlate' | 'switch' | 'keycap';

/** One cart row; multiple lines allowed per slot (e.g. several keycap sets). */
export interface CartLine {
  lineId: string;
  product: Product;
  slot: CartSlot;
  quantity: number;
}