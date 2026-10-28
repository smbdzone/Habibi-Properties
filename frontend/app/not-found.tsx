import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import Loading from "./loading";

export default function NotFound() {
    return (
        <main className="min-h-full mt-8 bg-black text-white flex items-center justify-center px-4">
            <section className="text-center max-w-2xl mx-auto">

                {/* 404 */}
                <div className="mb-6">
                    <span className="text-[100px] sm:text-[140px] lg:text-[180px] leading-none font-heading font-bold golden-text">
                        404
                    </span>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <p className="golden-text uppercase tracking-[0.3em] text-sm font-body">
                        Page Not Found
                    </p>

                    <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-ivory">
                        This property seems to have moved.
                    </h1>

                    <p className="text-gray-1 max-w-lg mx-auto text-sm sm:text-base leading-7">
                        The page you are looking for may have been removed, renamed, or
                        temporarily unavailable.
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3
              golden-bg text-black font-medium rounded-sm
              hover:opacity-90 transition-opacity"
                    >
                        <Home size={18} />
                        Back to Home
                    </Link>

                    {/* <Link href={'/'}

                        className="inline-flex items-center justify-center gap-2 px-6 py-3
              border border-gray-3 text-ivory rounded-sm
              hover:border-secondary hover:text-secondary transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </Link> */}
                </div>

                {/* Decorative line */}
                <div className="flex items-center justify-center gap-3 mt-12">
                    <span className="h-px w-16 bg-gray-3" />
                    <span className="w-1.5 h-1.5 rounded-full golden-bg" />
                    <span className="h-px w-16 bg-gray-3" />
                </div>

            </section>
         
        </main>
    );
}