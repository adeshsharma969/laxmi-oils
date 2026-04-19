"use client";

import { Suspense } from "react";
import Checkout from "@/pages/Checkout";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <Checkout />
    </Suspense>
  );
}
