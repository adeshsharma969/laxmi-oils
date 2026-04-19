"use client";

import { Suspense } from "react";
import Invoice from "@/pages/Invoice";

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <Invoice />
    </Suspense>
  );
}
