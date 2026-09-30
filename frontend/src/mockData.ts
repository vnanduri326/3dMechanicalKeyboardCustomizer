import { Product } from './types';

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Evoworks Evo75 Aluminum Hotswap Wireless Keyboard",
    brand: "Evoworks",
    productType: "75% Keyboards",
    colorVariants: [
      { colorName: "Black", colorHex: "#1a1a1a", price: 169.90, sku: "EVO-EVO75-BKFR4", inStock: true },
      { colorName: "Ice Blue", colorHex: "#a8c6d8", price: 169.90, sku: "EVO-EVO75-BUFR4", inStock: true },
    ],
  },
  {
    id: "2",
    name: "Ducky One X Full-Size Inductive Keyboard",
    brand: "Ducky",
    productType: "Full-size Keyboards",
    colorVariants: [
      { colorName: "White", colorHex: "#f5f5f5", price: 119.00, sku: "DKY-ONEX-WHT", inStock: true },
    ],
  },
];