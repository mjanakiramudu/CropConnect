
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@/lib/types';

const PROTECTED_ROUTES_FARMER = ['/farmer/dashboard'];
const PROTECTED_ROUTES_CUSTOMER = [
  '/customer/dashboard', 
  '/customer/cart', 
  '/customer/checkout', 
  '/customer/product',
  '/customer/orders' 
];

const COOKIE_NAME = "cropConnectUser"; 

interface UserCookieData {
  role?: UserRole;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userCookie = request.cookies.get(COOKIE_NAME);

  let userRole: UserRole | undefined;
  let isAuthenticated = false;

  if (userCookie && userCookie.value) {
    try {
      const parsedData = JSON.parse(userCookie.value) as unknown;
      if (
        typeof parsedData === 'object' &&
        parsedData !== null &&
        'role' in parsedData &&
        (parsedData.role === 'farmer' || parsedData.role === 'customer')
      ) {
        userRole = parsedData.role as UserRole;
        isAuthenticated = true;
      } else {
        console.warn("User cookie is invalid or missing a valid role. Path:", pathname);
      }
    } catch (e) {
      console.error("Failed to parse user cookie. Path:", pathname, e);
    }
  }

  const isFarmerRoute = PROTECTED_ROUTES_FARMER.some(route => pathname.startsWith(route));
  const isCustomerRoute = PROTECTED_ROUTES_CUSTOMER.some(route => pathname.startsWith(route));

  if (isAuthenticated && userRole) {
    if (pathname === '/' || pathname.startsWith('/login/') || pathname.startsWith('/register/')) {
      const dashboardUrl = userRole === 'farmer' ? '/farmer/dashboard' : '/customer/dashboard';
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    if (isFarmerRoute && userRole !== 'farmer') {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }
    if (isCustomerRoute && userRole !== 'customer') {
      return NextResponse.redirect(new URL('/farmer/dashboard', request.url));
    }
  } else {
    if (isFarmerRoute || isCustomerRoute) {
      let loginBase = '/login/customer'; 
      if (isFarmerRoute) {
          loginBase = '/login/farmer';
      } else if (pathname.startsWith('/customer/')) {
          loginBase = '/login/customer';
      }
      
      const loginUrl = new URL(loginBase, request.url);
      loginUrl.searchParams.set('redirect', pathname); 
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
