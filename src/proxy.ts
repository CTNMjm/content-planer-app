import { withAuth } from "next-auth/middleware";

// Next 16: "proxy" ersetzt die "middleware"-Konvention.
// Expliziter Funktions-Export, da der frühere Re-Export
// (export { default } from "next-auth/middleware") von Turbopack
// nicht als Funktion erkannt wird.
export default withAuth({});

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
