import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Content Planer",
  description: "Content Planning Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        {/* TODO: Tailwind sollte im Build kompiliert werden (globals.css @tailwind-Direktiven
            reaktivieren) statt zur Laufzeit vom CDN zu laden — Performance- und Supply-Chain-Risiko. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
