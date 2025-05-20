"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, CreditCard } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CheckoutPage() {
  const { translate } = useLanguage();

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
          <div>
            <h3 className="text-lg font-semibold mb-3">{translate('shippingAddress', 'Shipping Address')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">{translate('fullName', 'Full Name')}</Label>
                <Input id="fullName" placeholder={translate('namePlaceholder', "Your Name")} />
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
          <Button size="lg" className="w-full" onClick={() => alert(translate('orderPlacedMock', 'Order Placed (Mock)! Thank you for your purchase.'))}>
            <CreditCard className="mr-2 h-5 w-5" /> {translate('placeOrder', 'Place Order ($XXX.XX)')} {/* Replace XXX.XX with actual total */}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
