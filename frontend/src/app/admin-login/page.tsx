"use client";

import { Suspense } from "react";
import AdminLogin from "@/pages/AdminLogin";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <AdminLogin />
    </Suspense>
  );
}
