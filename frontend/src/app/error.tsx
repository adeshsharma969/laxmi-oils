"use client";

import { useMemo } from "react";

type AnyError = Error & { digest?: string };

function normalizeErrorMessage(error: unknown): string {
  if (!error) return "Something went wrong.";
  if (error instanceof Error) return error.message || "Something went wrong.";
  if (typeof error === "string") return error;
  if (typeof Event !== "undefined" && error instanceof Event) {
    return "An unexpected browser event caused an error. Please retry.";
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Something went wrong.";
  }
}

export default function GlobalError({
  error,
  reset,
}: {
  error: AnyError | unknown;
  reset: () => void;
}) {
  const message = useMemo(() => normalizeErrorMessage(error), [error]);

  return (
    <html>
      <body className="bg-[#F5F1E8]">
        <main className="min-h-screen px-4 sm:px-6 md:px-10 py-12 flex items-center justify-center">
          <section className="w-full max-w-xl border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-6 sm:p-8 brutal-shadow">
            <p className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#B8431A]">
              Runtime Error
            </p>
            <h1 className="mt-1 font-display font-black text-3xl sm:text-4xl text-[#1F3D2B] tracking-tighter">
              We hit an unexpected issue.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#1F3D2B]/80 break-words">{message}</p>
            <button
              onClick={reset}
              className="touch-target mt-6 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-5 py-3 font-black uppercase tracking-[0.16em] hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors"
            >
              Try Again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
