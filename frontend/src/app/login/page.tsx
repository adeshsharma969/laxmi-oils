"use client";

import { Suspense } from "react";
import Login from "@/pages/Login";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <Login />
    </Suspense>
  );
}
