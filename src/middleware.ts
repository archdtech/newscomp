import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/sso-callback(.*)",
  ],
  afterAuth(auth, req) {
    // Handle authenticated users
    if (auth.userId && !auth.isPublicRoute) {
      // Allow access to authenticated routes
      return NextResponse.next();
    }

    // Handle unauthenticated users
    if (!auth.userId && !auth.isPublicRoute) {
      // Redirect to home page instead of sign-in
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};