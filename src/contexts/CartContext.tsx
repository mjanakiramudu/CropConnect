
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import type { Product, CartItem } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  loadingCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CARTS_STORAGE_KEY = "farmLinkCarts";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const { toast } = useToast();

  const safeToast = (options: Parameters<typeof toast>[0]) => {
    setTimeout(() => toast(options), 0);
  };

  const loadCartForUser = useCallback((userId: string | null) => {
    setLoadingCart(true);
    if (userId) {
      const allCartsString = localStorage.getItem(CARTS_STORAGE_KEY);
      if (allCartsString) {
        try {
          const allCarts = JSON.parse(allCartsString);
          setCart(allCarts[userId] || []);
        } catch (e) {
          console.error("Failed to parse carts from localStorage", e);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } else {
      setCart([]); // No user, empty cart
    }
    setLoadingCart(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartForUser(user.id);
    } else {
      loadCartForUser(null); // Clear cart if user logs out or is not authenticated
    }
  }, [user, isAuthenticated, loadCartForUser]);

  const saveCartForUser = (userId: string, updatedCart: CartItem[]) => {
    const allCartsString = localStorage.getItem(CARTS_STORAGE_KEY);
    let allCarts = {};
    if (allCartsString) {
      try {
        allCarts = JSON.parse(allCartsString);
      } catch (e) {
        console.error("Failed to parse carts for saving", e);
        // Potentially reset all carts if corrupt, or handle error appropriately
      }
    }
    localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify({ ...allCarts, [userId]: updatedCart }));
  };

  const addToCart = (product: Product, quantity: number) => {
    if (!user) {
      safeToast({ title: "Please login", description: "You need to be logged in to add items to your cart.", variant: "destructive" });
      return;
    }
    if (quantity <= 0) {
        safeToast({ title: "Invalid Quantity", description: "Quantity must be greater than zero.", variant: "destructive" });
        return;
    }
    if (quantity > product.quantity) {
        safeToast({ title: "Not Enough Stock", description: `Only ${product.quantity} ${product.unit} available.`, variant: "destructive" });
        return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      let newCart;
      if (existingItemIndex > -1) {
        newCart = prevCart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, cartQuantity: Math.min(item.cartQuantity + quantity, product.quantity) } // Ensure not exceeding available stock
            : item
        );
        safeToast({ title: "Cart Updated", description: `${product.name} quantity increased.` });
      } else {
        newCart = [...prevCart, { ...product, cartQuantity: quantity }];
        safeToast({ title: "Item Added", description: `${quantity} ${product.unit} of ${product.name} added to cart.` });
      }
      saveCartForUser(user.id, newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    if (!user) return;
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      saveCartForUser(user.id, newCart);
      safeToast({ title: "Item Removed", description: "Product removed from your cart." });
      return newCart;
    });
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (!user) return;
     const productInCart = cart.find(item => item.id === productId);
    if (!productInCart) return;

    if (newQuantity <= 0) {
      removeFromCart(productId); // This already has a toast
      return;
    }
    if (newQuantity > productInCart.quantity) { // Check against original product quantity (max available)
        safeToast({ title: "Not Enough Stock", description: `Only ${productInCart.quantity} ${productInCart.unit} available for ${productInCart.name}.`, variant: "destructive" });
        setCart(prevCart => { // Revert to max available if attempted to exceed
             const updatedCart = prevCart.map(item =>
                item.id === productId ? { ...item, cartQuantity: productInCart.quantity } : item
            );
            saveCartForUser(user.id, updatedCart);
            return updatedCart;
        });
        return;
    }

    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === productId ? { ...item, cartQuantity: newQuantity } : item
      );
      saveCartForUser(user.id, newCart);
      safeToast({ title: "Cart Updated", description: `Quantity updated for ${productInCart.name}.` });
      return newCart;
    });
  };

  const clearCart = () => {
    if (!user) return;
    setCart([]);
    saveCartForUser(user.id, []);
    // Optionally add a toast here if desired:
    // safeToast({ title: "Cart Cleared", description: "Your shopping cart has been emptied." });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.cartQuantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal, loadingCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

