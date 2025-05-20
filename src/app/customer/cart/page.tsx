
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShoppingCart, CreditCard, Trash2, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image"; // Use Next Image
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { translate } = useLanguage();
  const { cart, removeFromCart, updateCartItemQuantity, getCartTotal, loadingCart } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = (productId: string, currentCartQuantity: number, productStock: number, change: number) => {
    const newQuantity = currentCartQuantity + change;
    if (newQuantity < 1) {
      // Optionally confirm removal or just do nothing/set to 1
      // For now, let's ensure it doesn't go below 1 via this button. Removal is separate.
      updateCartItemQuantity(productId, 1);
      return;
    }
    if (newQuantity > productStock) {
      toast({
        title: translate('notEnoughStockTitle', "Not Enough Stock"),
        description: translate('notEnoughStockDesc', `Maximum available quantity is ${productStock}.`),
        variant: "destructive",
      });
      updateCartItemQuantity(productId, productStock); // Set to max available
      return;
    }
    updateCartItemQuantity(productId, newQuantity);
  };
  
  const handleDirectQuantityInput = (productId: string, productStock: number, inputValue: string) => {
    const newQuantity = parseInt(inputValue, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      updateCartItemQuantity(productId, 1); // Default to 1 if invalid input
      return;
    }
    if (newQuantity > productStock) {
      toast({
        title: translate('notEnoughStockTitle', "Not Enough Stock"),
        description: translate('notEnoughStockDesc', `Maximum available quantity is ${productStock}.`),
        variant: "destructive",
      });
      updateCartItemQuantity(productId, productStock);
      return;
    }
    updateCartItemQuantity(productId, newQuantity);
  };


  const subtotal = getCartTotal();
  const taxes = subtotal * 0.05; // 5% tax (example)
  const total = subtotal + taxes;

  if (loadingCart) {
    return <div className="text-center py-10">{translate('loadingCart', 'Loading your cart...')}</div>;
  }

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
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{translate('cartEmpty', 'Your cart is empty.')}</p>
          ) : (
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-4">
                  <div className="relative w-24 h-24 sm:w-20 sm:h-20 rounded-md overflow-hidden shrink-0">
                    <Image 
                        src={item.imageUrl || "https://placehold.co/100x100.png"} 
                        alt={item.name} 
                        layout="fill" 
                        objectFit="cover"
                        data-ai-hint={`${item.category} produce`}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{translate('soldBy', 'Sold by:')} {item.farmerName}</p>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} / {item.unit}</p>
                    <p className="text-xs text-muted-foreground">{translate('stockAvailable', 'Stock:')} {item.quantity} {item.unit}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 shrink-0">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.cartQuantity, item.quantity, -1)} disabled={item.cartQuantity <= 1}>
                            <Minus className="h-3 w-3"/>
                        </Button>
                        <Input 
                            type="number" 
                            value={item.cartQuantity} 
                            onChange={(e) => handleDirectQuantityInput(item.id, item.quantity, e.target.value)}
                            className="w-16 h-8 text-center"
                            min="1"
                            max={item.quantity}
                        />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.cartQuantity, item.quantity, 1)} disabled={item.cartQuantity >= item.quantity}>
                            <Plus className="h-3 w-3"/>
                        </Button>
                    </div>
                    <p className="font-semibold text-lg">${(item.price * item.cartQuantity).toFixed(2)}</p>
                    <Button variant="link" size="sm" className="text-destructive p-0 h-auto hover:underline" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="mr-1 h-4 w-4"/>{translate('remove', 'Remove')}
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>{translate('subtotal', 'Subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{translate('taxes', 'Taxes (5%)')}</span> {/* Example tax */}
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
        {cart.length > 0 && (
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
