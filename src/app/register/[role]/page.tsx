"use client";

import { useParams, useRouter } from "next/navigation";
import type { UserRole } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";


export default function RegisterPage() {
  const params = useParams();
  const role = params.role as UserRole;
  const router = useRouter();
  const { translate } = useLanguage();
  const { setSelectedRole } = useAuth();


  useEffect(() => {
    if (role !== 'farmer' && role !== 'customer') {
      router.replace('/'); // Redirect if role is invalid
    } else {
      setSelectedRole(role);
    }
  }, [role, router, setSelectedRole]);

  if (role !== 'farmer' && role !== 'customer') {
    return <div className="flex justify-center items-center min-h-screen"><p>Invalid role.</p></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {translate('register', 'Register')} {translate('asA', 'as a')} {role === 'farmer' ? translate('farmer', 'Farmer') : translate('customer', 'Customer')}
          </CardTitle>
          <CardDescription>
            {translate('createFarmLinkAccount', 'Create your FarmLink account.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm role={role} />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {translate('alreadyHaveAccount', 'Already have an account?')}{" "}
            <Button variant="link" asChild className="p-0">
              <Link href={`/login/${role}`}>{translate('loginHere', 'Login here')}</Link>
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
