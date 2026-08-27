import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";


export default auth( (req) => {
	const isLoggedIn = !!req.auth;
	const role = req.auth?.user?.role;
	const path = req.nextUrl.pathname;

	const isAdminRoute = path.startsWith("/admin");
	const isProtectedRoute = path.startsWith("/dashboard") || isAdminRoute;

	if (isProtectedRoute && !isLoggedIn){
		return NextResponse.redirect(new URL("/login", req.nextUrl));
	}

	if (isAdminRoute && role !== "ADMIN"){
		return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
	}

	return NextResponse.next();
} );

export const config = {
	matcher: ["/dashboard/:path*", "/admin/:path*"],
};