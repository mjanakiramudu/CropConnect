
"use client";
// Removed ProductProvider and CartProvider as they are now in RootLayout
import React from "react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
