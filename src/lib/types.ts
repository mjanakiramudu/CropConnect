export type UserRole = "farmer" | "customer";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit: string; // e.g., kg, bunch, piece
  quantity: number; // Available quantity
  category: string; // e.g., Vegetables, Fruits, Grains
  location: string; // Farmer's location or where product is sourced
  farmerId: string;
  farmerName: string; // Denormalized for easier display
  imageUrl?: string;
  dateAdded: string; // ISO date string
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string; // ISO date string
  shippingAddress?: any; // Placeholder for address object
}

// For AI voice upload output
export interface VoiceUploadResult {
  productName: string;
  location: string;
  price: number;
  unit: string;
}
