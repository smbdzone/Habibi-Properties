"use client";

import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function Error({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="min-h-full mt-8 bg-black text-white flex items-center justify-center px-4">
            <section className="w-full max-w-2xl mx-auto text-center">

                {/* Error Icon */}
                <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-gray-3">
                    <AlertTriangle
                        size={28}
                        className="text-[#D4AF37]"
                        strokeWidth={1.5}
                    />
                </div>

                {/* Heading */}
                <div className="space-y-4">
                    <p className="golden-text uppercase tracking-[0.3em] text-xs sm:text-sm font-body">
                        Something Went Wrong
                    </p>

                    <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-ivory">
                        We couldn't load this page.
                    </h1>

                    <p className="text-gray-1 max-w-lg mx-auto text-sm sm:text-base leading-7">
                        An unexpected error occurred while loading this page. Please try
                        again or return to Habibi Properties.
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3
              golden-bg text-black font-medium rounded-sm
              hover:opacity-90 transition-opacity"
                    >
                        <RefreshCcw size={18} />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3
              border border-gray-3 text-ivory rounded-sm
              hover:border-secondary hover:text-secondary
              transition-colors"
                    >
                        <Home size={18} />
                        Back to Home
                    </Link>
                </div>

                {/* Decorative divider */}
                <div className="flex items-center justify-center gap-3 mt-12">
                    <span className="h-px w-16 bg-gray-3" />
                    <span className="w-1.5 h-1.5 rounded-full golden-bg" />
                    <span className="h-px w-16 bg-gray-3" />
                </div>

                {/* Brand */}
                <div className="mt-8">
                    <p className="font-heading text-lg text-ivory">
                        Habibi
                    </p>

                    <p className="text-[9px] uppercase tracking-[0.4em] golden-text mt-1">
                        Properties
                    </p>
                </div>

            </section>
        </main>
    );
}