import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function getUserFromToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isEmployeeRoute =
  pathname.startsWith("/dashboard") ||
  pathname.startsWith("/attendance") ||
  pathname.startsWith("/payroll") ||
  pathname.startsWith("/history");

  if (!isAdminRoute && !isEmployeeRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = isAdminRoute ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  const user = await getUserFromToken(token);

  if (!user) {
    const loginUrl = isAdminRoute ? "/admin/login" : "/login";
    const response = NextResponse.redirect(new URL(loginUrl, request.url));
    response.cookies.delete("token");
    return response;
  }

  if (isAdminRoute && user.role !== "HRD" && user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/attendance/:path*", "/payroll/:path*", "/history/:path*"],
};