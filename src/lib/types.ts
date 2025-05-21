
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
  averageRating?: number; // New field
  totalRatings?: number; // New field
}

export interface CartItem extends Product {
  cartQuantity: number; // Quantity of this product in the cart
}

export interface OrderItem extends Omit<Product, 'quantity' | 'averageRating' | 'totalRatings' | 'id' > { // Product details at the time of order
  orderedQuantity: number;
  pricePerUnit: number; // Price at the time of order
  productId: string; // Reference to the original product ID
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string; // ISO date string
  shippingAddress?: any; // Placeholder for address object
  // Add fields for payment details if needed
}

export interface Rating {
  productId: string;
  userId: string;
  orderId: string; // Link rating to a specific purchase
  rating: number; // 1-5
  review?: string; // Optional text review
  createdAt: string; // ISO date string
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
  orderId: string; 
  customerName: string; 
  items: SaleNotificationItem[];
  totalAmount: number;
  date: string; // ISO date string
  read: boolean;
}
