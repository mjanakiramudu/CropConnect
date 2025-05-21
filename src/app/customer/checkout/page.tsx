
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { SaleNotification, SaleNotificationItem, Order, OrderItem, CartItem } from "@/lib/types"; // Added Order, OrderItem
import { useState } from "react";

const CUSTOMER_ORDERS_STORAGE_KEY_PREFIX = "farmLinkCustomerOrders_";

export default function CheckoutPage() {
  const { translate } = useLanguage();
  const { cart, getCartTotal, clearCart, loadingCart } = useCart();
  const { updateProductQuantity } = useProducts();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const subtotal = getCartTotal();
  const taxes = subtotal * 0.05; // Example tax
  const total = subtotal + taxes;

  const safeToast = (options: Parameters<typeof toast>[0]) => {
    setTimeout(() => toast(options), 0);
  };

  const saveOrderForCustomer = (userId: string, order: Order) => {
    const storageKey = `${CUSTOMER_ORDERS_STORAGE_KEY_PREFIX}${userId}`;
    const existingOrdersString = localStorage.getItem(storageKey);
    let existingOrders: Order[] = [];
    if (existingOrdersString) {
      try {
        existingOrders = JSON.parse(existingOrdersString);
      } catch (e) {
        console.error("Error parsing existing orders", e);
      }
    }
    existingOrders.unshift(order); // Add new order to the beginning
    localStorage.setItem(storageKey, JSON.stringify(existingOrders));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      safeToast({ title: "Authentication Error", description: "Please login to place an order.", variant: "destructive" });
      return;
    }
    if (cart.length === 0) {
      safeToast({ title: "Empty Cart", description: "Your cart is empty.", variant: "destructive" });
      return;
    }
    setIsProcessingOrder(true);

    // 1. Update product quantities
    let allQuantitiesUpdated = true;
    for (const item of cart) {
      const success = updateProductQuantity(item.id, -item.cartQuantity); // Decrease quantity
      if (!success) {
        allQuantitiesUpdated = false;
        safeToast({
          title: "Order Error",
          description: `Could not update stock for ${item.name}. Order cancelled. Please try again.`,
          variant: "destructive",
        });
        break; 
      }
    }

    if (!allQuantitiesUpdated) {
      setIsProcessingOrder(false);
      return;
    }
    
    const orderId = `order-${Date.now()}`;

    // 2. Create Order object
    const orderItems: OrderItem[] = cart.map((cartItem: CartItem) => ({
      productId: cartItem.id, // Keep original product ID
      name: cartItem.name,
      description: cartItem.description,
      pricePerUnit: cartItem.price, 
      currency: cartItem.currency,
      unit: cartItem.unit,
      category: cartItem.category,
      location: cartItem.location,
      farmerId: cartItem.farmerId,
      farmerName: cartItem.farmerName,
      imageUrl: cartItem.imageUrl,
      dateAdded: cartItem.dateAdded,
      orderedQuantity: cartItem.cartQuantity,
    }));

    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      items: orderItems,
      totalAmount: total,
      status: "Delivered", // Mock: Mark as delivered immediately for rating purposes
      createdAt: new Date().toISOString(),
      // shippingAddress: { fullName: "Mock Name", address: "Mock Address", ... } // Capture from form
    };
    saveOrderForCustomer(user.id, newOrder);


    // 3. Simulate farmer notification
    const notificationsByFarmer: Record<string, SaleNotification> = {};
    cart.forEach(item => {
      if (!notificationsByFarmer[item.farmerId]) {
        notificationsByFarmer[item.farmerId] = {
          id: `notif-${Date.now()}-${item.farmerId}`,
          orderId: orderId, 
          customerName: user.name || "A Customer",
          items: [],
          totalAmount: 0, 
          date: new Date().toISOString(),
          read: false,
        };
      }
      notificationsByFarmer[item.farmerId].items.push({
        productName: item.name,
        quantity: item.cartQuantity,
        pricePerUnit: item.price,
      });
      notificationsByFarmer[item.farmerId].totalAmount += item.price * item.cartQuantity;
    });

    for (const farmerId in notificationsByFarmer) {
        const farmerNotificationStoreKey = `farmLinkFarmerNotifications_${farmerId}`;
        const existingNotificationsString = localStorage.getItem(farmerNotificationStoreKey);
        let existingNotifications: SaleNotification[] = [];
        if (existingNotificationsString) {
            try {
                existingNotifications = JSON.parse(existingNotificationsString);
            } catch (e) { console.error("Error parsing farmer notifications", e); }
        }
        existingNotifications.unshift(notificationsByFarmer[farmerId]); 
        localStorage.setItem(farmerNotificationStoreKey, JSON.stringify(existingNotifications));
    }

    // 4. Clear cart
    clearCart();

    // 5. Show success & redirect
    safeToast({
      title: translate('orderPlacedSuccessTitle', "Order Placed!"),
      description: translate('orderPlacedSuccessDesc', "Thank you for your purchase. Your items will be on their way soon."),
    });
    setIsProcessingOrder(false);
    router.push("/customer/orders"); 
  };

  if (loadingCart) {
    return <div className="text-center py-10">{translate('loading', 'Loading...')}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/customer/cart">
          <ArrowLeft className="mr-2 h-4 w-4" /> {translate('backToCart', 'Back to Cart')}
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Lock className="mr-3 h-6 w-6 text-primary" />
            {translate('secureCheckout', 'Secure Checkout')}
          </CardTitle>
          <CardDescription>{translate('completePurchase', 'Complete your purchase by providing shipping and payment details.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {cart.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{translate('orderSummary', 'Order Summary')}</h3>
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="text-sm">{item.name} (x{item.cartQuantity})</span>
                  <span className="text-sm font-medium">${(item.price * item.cartQuantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 mt-2 font-semibold border-t">
                <span>{translate('subtotal', 'Subtotal')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm text-muted-foreground">
                <span>{translate('taxes', 'Taxes (5%)')}</span>
                <span>${taxes.toFixed(2)}</span>
              </div>
               <div className="flex justify-between items-center pt-2 mt-2 font-bold text-lg border-t">
                <span>{translate('total', 'Total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold mb-3">{translate('shippingAddress', 'Shipping Address')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">{translate('fullName', 'Full Name')}</Label>
                <Input id="fullName" placeholder={translate('namePlaceholder', "Your Name")} defaultValue={user?.name || ""} />
              </div>
              <div>
                <Label htmlFor="address">{translate('streetAddress', 'Street Address')}</Label>
                <Input id="address" placeholder={translate('addressPlaceholder', "123 Farm Lane")} />
              </div>
              <div>
                <Label htmlFor="city">{translate('city', 'City')}</Label>
                <Input id="city" placeholder={translate('cityPlaceholder', "Your City")} />
              </div>
              <div>
                <Label htmlFor="zipCode">{translate('zipCode', 'ZIP Code')}</Label>
                <Input id="zipCode" placeholder={translate('zipPlaceholder', "12345")} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">{translate('paymentDetails', 'Payment Details')}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">{translate('cardNumber', 'Card Number')}</Label>
                <Input id="cardNumber" placeholder="•••• •••• •••• ••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">{translate('expiryDate', 'Expiry Date')}</Label>
                  <Input id="expiryDate" placeholder="MM/YY" />
                </div>
                <div>
                  <Label htmlFor="cvc">{translate('cvc', 'CVC')}</Label>
                  <Input id="cvc" placeholder="•••" />
                </div>
              </div>
            </div>
             <p className="text-xs text-muted-foreground mt-2">{translate('paymentGatewayNote', 'This is a mock payment form. No real transaction will occur.')}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={cart.length === 0 || loadingCart || isProcessingOrder}>
            {isProcessingOrder ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" /> }
            {isProcessingOrder ? translate('processingOrder', 'Processing Order...') : translate('placeOrder', `Place Order (${total.toFixed(2)})`)}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
