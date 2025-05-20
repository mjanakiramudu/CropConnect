import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES_FARMER = ['/farmer/dashboard'];
const PROTECTED_ROUTES_CUSTOMER = ['/customer/dashboard', '/customer/cart', '/customer/checkout', '/customer/product'];
const AUTH_ROUTES = ['/login', '/register']; // Routes for unauthenticated users

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // This is a VERY simplified mock auth check. 
  // In a real app, you'd verify a JWT or session cookie.
  const isAuthenticated = request.cookies.has('farmLinkUser');
  const userCookie = request.cookies.get('farmLinkUser');
  let userRole: string | undefined;

  if (userCookie) {
    try {
      const userData = JSON.parse(userCookie.value);
      userRole = userData.role;
    } catch (e) {
      // Invalid cookie
    }
  }

  const isFarmerRoute = PROTECTED_ROUTES_FARMER.some(route => pathname.startsWith(route));
  const isCustomerRoute = PROTECTED_ROUTES_CUSTOMER.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route) || pathname === '/');


  if (isAuthenticated) {
    // If user is authenticated and tries to access login/register or landing page, redirect to their dashboard
    if (isAuthRoute && !pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
       // Allow if it's login/register pages of the other role
    } else if ((pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register')) && userRole) {
        return NextResponse.redirect(new URL(userRole === 'farmer' ? '/farmer/dashboard' : '/customer/dashboard', request.url));
    }
    
    // If user is authenticated but wrong role for route
    if (isFarmerRoute && userRole !== 'farmer') {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }
    if (isCustomerRoute && userRole !== 'customer') {
      return NextResponse.redirect(new URL('/farmer/dashboard', request.url));
    }
  } else {
    // If user is not authenticated and tries to access protected route
    if (isFarmerRoute || isCustomerRoute) {
      // Store the intended URL to redirect after login
      const loginUrl = new URL(pathname.includes('farmer') ? '/login/farmer' : '/login/customer', request.url);
      loginUrl.searchParams.set('redirect', pathname);
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
