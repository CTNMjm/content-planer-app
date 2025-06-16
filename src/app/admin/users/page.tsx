"use client";

import { useState, useEffect } from "react";
import UserManagement from "@/components/UserManagement";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    // Nur Admins haben Zugriff
    if (!session || session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="p-8">Lade...</div>;
  }

  if (!session || session.user.role !== "ADMIN") {
    return <div className="p-8">Keine Berechtigung</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Benutzerverwaltung</h1>
      <UserManagement />
    </div>
  );
}