
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddToCartDialogProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToCartDialog({ product, onAddToCart, open, onOpenChange }: AddToCartDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const { translate } = useLanguage();
  const { toast } = useToast();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > product.quantity) {
      setQuantity(product.quantity);
       toast({
        title: translate('notEnoughStockTitle', "Not Enough Stock"),
        description: translate('notEnoughStockDesc', `Maximum available quantity for ${product.name} is ${product.quantity} ${product.unit}.`),
        variant: "destructive",
      });
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleConfirm = () => {
    if (quantity > 0) {
      onAddToCart(quantity);
      onOpenChange(false); // Close dialog
      setQuantity(1); // Reset quantity for next time
    } else {
         toast({
            title: translate('invalidQuantityTitle', "Invalid Quantity"),
            description: translate('invalidQuantityDesc', `Please enter a quantity greater than 0.`),
            variant: "destructive",
        });
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) setQuantity(1); // Reset quantity if dialog is closed
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{translate('addToCartTitle', 'Add to Cart')}: {product.name}</DialogTitle>
          <DialogDescription>
            {translate('selectQuantityFor', 'Select quantity for')} {product.name}. 
            ({translate('available', 'Available')}: {product.quantity} {product.unit})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
              className="w-20 text-center"
              min="1"
              max={product.quantity}
            />
            <Button variant="outline" size="icon" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= product.quantity}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
           <p className="text-center text-lg font-semibold">
                {translate('totalPrice', 'Total Price')}: ${(product.price * quantity).toFixed(2)}
            </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{translate('cancel', 'Cancel')}</Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={quantity < 1 || quantity > product.quantity}>
            <ShoppingCart className="mr-2 h-4 w-4" /> {translate('confirmAddToCart', 'Confirm & Add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
