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
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="p-8">Lade...</div>;
  }

  if (!session || session.user.role !== "ADMIN") {
    return <div className="p-8">Keine Berechtigung</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Benutzerverwaltung</h1>
      <UserManagement />
    </div>
  );
}