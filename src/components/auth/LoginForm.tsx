
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
import { Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";


const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Simple check, real app needs more
});

interface LoginFormProps {
  role: UserRole;
}

export function LoginForm({ role }: LoginFormProps) {
  const { login, authError, isLoadingAuth, clearAuthError, isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { translate } = useLanguage();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // Clear auth error when component mounts or role changes
    clearAuthError();
  }, [clearAuthError, role]);
  
  // Redirect if already authenticated
   useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'farmer') {
        router.replace('/farmer/dashboard');
      } else if (user.role === 'customer') {
        router.replace('/customer/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    clearAuthError();
    const success = await login(values.email, role);
    if (success) {
      // Redirect is handled by useEffect in parent page or this component based on isAuthenticated
      // or can explicitly redirect here if preferred after successful login
      // For now, rely on page-level useEffect
    }
    // If login fails, authError will be set in AuthContext and displayed
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {authError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
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
        <Button type="submit" className="w-full" disabled={isSubmitting || isLoadingAuth}>
          {(isSubmitting || isLoadingAuth) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {translate('login', 'Login')}
        </Button>
      </form>
    </Form>
  );
}
