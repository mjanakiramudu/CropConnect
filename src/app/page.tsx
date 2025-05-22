"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RoleSelection } from '@/components/RoleSelection';
import { Loader2 } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'farmer') {
        router.replace('/farmer/dashboard');
      } else if (user.role === 'customer') {
        router.replace('/customer/dashboard');
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading {APP_NAME}...</p>
      </div>
    );
  }

  if (isAuthenticated) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    );
  }
  
  return <RoleSelection />;
}
