
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/types";
import { Loader2, AlertTriangle, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

const formSchemaBase = {
  name: z.string().min(2, { message: "Name must be at least 2 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
};

const farmerFormSchema = z.object({
  ...formSchemaBase,
  location: z.string().min(3, {message: "Location is required for farmers."}),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const customerFormSchema = z.object({
  ...formSchemaBase
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


interface RegisterFormProps {
  role: UserRole;
}

export function RegisterForm({ role }: RegisterFormProps) {
  const { register, authError, isLoadingAuth, clearAuthError, isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { translate } = useLanguage();
  const router = useRouter();

  const currentFormSchema = role === 'farmer' ? farmerFormSchema : customerFormSchema;

  const form = useForm<z.infer<typeof currentFormSchema>>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      ...(role === 'farmer' && { location: "" }),
    },
  });

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError, role]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'farmer') {
        router.replace('/farmer/dashboard');
      } else if (user.role === 'customer') {
        router.replace('/customer/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  async function onSubmit(values: z.infer<typeof currentFormSchema>) {
    setIsSubmitting(true);
    clearAuthError();
    let success;
    if (role === 'farmer' && 'location' in values) {
        success = await register(values.name, values.email, role, values.location);
    } else {
        success = await register(values.name, values.email, role);
    }
    
    if (success) {
      // Redirection handled by useEffect
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {authError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate('fullName', 'Full Name')}</FormLabel>
              <FormControl>
                <Input placeholder={translate('namePlaceholder', "Your Name")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate('email', 'Email')}</FormLabel>
              <FormControl>
                <Input placeholder={translate('emailPlaceholder', "your@email.com")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {role === 'farmer' && (
            <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{translate('yourLocationCityState', 'Your Location (City, State)')}</FormLabel>
                <FormControl>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder={translate('locationPlaceholderRegister', "e.g., Nashik, Maharashtra")} {...field} className="pl-10" />
                    </div>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate('password', 'Password')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate('confirmPassword', 'Confirm Password')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting || isLoadingAuth}>
          {(isSubmitting || isLoadingAuth) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {translate('register', 'Register')}
        </Button>
      </form>
    </Form>
  );
}
