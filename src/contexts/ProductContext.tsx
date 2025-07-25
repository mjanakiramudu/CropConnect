
"use client";

import type { Product, Rating } from "@/lib/types";
import { mockProducts } from "@/lib/data";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProductContextType {
  products: Product[];
  farmerProducts: Product[];
  addProduct: (productData: Omit<Product, "id" | "farmerId" | "farmerName" | "dateAdded" | "averageRating" | "totalRatings">) => void;
  updateProduct: (updatedProductData: Product) => void;
  getProductById: (id: string) => Product | undefined;
  updateProductQuantity: (productId: string, quantityChange: number) => boolean; 
  updateProductRating: (productId: string) => void; 
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = "cropConnectProducts"; 
const RATINGS_STORAGE_KEY = "cropConnectRatings"; 


export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const safeToast = (options: Parameters<typeof toast>[0]) => {
    setTimeout(() => toast(options), 0);
  };

  const calculateAverageRatings = useCallback((allProducts: Product[], allRatingsData: Record<string, Rating[]>): Product[] => {
    return allProducts.map(product => {
      const productRatings = allRatingsData[product.id] || [];
      if (productRatings.length === 0) {
        return { ...product, averageRating: 0, totalRatings: 0 };
      }
      const sum = productRatings.reduce((acc, r) => acc + r.rating, 0);
      return {
        ...product,
        averageRating: parseFloat((sum / productRatings.length).toFixed(1)),
        totalRatings: productRatings.length,
      };
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const storedProductsString = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    let initialProducts = mockProducts.map(p => ({...p, averageRating: 0, totalRatings: 0})); 
    if (storedProductsString) {
      try {
        const parsedProducts = JSON.parse(storedProductsString) as Product[];
        initialProducts = parsedProducts.map(p => ({
            ...p, 
            averageRating: p.averageRating || 0, 
            totalRatings: p.totalRatings || 0
        }));

      } catch (error) {
        console.error("Failed to parse products from localStorage", error);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
      }
    } else {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
    }

    const storedRatingsString = localStorage.getItem(RATINGS_STORAGE_KEY);
    let allRatings: Record<string, Rating[]> = {};
    if (storedRatingsString) {
        try {
            allRatings = JSON.parse(storedRatingsString);
        } catch (e) { console.error("Failed to parse ratings", e); }
    }
    
    const productsWithRatings = calculateAverageRatings(initialProducts, allRatings);
    setProducts(productsWithRatings);
    setLoading(false);
  }, [calculateAverageRatings]);
  
  useEffect(() => {
    if (user && user.role === 'farmer') {
      setFarmerProducts(products.filter(p => p.farmerId === user.id));
    } else {
      setFarmerProducts([]);
    }
  }, [user, products]);

  const persistProducts = (updatedProducts: Product[]) => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
  };

  const addProduct = (productData: Omit<Product, "id" | "farmerId" | "farmerName" | "dateAdded" | "averageRating" | "totalRatings">) => {
    if (!user || user.role !== 'farmer') {
      safeToast({title: "Unauthorized", description: "Only farmers can add products.", variant: "destructive"});
      return;
    }
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      farmerId: user.id,
      farmerName: user.name || "Unknown Farmer",
      dateAdded: new Date().toISOString(),
      imageUrl: productData.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(productData.name)}`,
      averageRating: 0,
      totalRatings: 0,
    };
    setProducts(prevProducts => {
      const updated = [newProduct, ...prevProducts];
      persistProducts(updated);
      return updated;
    });
  };

  const updateProduct = (updatedProductData: Product) => {
    if (!user || user.role !== 'farmer' || user.id !== updatedProductData.farmerId) {
      safeToast({title: "Unauthorized", description: "You cannot update this product.", variant: "destructive"});
      return;
    }
    setProducts(prevProducts => {
      const updated = prevProducts.map(p =>
        p.id === updatedProductData.id ? { 
            ...updatedProductData, 
            dateAdded: p.dateAdded, 
            averageRating: p.averageRating, 
            totalRatings: p.totalRatings,
        } : p
      );
      persistProducts(updated);
      return updated;
    });
  };

  const updateProductQuantity = (productId: string, quantityChange: number): boolean => {
    const productToUpdate = products.find(p => p.id === productId);

    if (!productToUpdate) {
        safeToast({ title: "Product Error", description: "Product not found for quantity update.", variant: "destructive" });
        return false;
    }

    const newQuantity = productToUpdate.quantity + quantityChange; // quantityChange is negative for deduction

    if (newQuantity < 0) {
        safeToast({
            title: "Stock Issue",
            description: `Not enough stock for ${productToUpdate.name}. Requested deduction makes stock negative. Available: ${productToUpdate.quantity}, Change: ${quantityChange}.`,
            variant: "destructive"
        });
        return false;
    }

    // If checks pass, then update the state
    setProducts(prevProducts => {
        const updatedProductsList = prevProducts.map(p =>
            p.id === productId ? { ...p, quantity: newQuantity } : p
        );
        persistProducts(updatedProductsList);
        return updatedProductsList;
    });
    return true;
  };


  const updateProductRating = useCallback((productId: string) => {
    const storedRatingsString = localStorage.getItem(RATINGS_STORAGE_KEY);
    let allRatings: Record<string, Rating[]> = {};
    if (storedRatingsString) {
        try {
            allRatings = JSON.parse(storedRatingsString);
        } catch (e) { console.error("Failed to parse ratings for update", e); return; }
    }

    setProducts(prevProducts => {
        const productsWithNewRatings = calculateAverageRatings(prevProducts, allRatings);
        persistProducts(productsWithNewRatings);
        return productsWithNewRatings;
    });
  }, [calculateAverageRatings]);


  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };


  return (
    <ProductContext.Provider value={{ products, farmerProducts, addProduct, updateProduct, getProductById, updateProductQuantity, updateProductRating, loading }}>
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
