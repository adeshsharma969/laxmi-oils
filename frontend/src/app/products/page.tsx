"use client";

import { Suspense } from "react";
import Products from "@/pages/Products";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <Products />
    </Suspense>
  );
}
