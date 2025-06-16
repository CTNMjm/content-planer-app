"use client";

import { useState, useEffect } from "react";
import InputPlanModal from "./InputPlanModal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import InputPlanList from "@/components/InputPlanList";

export default function InputPlanPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Input-Pläne</h1>
      <InputPlanList />
    </div>
  );
}
