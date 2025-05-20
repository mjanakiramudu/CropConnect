import type { Product } from "./types";

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    description: "Organically grown, juicy red tomatoes, perfect for salads and cooking.",
    price: 2.50,
    currency: "USD",
    unit: "kg",
    quantity: 50,
    category: "Vegetables",
    location: "Green Valley Farms, CA",
    farmerId: "farmer1",
    farmerName: "John Doe",
    imageUrl: "https://placehold.co/600x400.png?text=Tomatoes",
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    id: "2",
    name: "Crisp Apples",
    description: "Sweet and crunchy apples, freshly picked from the orchard.",
    price: 3.00,
    currency: "USD",
    unit: "kg",
    quantity: 100,
    category: "Fruits",
    location: "Applewood Orchards, WA",
    farmerId: "farmer2",
    farmerName: "Jane Smith",
    imageUrl: "https://placehold.co/600x400.png?text=Apples",
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
  },
  {
    id: "3",
    name: "Organic Spinach",
    description: "Tender and nutritious organic spinach leaves.",
    price: 4.00,
    currency: "USD",
    unit: "bunch",
    quantity: 30,
    category: "Vegetables",
    location: "Green Valley Farms, CA",
    farmerId: "farmer1",
    farmerName: "John Doe",
    imageUrl: "https://placehold.co/600x400.png?text=Spinach",
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
  },
  {
    id: "4",
    name: "Brown Rice",
    description: "Healthy and wholesome brown rice, locally sourced.",
    price: 1.50,
    currency: "USD",
    unit: "kg",
    quantity: 200,
    category: "Grains",
    location: "Golden Fields, TX",
    farmerId: "farmer3",
    farmerName: "Robert Brown",
    imageUrl: "https://placehold.co/600x400.png?text=Brown+Rice",
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
];
