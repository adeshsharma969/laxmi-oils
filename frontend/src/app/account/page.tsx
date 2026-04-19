"use client";

import { Suspense } from "react";
import Account from "@/pages/Account";

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <Account />
    </Suspense>
  );
}
