
"use client";
// Removed ProductProvider as it's now in RootLayout
import React from "react";

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add farmer-specific navigation or sidebar here if needed in the future
  return <>{children}</>;
}
