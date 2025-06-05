export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/contentplan/:path*",
    "/inputplan/:path*",
    "/redakplan/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/locations/:path*"
  ]
};