"use client";

import { useState, useEffect, useMemo } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { ProductCard } from "@/components/customer/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, FilterX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@/lib/types";

export default function CustomerDashboardPage() {
  const { products, loading } = useProducts();
  const { translate } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dateAdded_desc");

  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category));
    return ["all", ...Array.from(uniqueCategories)];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let P = [...products];

    // Filter by search term
    if (searchTerm) {
      P = P.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      P = P.filter(product => product.category === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case "price_asc":
        P.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        P.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        P.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        P.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "dateAdded_desc":
      default:
        P.sort((a,b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
    }
    return P;
  }, [products, searchTerm, selectedCategory, sortBy]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{translate('loadingProducts', 'Loading products...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{translate('browseProducts', 'Browse Fresh Produce')}</h1>
        <p className="text-muted-foreground">
          {translate('discoverProductsFromFarmers', 'Discover a variety of products directly from local farmers.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg shadow-sm bg-card">
        <div className="md:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={translate('searchProductsPlaceholder', 'Search products, categories, farmers...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
        <div className="md:col-span-1">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={translate('filterByCategory', 'Filter by Category')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? translate('allCategories', 'All Categories') : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-1">
           <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={translate('sortBy', 'Sort by')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateAdded_desc">{translate('sortByDateNewest', 'Date (Newest)')}</SelectItem>
              <SelectItem value="price_asc">{translate('sortByPriceAsc', 'Price (Low to High)')}</SelectItem>
              <SelectItem value="price_desc">{translate('sortByPriceDesc', 'Price (High to Low)')}</SelectItem>
              <SelectItem value="name_asc">{translate('sortByNameAsc', 'Name (A-Z)')}</SelectItem>
              <SelectItem value="name_desc">{translate('sortByNameDesc', 'Name (Z-A)')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-10">
          <FilterX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">{translate('noProductsMatch', 'No products match your current filters.')}</p>
          <p className="text-sm text-muted-foreground">{translate('tryAdjustingFilters', 'Try adjusting your search or filters.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
