"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import InputPlanList from "@/components/InputPlanList";

export default function InputPlanPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Input-Pläne</h1>
      <InputPlanList 
        searchTerm={searchTerm}
        refreshKey={refreshKey}
      />
    </div>
  );
}
