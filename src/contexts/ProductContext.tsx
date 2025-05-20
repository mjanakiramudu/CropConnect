"use client";

import type { Product } from "@/lib/types";
import { mockProducts } from "@/lib/data";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface ProductContextType {
  products: Product[];
  farmerProducts: Product[];
  addProduct: (productData: Omit<Product, "id" | "farmerId" | "farmerName" | "dateAdded">) => void;
  updateProduct: (updatedProductData: Product) => void;
  getProductById: (id: string) => Product | undefined;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate fetching products
    // setProducts(mockProducts); // Initialize with mock data - will be overridden by localStorage if present
    
    // Attempt to load from localStorage
    const storedProducts = localStorage.getItem('farmLinkProducts');
    if (storedProducts) {
      try {
        setProducts(JSON.parse(storedProducts));
      } catch (error) {
        console.error("Failed to parse products from localStorage", error);
        setProducts(mockProducts); // Fallback to mock data if parsing fails
        localStorage.setItem('farmLinkProducts', JSON.stringify(mockProducts));
      }
    } else {
      setProducts(mockProducts); // Initialize with mock data if nothing in localStorage
      localStorage.setItem('farmLinkProducts', JSON.stringify(mockProducts)); // Store initial mock data
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    if (user && user.role === 'farmer') {
      setFarmerProducts(products.filter(p => p.farmerId === user.id));
    } else {
      setFarmerProducts([]);
    }
  }, [user, products]);

  const addProduct = (productData: Omit<Product, "id" | "farmerId" | "farmerName" | "dateAdded">) => {
    if (!user || user.role !== 'farmer') {
      console.error("Only authenticated farmers can add products.");
      // Potentially throw an error or show a toast to the user
      return;
    }
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      farmerId: user.id,
      farmerName: user.name || "Unknown Farmer", // Use user.name if available
      dateAdded: new Date().toISOString(),
      imageUrl: productData.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(productData.name)}`,
    };
    setProducts(prevProducts => {
      const updatedProducts = [newProduct, ...prevProducts];
      localStorage.setItem('farmLinkProducts', JSON.stringify(updatedProducts));
      return updatedProducts;
    });
  };

  const updateProduct = (updatedProductData: Product) => {
    if (!user || user.role !== 'farmer' || user.id !== updatedProductData.farmerId) {
      console.error("Unauthorized: User cannot update this product.");
      // Potentially throw an error or show a toast
      return;
    }
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(p =>
        p.id === updatedProductData.id ? { ...updatedProductData, dateAdded: p.dateAdded } : p // Retain original dateAdded
      );
      localStorage.setItem('farmLinkProducts', JSON.stringify(updatedProducts));
      return updatedProducts;
    });
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };


  return (
    <ProductContext.Provider value={{ products, farmerProducts, addProduct, updateProduct, getProductById, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
