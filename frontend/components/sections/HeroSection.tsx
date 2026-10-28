import {
    DollarSign,
    Gem,
    HousePlus,
    PencilRuler,
    ThumbsUp,
} from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const features = [
    { title: 'Premium Build Quality', icon: Gem },
    { title: 'Designer Interior', icon: PencilRuler },
    { title: 'Neighborhood Insight', icon: HousePlus },
    { title: 'Fair Market Valuation', icon: DollarSign },
    { title: 'Exclusive Amenities', icon: ThumbsUp },
    { title: 'Full Ownership Support', icon: Gem },
]

const HeroSection = () => {
    return (
        <section className="relative min-h-[700px] h-[90dvh] w-full overflow-hidden">

            {/* Background */}
            <Image
                fill
                priority
                fetchPriority="high"
                sizes="100vw"
                quality={75}
                src="/images/hero.webp"
                className="absolute inset-0 z-0 h-full w-full object-cover"
                alt="Premium property"
            />

            {/* Overlay */}
            <div className="absolute inset-0 z-10 bg-linear-to-b from-white/10 via-primary/40 to-[#000000] md:from-white/10 md:via-transparent md:to-[#000000]" />

            {/* Content */}
            <div className="section-container relative z-30 flex h-full  flex-col justify-end gap-8 pb-10 sm:pb-14 lg:pb-20">

                {/* Heading */}
                <div className="w-full lg:max-w-3xl">
                    <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                        Find the Place
                        <br />
                        <span className="golden-text border border-golden">
                            Where Memories
                        </span>{' '}
                        Are Made.
                    </h1>

                    <p className="max-w-2xl pt-3 font-body text-base tracking-tight text-white sm:text-lg md:text-gray-1">
                        Discover A Curated collection of premium properties in
                        prime locations, backed by expert guidence at every step.
                    </p>
                </div>

                {/* Features */}
                <div className="w-full lg:absolute lg:right-6 lg:top-35 lg:w-auto">
                    <div className="golden-bg-bordered/20 w-full max-w-[320px] rounded-2xl border border-primary-1 p-5 shadow-2xl backdrop-blur-sm sm:p-6 lg:w-[300px]">
                        <h2 className="mb-4 text-center font-heading text-lg font-semibold tracking-wider text-white drop-shadow-2xl">
                            Property Features
                        </h2>

                        <div>
                            {features.map((feature, index) => {
                                const Icon = feature.icon

                                return (
                                    <div
                                        key={index}
                                        className="my-2 flex items-center gap-2 font-heading text-sm tracking-wide"
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span>{feature.title}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default HeroSection