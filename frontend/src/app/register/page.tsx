"use client";

import { Suspense } from "react";
import Register from "@/pages/Register";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <Register />
    </Suspense>
  );
}
