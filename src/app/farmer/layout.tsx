"use client";
import { ProductProvider } from "@/contexts/ProductContext";
import React from "react";

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add farmer-specific navigation or sidebar here if needed in the future
  return (
    <ProductProvider>
        {children}
    </ProductProvider>
  );
}
