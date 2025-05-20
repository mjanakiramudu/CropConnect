
"use client";

import { useParams, useRouter } from "next/navigation";
import { useProducts } from "@/contexts/ProductContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, MapPin, UserCircle, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card"; // Removed CardHeader, CardTitle
import { useCart } from "@/contexts/CartContext";
import { AddToCartDialog } from "@/components/customer/AddToCartDialog";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getProductById, loading } = useProducts();
  const { translate } = useLanguage();
  const { addToCart } = useCart();
  const productId = params.id as string;
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);

  const product = getProductById(productId);

  if (loading) {
    return <div className="text-center py-10">{translate('loading', 'Loading...')}</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">{translate('productNotFound', 'Product not found')}</h1>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> {translate('goBack', 'Go Back')}
        </Button>
      </div>
    );
  }
  
  const handleAddToCart = (quantity: number) => {
    addToCart(product, quantity);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="outline" size="sm" asChild className="mb-6 print:hidden">
        <Link href="/customer/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> {translate('backToProducts', 'Back to Products')}
        </Link>
      </Button>

      <Card className="overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative w-full min-h-[300px] md:min-h-[400px] h-80 md:h-auto">
            <Image
              src={product.imageUrl || "https://placehold.co/600x400.png"}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              data-ai-hint={`${product.category} produce`}
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col">
            <Badge variant="secondary" className="w-fit mb-2">{product.category}</Badge>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
            
            <div className="space-y-1 text-sm text-muted-foreground mb-4">
              <p className="flex items-center"><UserCircle className="mr-2 h-4 w-4 text-primary" /> {translate('soldBy', 'Sold by:')} <span className="font-medium text-foreground ml-1">{product.farmerName}</span></p>
              <p className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" /> {translate('fromLocation', 'From:')} <span className="font-medium text-foreground ml-1">{product.location}</span></p>
            </div>

            <p className="text-muted-foreground mb-4 leading-relaxed flex-grow">{product.description}</p>

            <div className="mb-6">
              <p className="text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
                <span className="text-lg font-normal text-muted-foreground"> / {product.unit}</span>
              </p>
               <p className={`text-sm font-medium flex items-center mt-1 ${product.quantity > 0 ? 'text-green-600' : 'text-destructive'}`}>
                <Package className="mr-2 h-4 w-4" />
                 {product.quantity > 0 ? `${product.quantity} ${product.unit} ${translate('inStock', 'in stock')}` : translate('outOfStock', 'Out of Stock')}
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={() => setIsCartDialogOpen(true)} disabled={product.quantity <= 0}>
              <ShoppingCart className="mr-2 h-4 w-4" /> 
              {product.quantity <= 0 ? translate('outOfStock', 'Out of Stock') : translate('addToCart', 'Add to Cart')}
            </Button>
          </div>
        </div>
      </Card>
      {product && (
        <AddToCartDialog
            product={product}
            onAddToCart={handleAddToCart}
            open={isCartDialogOpen}
            onOpenChange={setIsCartDialogOpen}
        />
      )}

       {/* Placeholder for Related Products or Farmer's Other Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{translate('moreFromFarmer', `More from ${product.farmerName}`)}</h2>
        <p className="text-muted-foreground">{translate('relatedProductsComingSoon', 'Related products or other items from this farmer will be shown here.')}</p>
        {/* TODO: Fetch and display related products */}
      </div>
    </div>
  );
}
