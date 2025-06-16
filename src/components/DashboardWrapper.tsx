"use client";

import Header from "./Header";
import Navigation from "./Navigation";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {/* Container für Navigation und Content */}
      <div className="container mx-auto px-4">
        <Navigation />
        <main className="py-8">{children}</main>
      </div>
    </>
  );
}