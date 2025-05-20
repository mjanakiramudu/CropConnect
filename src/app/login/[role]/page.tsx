
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button"; // Added import

export default function LoginPage() {
  const params = useParams();
  const role = params.role as UserRole;
  const { isAuthenticated, user, setSelectedRole } = useAuth();
  const router = useRouter();
  const { translate } = useLanguage();

  useEffect(() => {
    if (role !== 'farmer' && role !== 'customer') {
      router.replace('/'); // Redirect if role is invalid
    } else {
      setSelectedRole(role);
    }
  }, [role, router, setSelectedRole]);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'farmer') {
        router.replace('/farmer/dashboard');
      } else if (user.role === 'customer') {
        router.replace('/customer/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);


  if (role !== 'farmer' && role !== 'customer') {
    return <div className="flex justify-center items-center min-h-screen"><p>Invalid role.</p></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {translate('login', 'Login')} {translate('asA', 'as a')} {role === 'farmer' ? translate('farmer', 'Farmer') : translate('customer', 'Customer')}
          </CardTitle>
          <CardDescription>
            {translate('loginToAccess', `Login to access your ${APP_NAME} account.`)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm role={role} />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {translate('dontHaveAccount', "Don't have an account?")}{" "}
            <Button variant="link" asChild className="p-0">
              <Link href={`/register/${role}`}>{translate('registerHere', 'Register here')}</Link>
            </Button>
          </p>
           <p className="mt-2 text-center text-sm">
            <Button variant="link" asChild className="p-0">
              <Link href="/">{translate('backToRoleSelection', 'Back to role selection')}</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

