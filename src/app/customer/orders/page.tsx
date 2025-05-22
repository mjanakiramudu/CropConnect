
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Order, OrderItem, Rating } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Star, PackageSearch, ShoppingBag, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/contexts/ProductContext";
import { Badge } from "@/components/ui/badge"; 

const CUSTOMER_ORDERS_STORAGE_KEY_PREFIX = "cropConnectCustomerOrders_"; // Updated key
const RATINGS_STORAGE_KEY = "cropConnectRatings"; // Updated key

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { translate } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [selectedOrderItemForRating, setSelectedOrderItemForRating] = useState<{orderId: string, item: OrderItem} | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentReview, setCurrentReview] = useState("");
  const [allRatings, setAllRatings] = useState<Record<string, Rating[]>>({});
  const { toast } = useToast();
  const { updateProductRating } = useProducts();


  const safeToast = (options: Parameters<typeof toast>[0]) => {
    setTimeout(() => toast(options), 0);
  };
  
  useEffect(() => {
    if (isAuthenticated && user) {
      setLoading(true);
      const storageKey = `${CUSTOMER_ORDERS_STORAGE_KEY_PREFIX}${user.id}`;
      const storedOrdersString = localStorage.getItem(storageKey);
      if (storedOrdersString) {
        try {
          setOrders(JSON.parse(storedOrdersString));
        } catch (e) {
          console.error("Failed to parse orders", e);
          setOrders([]);
        }
      } else {
        setOrders([]);
      }

      const storedRatingsString = localStorage.getItem(RATINGS_STORAGE_KEY);
        if (storedRatingsString) {
            try {
                setAllRatings(JSON.parse(storedRatingsString));
            } catch (e) { console.error("Failed to parse existing ratings", e); setAllRatings({});}
        } else {
            setAllRatings({});
        }

      setLoading(false);
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const handleOpenRatingDialog = (orderId: string, item: OrderItem) => {
    setSelectedOrderItemForRating({orderId, item});
    const productRatings = allRatings[item.productId] || [];
    const userRatingForThisOrder = productRatings.find(r => r.userId === user?.id && r.orderId === orderId);
    
    setCurrentRating(userRatingForThisOrder?.rating || 0);
    setCurrentReview(userRatingForThisOrder?.review || "");
    setIsRatingDialogOpen(true);
  };

  const handleStarClick = (rating: number) => {
    setCurrentRating(rating);
  };

  const handleSubmitRating = () => {
    if (!selectedOrderItemForRating || !user || currentRating === 0) {
      safeToast({ title: translate('ratingErrorTitle', "Rating Error"), description: translate('ratingErrorDesc', "Please select a star rating."), variant: "destructive" });
      return;
    }

    const { orderId, item } = selectedOrderItemForRating;
    const newRatingEntry: Rating = {
      productId: item.productId,
      userId: user.id,
      orderId: orderId,
      rating: currentRating,
      review: currentReview.trim() || undefined, 
      createdAt: new Date().toISOString(),
    };

    const updatedAllRatings = {...allRatings};
    const productRatings = updatedAllRatings[item.productId] || [];
    const existingRatingIndex = productRatings.findIndex(r => r.userId === user.id && r.orderId === orderId);

    if (existingRatingIndex > -1) {
        productRatings[existingRatingIndex] = newRatingEntry; 
    } else {
        productRatings.push(newRatingEntry); 
    }
    updatedAllRatings[item.productId] = productRatings;
    
    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(updatedAllRatings));
    setAllRatings(updatedAllRatings); 
    
    updateProductRating(item.productId); 

    safeToast({ title: translate('ratingSuccessTitle', "Rating Submitted"), description: translate('ratingSuccessDesc', `Thank you for rating ${item.name}!`) });
    setIsRatingDialogOpen(false);
    setSelectedOrderItemForRating(null);
    setCurrentRating(0);
    setCurrentReview("");
  };

  if (loading) {
    return <div className="text-center py-10">{translate('loadingOrders', 'Loading your orders...')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <ShoppingBag className="mr-3 h-8 w-8 text-primary" />
          {translate('myOrders', 'My Orders')}
        </h1>
         <Button variant="outline" size="sm" asChild>
            <Link href="/customer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {translate('continueShopping', 'Continue Shopping')}
            </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
          <CardContent className="flex flex-col items-center">
            <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold">{translate('noOrdersYet', "You haven't placed any orders yet.")}</p>
            <p className="text-muted-foreground mb-6">{translate('startShoppingToSeeOrders', 'Start shopping to see your orders here.')}</p>
            <Button asChild>
              <Link href="/customer/dashboard">{translate('browseProducts', 'Browse Products')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Card key={order.id} className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <CardTitle className="text-xl">{translate('orderId', 'Order ID:')} {order.id.substring(6)}</CardTitle> 
                    <Badge variant={order.status === "Delivered" ? "default" : "secondary"} className="w-fit bg-green-100 text-green-700 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500">
                        {translate(order.status.toLowerCase(), order.status)}
                    </Badge>
                </div>
                <CardDescription>
                  {translate('placedOn', 'Placed on:')} {new Date(order.createdAt).toLocaleDateString()} | {translate('total', 'Total:')} ${order.totalAmount.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map(item => {
                  const productRatings = allRatings[item.productId] || [];
                  const userRatingForThisItem = productRatings.find(r => r.userId === user?.id && r.orderId === order.id);

                  return (
                    <div key={item.productId + item.name} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0">
                        <Image 
                          src={item.imageUrl || "https://placehold.co/100x100.png"} 
                          alt={item.name} 
                          layout="fill" 
                          objectFit="cover"
                          data-ai-hint={`${item.category} produce`}
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {translate('quantity', 'Quantity:')} {item.orderedQuantity} {item.unit} x ${item.pricePerUnit.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">{translate('soldBy', 'Sold by:')} {item.farmerName}</p>
                      </div>
                      {order.status === "Delivered" && (
                        <Button 
                          variant={userRatingForThisItem ? "secondary" : "outline"} 
                          size="sm" 
                          onClick={() => handleOpenRatingDialog(order.id, item)}
                          className="mt-2 sm:mt-0 w-full sm:w-auto"
                        >
                          <Star className="mr-2 h-4 w-4" /> 
                          {userRatingForThisItem ? translate('viewEditRating', 'View/Edit Rating') : translate('rateProduct', 'Rate Product')}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedOrderItemForRating && (
        <Dialog open={isRatingDialogOpen} onOpenChange={(isOpen) => {
            setIsRatingDialogOpen(isOpen);
            if (!isOpen) { 
                setSelectedOrderItemForRating(null);
                setCurrentRating(0);
                setCurrentReview("");
            }
        }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{translate('rateYourPurchase', 'Rate Your Purchase')}: {selectedOrderItemForRating.item.name}</DialogTitle>
              <DialogDescription>
                {translate('shareYourExperience', 'Share your experience with this product to help others.')}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Button key={star} variant="ghost" size="icon" onClick={() => handleStarClick(star)} aria-label={`Rate ${star} out of 5 stars`}>
                    <Star className={`h-8 w-8 ${currentRating >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  </Button>
                ))}
              </div>
              <div>
                <Label htmlFor="reviewText">{translate('writeReviewOptional', 'Write a Review (Optional)')}</Label>
                <Textarea 
                  id="reviewText" 
                  value={currentReview} 
                  onChange={(e) => setCurrentReview(e.target.value)}
                  placeholder={translate('reviewPlaceholder', "What did you like or dislike?")}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{translate('cancel', 'Cancel')}</Button>
              </DialogClose>
              <Button onClick={handleSubmitRating} disabled={currentRating === 0}>
                {translate('submitRating', 'Submit Rating')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
