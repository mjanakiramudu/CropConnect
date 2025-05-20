"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, CreditCard } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

// Mock cart data
const mockCartItems = [
  { id: "1", name: "Fresh Tomatoes", price: 2.50, quantity: 2, unit: "kg", imageUrl: "https://placehold.co/100x100.png?text=Tomatoes", farmerName: "John Doe" },
  { id: "2", name: "Crisp Apples", price: 3.00, quantity: 1, unit: "kg", imageUrl: "https://placehold.co/100x100.png?text=Apples", farmerName: "Jane Smith" },
];
const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const taxes = subtotal * 0.05; // 5% tax
const total = subtotal + taxes;

export default function CartPage() {
  const { translate } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
       <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/customer/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> {translate('continueShopping', 'Continue Shopping')}
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <ShoppingCart className="mr-3 h-6 w-6 text-primary" />
            {translate('yourCart', 'Your Shopping Cart')}
          </CardTitle>
          <CardDescription>{translate('reviewItemsCheckout', 'Review your items and proceed to checkout.')}</CardDescription>
        </CardHeader>
        <CardContent>
          {mockCartItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{translate('cartEmpty', 'Your cart is empty.')}</p>
          ) : (
            <div className="space-y-6">
              {mockCartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                  <img src={item.imageUrl} alt={item.name} data-ai-hint="produce" className="w-20 h-20 rounded-md object-cover"/>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{translate('soldBy', 'Sold by:')} {item.farmerName}</p>
                    <p className="text-sm text-muted-foreground">{translate('quantity', 'Quantity:')} {item.quantity} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button variant="link" size="sm" className="text-destructive p-0 h-auto">{translate('remove', 'Remove')}</Button>
                  </div>
                </div>
              ))}
              
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>{translate('subtotal', 'Subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{translate('taxes', 'Taxes (5%)')}</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>{translate('total', 'Total')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        {mockCartItems.length > 0 && (
          <CardFooter>
            <Button size="lg" className="w-full" asChild>
              <Link href="/customer/checkout">
                <CreditCard className="mr-2 h-5 w-5" /> {translate('proceedToCheckout', 'Proceed to Checkout')}
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
