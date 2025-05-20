"use client";

import { useParams, useRouter } from "next/navigation";
import { useProducts } from "@/contexts/ProductContext";
import { AddProductForm } from "@/components/farmer/AddProductForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getProductById, loading: productsLoading } = useProducts();
  const { translate } = useLanguage();
  const productId = params.id as string;

  const [productToEdit, setProductToEdit] = useState<Product | null | undefined>(undefined); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId && !productsLoading && user) {
      const product = getProductById(productId);
      if (product) {
        if (product.farmerId === user.id) { // Ensure farmer owns the product
          setProductToEdit(product);
        } else {
          setError(translate('unauthorizedEditError', "You are not authorized to edit this product."));
        }
      } else {
        setError(translate('productNotFoundForEdit', 'Product not found. It may have been deleted.'));
      }
      setIsLoading(false);
    } else if (!productsLoading && !user) {
        setError(translate('authRequiredForEdit', 'You must be logged in to edit products.'));
        setIsLoading(false);
    } else if (productsLoading) {
        setIsLoading(true); // Keep loading if products are still loading
    }
  }, [productId, getProductById, productsLoading, user, translate, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{translate('loadingProductDetails', 'Loading product details...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center py-10">
         <h1 className="text-3xl font-bold tracking-tight text-destructive">{translate('errorTitle', 'Error')}</h1>
        <p>{error}</p>
        <Button asChild className="mt-6">
          <Link href="/farmer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {translate('backToDashboard', 'Back to Dashboard')}
          </Link>
        </Button>
      </div>
    );
  }
  
  if (!productToEdit) {
     return (
      <div className="max-w-2xl mx-auto space-y-6 text-center py-10">
         <h1 className="text-3xl font-bold tracking-tight text-destructive">{translate('productNotFound', 'Product Not Found')}</h1>
        <p>{translate('productNotFoundDescEdit', 'The product you are trying to edit does not exist or could not be loaded.')}</p>
        <Button asChild className="mt-6">
           <Link href="/farmer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {translate('backToDashboard', 'Back to Dashboard')}
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/farmer/dashboard" >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {translate('backToDashboard', 'Back to Dashboard')}
        </Link>
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">{translate('editProductTitle', 'Edit Product')}: <span className="text-primary">{productToEdit.name}</span></h1>
      <AddProductForm productToEdit={productToEdit} onProductUpdated={() => router.push("/farmer/dashboard")} />
    </div>
  );
}
