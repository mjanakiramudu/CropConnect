"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { translate } = useLanguage();
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <Link href={`/customer/product/${product.id}`} className="block">
        <div className="relative w-full h-48">
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
      <CardContent className="flex-grow pb-3">
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
        <p className="text-xl font-bold text-primary">
          ${product.price.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ {product.unit}</span>
        </p>
        <p className="text-xs text-muted-foreground">{product.quantity} {product.unit} {translate('available', 'available')}</p>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 pt-0">
        <Button variant="outline" asChild>
          <Link href={`/customer/product/${product.id}`}>
            <Info className="mr-2 h-4 w-4" /> {translate('details', 'Details')}
          </Link>
        </Button>
        <Button disabled> {/* Add to cart functionality to be implemented later */}
          <ShoppingCart className="mr-2 h-4 w-4" /> {translate('addToCart', 'Add to Cart')}
        </Button>
      </CardFooter>
    </Card>
  );
}
