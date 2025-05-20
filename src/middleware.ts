
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@/lib/types';

const PROTECTED_ROUTES_FARMER = ['/farmer/dashboard'];
const PROTECTED_ROUTES_CUSTOMER = [
  '/customer/dashboard', 
  '/customer/cart', 
  '/customer/checkout', 
  '/customer/product' // Assuming product detail pages like /customer/product/* are protected
];

interface UserCookieData {
  role?: UserRole;
  // Add other fields from your User type if they are in the cookie and needed by middleware
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userCookie = request.cookies.get('farmLinkUser');

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
        // To aggressively clear an invalid cookie, you might do:
        // const response = NextResponse.rewrite(request.nextUrl); // or NextResponse.next() if not redirecting
        // response.cookies.delete('farmLinkUser', { path: '/' });
        // return response; 
        // For now, we'll just treat as unauthenticated.
      }
    } catch (e) {
      console.error("Failed to parse user cookie. Path:", pathname, e);
      // Similarly, could clear cookie here.
    }
  }

  const isFarmerRoute = PROTECTED_ROUTES_FARMER.some(route => pathname.startsWith(route));
  // For customer product routes like /customer/product/some-id, ensure startsWith check is appropriate
  const isCustomerRoute = PROTECTED_ROUTES_CUSTOMER.some(route => pathname.startsWith(route));

  if (isAuthenticated && userRole) {
    // If authenticated, redirect from landing, login, or register pages to their respective dashboard
    if (pathname === '/' || pathname.startsWith('/login/') || pathname.startsWith('/register/')) {
      const dashboardUrl = userRole === 'farmer' ? '/farmer/dashboard' : '/customer/dashboard';
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // If authenticated but trying to access a route for the wrong role
    if (isFarmerRoute && userRole !== 'farmer') {
      // A customer trying to access a farmer route, redirect to customer dashboard
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }
    if (isCustomerRoute && userRole !== 'customer') {
      // A farmer trying to access a customer route, redirect to farmer dashboard
      return NextResponse.redirect(new URL('/farmer/dashboard', request.url));
    }
  } else {
    // Not authenticated
    if (isFarmerRoute || isCustomerRoute) {
      // For protected routes, redirect to the appropriate login page
      let loginBase = '/login/customer'; // Default to customer login
      if (isFarmerRoute) {
          loginBase = '/login/farmer';
      }
      
      const loginUrl = new URL(loginBase, request.url);
      loginUrl.searchParams.set('redirect', pathname); // Store intended URL
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
