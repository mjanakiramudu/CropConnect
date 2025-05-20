"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tractor, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { APP_NAME } from "@/lib/constants";

export function RoleSelection() {
  const { setSelectedRole } = useAuth();
  const router = useRouter();
  const { translate } = useLanguage();

  const handleRoleSelection = (role: "farmer" | "customer") => {
    setSelectedRole(role);
    router.push(`/login/${role}`); // Or directly to register: /register/${role}
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        {translate('welcomeTo', 'Welcome to')} <span className="text-primary">{translate('appName', APP_NAME)}!</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-12">
        {translate('appTagline', 'Connecting farmers and customers directly.')}
      </p>
      <h2 className="text-2xl font-semibold mb-8">{translate('selectYourRole', 'Select Your Role')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="items-center text-center">
            <Tractor className="h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-2xl">{translate('farmer', 'Farmer')}</CardTitle>
            <CardDescription>{translate('farmerDescription', 'Sell your produce directly to customers.')}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" className="w-full" onClick={() => handleRoleSelection("farmer")}>
              {translate('iAmAFarmer', "I'm a Farmer")}
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="items-center text-center">
            <Users className="h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-2xl">{translate('customer', 'Customer')}</CardTitle>
            <CardDescription>{translate('customerDescription', 'Buy fresh produce directly from farmers.')}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" className="w-full" onClick={() => handleRoleSelection("customer")}>
              {translate('iAmACustomer', "I'm a Customer")}
            </Button>
          </CardContent>
        </Card>
      </div>
       <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          {translate('alreadyHaveAccount', 'Already have an account?')}
        </p>
        <div className="flex gap-4 mt-2 justify-center">
            <Button variant="link" asChild>
                <Link href="/login/farmer">{translate('loginAsFarmer', 'Login as Farmer')}</Link>
            </Button>
            <Button variant="link" asChild>
                <Link href="/login/customer">{translate('loginAsCustomer', 'Login as Customer')}</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
