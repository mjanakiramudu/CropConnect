
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListOrdered, BarChart2, DollarSign, Edit, Bell, Eye, EyeOff, CloudSun, Newspaper, SearchCode, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { SaleNotification } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { WeatherAdvisor } from "@/components/farmer/WeatherAdvisor";
import { FarmingNews } from "@/components/farmer/FarmingNews";
import { PricePredictor } from "@/components/farmer/PricePredictor";

const FARMER_NOTIFICATIONS_STORAGE_KEY_PREFIX = "cropConnectFarmerNotifications_"; // Updated key

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const { farmerProducts } = useProducts();
  const { translate } = useLanguage();
  const [notifications, setNotifications] = useState<SaleNotification[]>([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    if (user && user.role === 'farmer') {
      const farmerNotificationStoreKey = `${FARMER_NOTIFICATIONS_STORAGE_KEY_PREFIX}${user.id}`;
      const storedNotificationsString = localStorage.getItem(farmerNotificationStoreKey);
      if (storedNotificationsString) {
        try {
          const parsedNotifications: SaleNotification[] = JSON.parse(storedNotificationsString);
          setNotifications(parsedNotifications);
        } catch (e) {
          console.error("Error parsing farmer notifications", e);
        }
      }
    }
  }, [user]);

  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    if (user) {
      localStorage.setItem(`${FARMER_NOTIFICATIONS_STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(updatedNotifications));
    }
  };
  
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
     if (user) {
      localStorage.setItem(`${FARMER_NOTIFICATIONS_STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(updatedNotifications));
    }
  };

  const totalProducts = farmerProducts.length;
  const totalInventoryQuantity = farmerProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalRevenue = notifications.filter(n => n.read).reduce((sum, n) => sum + n.totalAmount, 0); 
  const unreadNotificationCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = showAllNotifications ? notifications : notifications.slice(0, 3);


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{translate('farmerDashboard', 'Farmer Dashboard')}</h1>
          <p className="text-muted-foreground">
            {translate('welcomeBackFarmer', `Welcome back, ${user?.name || 'Farmer'}! Manage your products, sales, and gain insights.`)}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline">
                <Link href="/farmer/dashboard/analytics">
                    <TrendingUp className="mr-2 h-4 w-4" /> {translate('viewAnalytics', 'View Analytics')}
                </Link>
            </Button>
            <Button asChild>
            <Link href="/farmer/dashboard/add-product">
                <PlusCircle className="mr-2 h-4 w-4" /> {translate('addProduct', 'Add New Product')}
            </Link>
            </Button>
        </div>
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
            <div className="text-2xl font-bold">{totalInventoryQuantity} {translate('units', 'units')}</div>
            <p className="text-xs text-muted-foreground">{translate('acrossAllProducts', 'across all products')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translate('totalRevenueFromSales', 'Revenue (Sales Marked Read)')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{translate('basedOnSales', 'from sales marked as read')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherAdvisor />
        <PricePredictor />
      </div>
      
      <FarmingNews />


      {notifications.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <Bell className="mr-3 h-6 w-6 text-primary" />
              {translate('salesNotifications', 'Recent Sales Notifications')}
              {unreadNotificationCount > 0 && (
                <Badge variant="destructive" className="ml-2">{unreadNotificationCount} New</Badge>
              )}
            </h2>
            {unreadNotificationCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <EyeOff className="mr-2 h-4 w-4"/> {translate('markAllRead', 'Mark all as read')}
                </Button>
            )}
          </div>
          <div className="space-y-4">
            {displayedNotifications.map(notif => (
              <Card key={notif.id} className={`shadow-md ${!notif.read ? 'border-primary border-2' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {translate('saleTo', 'Sale to:')} {notif.customerName} - Order {notif.orderId.substring(0,10)}...
                    </CardTitle>
                    {!notif.read && (
                      <Button variant="ghost" size="sm" onClick={() => markNotificationAsRead(notif.id)}>
                        <Eye className="mr-2 h-4 w-4"/> {translate('markAsRead', 'Mark as Read')}
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    {translate('date', 'Date:')} {new Date(notif.date).toLocaleString()} | {translate('totalAmount', 'Total:')} <span className="font-semibold text-primary">${notif.totalAmount.toFixed(2)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-1">{translate('itemsPurchased', 'Items Purchased:')}</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {notif.items.map((item, index) => (
                      <li key={index}>{item.productName} (x{item.quantity}) - @ ${item.pricePerUnit.toFixed(2)}/{translate('unit', 'unit')}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
             {notifications.length > 3 && (
              <Button variant="link" onClick={() => setShowAllNotifications(!showAllNotifications)} className="w-full">
                {showAllNotifications ? translate('showLessNotifs', 'Show Less Notifications') : translate('showMoreNotifs', 'Show More Notifications')}
              </Button>
            )}
          </div>
        </div>
      )}


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
