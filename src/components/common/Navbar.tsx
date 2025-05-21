
"use client";

import Link from "next/link";
import { Leaf, LogIn, LogOut, UserPlus, ShoppingCart, Tractor, LayoutDashboard, ListOrdered } from "lucide-react"; // Added ListOrdered
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext"; // Import useCart

export function Navbar() {
  const { isAuthenticated, user, logout, selectedRole } = useAuth();
  const { translate } = useLanguage();
  const { cart } = useCart(); // Get cart to display item count

  const cartItemCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            {translate('appName', APP_NAME)}
          </span>
        </Link>
        
        <nav className="flex flex-1 items-center space-x-2 md:space-x-4">
          {isAuthenticated && user?.role === "customer" && (
            <>
              <Button variant="ghost" asChild size="sm" className="px-2 md:px-3">
                <Link href="/customer/dashboard">{translate('browseProducts', 'Browse Products')}</Link>
              </Button>
              <Button variant="ghost" asChild size="sm" className="px-2 md:px-3">
                <Link href="/customer/orders">
                  <ListOrdered className="mr-0 h-4 w-4 md:mr-2" /> <span className="hidden md:inline">{translate('myOrders', 'My Orders')}</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild size="sm" className="px-2 md:px-3 relative">
                <Link href="/customer/cart">
                  <ShoppingCart className="mr-0 h-4 w-4 md:mr-2" /> <span className="hidden md:inline">{translate('cart', 'Cart')}</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 md:top-0 md:right-0 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </Button>
            </>
          )}
          {isAuthenticated && user?.role === "farmer" && (
            <Button variant="ghost" asChild size="sm" className="px-2 md:px-3">
              <Link href="/farmer/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />{translate('dashboard', 'Dashboard')}</Link>
            </Button>
            // Add farmer specific nav links here later if needed, e.g. Analytics, News
          )}
        </nav>

        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {translate('welcome', 'Welcome')}, {user?.name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> {translate('logout', 'Logout')}
              </Button>
            </>
          ) : (
            <>
              {selectedRole ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/login/${selectedRole}`}>
                      <LogIn className="mr-2 h-4 w-4" /> {translate('login', 'Login')}
                    </Link>
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/register/${selectedRole}`}>
                      <UserPlus className="mr-2 h-4 w-4" /> {translate('register', 'Register')}
                    </Link>
                  </Button>
                </>
              ) : (
                 <Button variant="ghost" size="sm" asChild>
                    <Link href={`/`}>
                       {translate('selectRole', 'Select Role')}
                    </Link>
                  </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
