"use client";

import { Suspense } from "react";
import ProductDetail from "@/pages/ProductDetail";

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ProductDetail />
    </Suspense>
  );
}
