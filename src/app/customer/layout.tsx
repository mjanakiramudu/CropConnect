"use client";
import { ProductProvider } from "@/contexts/ProductContext";
import React from "react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add customer-specific navigation here if needed
  return (
    <ProductProvider>
      {children}
    </ProductProvider>
  );
}
