"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListOrdered, BarChart2, DollarSign, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const { farmerProducts } = useProducts();
  const { translate } = useLanguage();

  const totalProducts = farmerProducts.length;
  const totalQuantity = farmerProducts.reduce((sum, p) => sum + p.quantity, 0);
  // Mock sales data
  const totalRevenue = farmerProducts.reduce((sum, p) => sum + (p.price * (p.quantity / 2)), 0); // Assuming half sold

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{translate('farmerDashboard', 'Farmer Dashboard')}</h1>
          <p className="text-muted-foreground">
            {translate('welcomeBackFarmer', `Welcome back, ${user?.name || 'Farmer'}! Manage your products and sales.`)}
          </p>
        </div>
        <Button asChild>
          <Link href="/farmer/dashboard/add-product">
            <PlusCircle className="mr-2 h-4 w-4" /> {translate('addProduct', 'Add New Product')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translate('totalProducts', 'Total Products')}</CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">{translate('currentlyListed', 'currently listed')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translate('totalInventory', 'Total Inventory')}</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity} {translate('units', 'units')}</div>
            <p className="text-xs text-muted-foreground">{translate('acrossAllProducts', 'across all products')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translate('estimatedRevenue', 'Estimated Revenue (Mock)')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{translate('basedOnMockSales', 'based on mock sales data')}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">{translate('myProducts', 'My Products')}</h2>
        {farmerProducts.length === 0 ? (
          <p className="text-muted-foreground">{translate('noProductsUploaded', 'You have not uploaded any products yet.')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmerProducts.map(product => (
              <Card key={product.id} className="overflow-hidden flex flex-col">
                 <div className="relative h-48 w-full">
                    <Image 
                        src={product.imageUrl || "https://placehold.co/600x400.png"} 
                        alt={product.name} 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={`${product.category} produce`}
                    />
                 </div>
                <CardHeader className="pb-2">
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 flex-grow">
                  <p><span className="font-semibold">{translate('price', 'Price')}:</span> ${product.price.toFixed(2)} / {product.unit}</p>
                  <p><span className="font-semibold">{translate('quantity', 'Quantity')}:</span> {product.quantity} {product.unit}</p>
                  <p><span className="font-semibold">{translate('location', 'Location')}:</span> {product.location}</p>
                </CardContent>
                <CardFooter className="pt-4 mt-auto">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/farmer/dashboard/edit-product/${product.id}`}>
                      <Edit className="mr-2 h-4 w-4" /> {translate('editProductButton', 'Edit Product')}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
