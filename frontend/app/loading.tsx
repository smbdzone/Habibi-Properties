export default function Loading() {
    return (
        <main className="min-h-full mt-8 bg-black text-white flex items-center justify-center px-4">
            <section className="flex flex-col items-center justify-center text-center">

                {/* Logo / Brand */}
                <div className="mb-10">
                    <img src="/images/logo.webp"
                        className="w-70 h-50"
                        width={280}
                        height={200}
                        alt="Habibi Property" />
                </div>

                {/* Loader */}
                <div className="relative w-14 h-14">
                    <div
                        className="absolute inset-0 rounded-full border border-gray-3"
                    />

                    <div
                        className="absolute inset-0 rounded-full border border-transparent
              border-t-[#E7CEA5] border-r-[#B18336]
              animate-spin"
                    />
                </div>

                {/* Loading text */}
                <div className="mt-6 space-y-2">
                    <p className="font-heading text-lg text-ivory">
                        Finding your next property
                    </p>

                    <p className="text-xs text-gray-1 tracking-wide">
                        Please wait a moment...
                    </p>
                </div>

                {/* Decorative line */}
                <div className="flex items-center justify-center gap-3 mt-8">
                    <span className="h-px w-12 bg-gray-3" />
                    <span className="w-1.5 h-1.5 rounded-full golden-bg" />
                    <span className="h-px w-12 bg-gray-3" />
                </div>

            </section>
        </main>
    );
}