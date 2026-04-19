"use client";

import { Suspense } from "react";
import AuthCallback from "@/pages/AuthCallback";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <AuthCallback />
    </Suspense>
  );
}
