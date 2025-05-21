
export type UserRole = "farmer" | "customer";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  // For simplicity, password is not stored/checked securely in this mock setup
  // In a real app, never store plain text passwords.
  location?: string; // Added for farmer's default location
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
  averageRating?: number; 
  totalRatings?: number; 
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
}

export interface Rating {
  productId: string;
  userId: string;
  orderId: string; 
  rating: number; // 1-5
  review?: string; 
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

// AI Feature Types
export interface WeatherAdvice {
  weatherSummary: string;
  farmingInstructions: string;
  monthlyOutlook: string;
}

export interface NewsItem {
  title: string;
  summary: string;
  source?: string;
  publishedDate?: string;
}

export interface PriceSuggestion {
  suggestedPriceRange: string;
  reasoning: string;
  confidence?: string; // e.g., High, Medium, Low
}

export interface SalesAnalysis {
  keyInsights: string[];
  actionableRecommendations: string[];
  demandForecast?: string; // Optional: e.g., "Demand for tomatoes is expected to rise in the next 2 weeks."
  seasonalTrends?: string; // Optional
}

// Input types for AI flows will be defined in their respective files using Zod.
// Output types for AI flows will also be defined with Zod and exported.
