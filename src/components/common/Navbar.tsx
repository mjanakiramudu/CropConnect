"use client";

import Link from "next/link";
import { Leaf, LogIn, LogOut, UserPlus, ShoppingCart, Tractor, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export function Navbar() {
  const { isAuthenticated, user, logout, selectedRole } = useAuth();
  const { translate } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            {translate('appName', APP_NAME)}
          </span>
        </Link>
        
        <nav className="flex flex-1 items-center space-x-4">
          {isAuthenticated && user?.role === "customer" && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/customer/dashboard">{translate('browseProducts', 'Browse Products')}</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/customer/cart"><ShoppingCart className="mr-2 h-4 w-4" /> Cart</Link>
              </Button>
            </>
          )}
          {isAuthenticated && user?.role === "farmer" && (
            <Button variant="ghost" asChild>
              <Link href="/farmer/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />{translate('dashboard', 'Dashboard')}</Link>
            </Button>
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
