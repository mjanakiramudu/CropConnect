
"use client";

import type { Product } from "@/lib/types";
import { mockProducts } from "@/lib/data";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProductContextType {
  products: Product[];
  farmerProducts: Product[];
  addProduct: (productData: Omit<Product, "id" | "farmerId" | "farmerName" | "dateAdded">) => void;
  updateProduct: (updatedProductData: Product) => void;
  getProductById: (id: string) => Product | undefined;
  updateProductQuantity: (productId: string, quantityChange: number) => boolean; // quantityChange can be negative
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = "farmLinkProducts";

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (storedProducts) {
      try {
        setProducts(JSON.parse(storedProducts));
      } catch (error) {
        console.error("Failed to parse products from localStorage", error);
        setProducts(mockProducts); 
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(mockProducts));
      }
    } else {
      setProducts(mockProducts); 
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(mockProducts)); 
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

  const persistProducts = (updatedProducts: Product[]) => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
  };

  const addProduct = (productData: Omit<Product, "id" | "farmerId" | "farmerName" | "dateAdded">) => {
    if (!user || user.role !== 'farmer') {
      toast({title: "Unauthorized", description: "Only farmers can add products.", variant: "destructive"});
      return;
    }
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      farmerId: user.id,
      farmerName: user.name || "Unknown Farmer",
      dateAdded: new Date().toISOString(),
      imageUrl: productData.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(productData.name)}`,
    };
    setProducts(prevProducts => {
      const updated = [newProduct, ...prevProducts];
      persistProducts(updated);
      return updated;
    });
  };

  const updateProduct = (updatedProductData: Product) => {
    if (!user || user.role !== 'farmer' || user.id !== updatedProductData.farmerId) {
      toast({title: "Unauthorized", description: "You cannot update this product.", variant: "destructive"});
      return;
    }
    setProducts(prevProducts => {
      const updated = prevProducts.map(p =>
        p.id === updatedProductData.id ? { ...updatedProductData, dateAdded: p.dateAdded } : p
      );
      persistProducts(updated);
      return updated;
    });
  };

  const updateProductQuantity = (productId: string, quantityChange: number): boolean => {
    let success = false;
    setProducts(prevProducts => {
      const productIndex = prevProducts.findIndex(p => p.id === productId);
      if (productIndex === -1) {
        toast({ title: "Error", description: "Product not found for quantity update.", variant: "destructive" });
        success = false;
        return prevProducts;
      }
      
      const productToUpdate = prevProducts[productIndex];
      const newQuantity = productToUpdate.quantity + quantityChange; // quantityChange is negative for decrease

      if (newQuantity < 0) {
        toast({ title: "Error", description: "Cannot reduce quantity below zero.", variant: "destructive" });
        success = false;
        return prevProducts;
      }

      const updatedProduct = { ...productToUpdate, quantity: newQuantity };
      const updatedProducts = [...prevProducts];
      updatedProducts[productIndex] = updatedProduct;
      
      persistProducts(updatedProducts);
      success = true;
      return updatedProducts;
    });
    return success;
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };


  return (
    <ProductContext.Provider value={{ products, farmerProducts, addProduct, updateProduct, getProductById, updateProductQuantity, loading }}>
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
