import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Content Planer",
  description: "Content Planning Application",
};

// App ist hell gestaltet; feste Farbgebung, damit macOS-Dark-Mode die
// Lesbarkeit nicht bricht (setzt <meta name="color-scheme" content="light">).
export const viewport: Viewport = {
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
