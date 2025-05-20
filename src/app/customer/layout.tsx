
"use client";
import { ProductProvider } from "@/contexts/ProductContext";
import { CartProvider } from "@/contexts/CartContext"; // Import CartProvider
import React from "react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProductProvider>
      <CartProvider> {/* Wrap with CartProvider */}
        {children}
      </CartProvider>
    </ProductProvider>
  );
}
