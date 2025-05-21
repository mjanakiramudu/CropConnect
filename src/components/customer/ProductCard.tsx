
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Info, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { AddToCartDialog } from "./AddToCartDialog";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { translate } = useLanguage();
  const { addToCart } = useCart();
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);

  const handleAddToCart = (quantity: number) => {
    addToCart(product, quantity);
  };

  const renderStars = (rating?: number) => {
    const numRating = rating || 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= numRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      );
    }
    return stars;
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
        <Link href={`/customer/product/${product.id}`} className="block group">
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={product.imageUrl || "https://placehold.co/600x400.png"}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              data-ai-hint={`${product.category} produce`}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground pt-1">
            {translate('byFarmer', 'By:')} {product.farmerName} | {translate('fromLocation', 'From:')} {product.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pb-3 space-y-2">
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-1">
            {renderStars(product.averageRating)}
            {product.totalRatings !== undefined && product.totalRatings > 0 && (
              <span className="text-xs text-muted-foreground">({product.averageRating?.toFixed(1)} / {product.totalRatings} {translate('ratings', 'ratings')})</span>
            )}
            {(product.totalRatings === undefined || product.totalRatings === 0) && <span className="text-xs text-muted-foreground">{translate('noRatingsYet', 'No ratings yet')}</span> }
          </div>
          <p className="text-xl font-bold text-primary">
            ${product.price.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ {product.unit}</span>
          </p>
          <p className="text-xs text-muted-foreground">{product.quantity > 0 ? `${product.quantity} ${product.unit} ${translate('available', 'available')}` : <span className="text-destructive">{translate('outOfStock', 'Out of Stock')}</span>}</p>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2 pt-0 mt-auto">
          <Button variant="outline" asChild>
            <Link href={`/customer/product/${product.id}`}>
              <Info className="mr-2 h-4 w-4" /> {translate('details', 'Details')}
            </Link>
          </Button>
          <Button onClick={() => setIsCartDialogOpen(true)} disabled={product.quantity <= 0}>
            <ShoppingCart className="mr-2 h-4 w-4" /> 
            {product.quantity <= 0 ? translate('outOfStock', 'Out of Stock') : translate('addToCart', 'Add to Cart')}
          </Button>
        </CardFooter>
      </Card>
      {product && (
        <AddToCartDialog
          product={product}
          onAddToCart={handleAddToCart}
          open={isCartDialogOpen}
          onOpenChange={setIsCartDialogOpen}
        />
      )}
    </>
  );
}
