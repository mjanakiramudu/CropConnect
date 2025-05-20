
export type UserRole = "farmer" | "customer";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  // For simplicity, password is not stored/checked securely in this mock setup
  // In a real app, never store plain text passwords.
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
  cartQuantity: number; // Quantity of this product in the cart
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

export interface SaleNotificationItem {
  productName: string;
  quantity: number;
  pricePerUnit: number;
}

export interface SaleNotification {
  id: string;
  orderId: string; // Could be a mock order ID
  customerName: string; // Name of the customer who made the purchase
  items: SaleNotificationItem[];
  totalAmount: number;
  date: string; // ISO date string
  read: boolean;
}
