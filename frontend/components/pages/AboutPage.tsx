import React from 'react'
import GoldenButton from '../shared/GoldenButton'

const AboutPage = () => {
    return (
        <>
            <section className="relative min-h-[400px] h-[50dvh] w-full overflow-hidden">

                {/* Background */}
                <img
                    src="/images/about-us.webp"
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                    alt="Premium property"
                />

                {/* Overlay */}
                <div className="absolute inset-0 z-10 bg-linear-to-b from-white/10 via-primary/40 to-[#000000] md:from-white/10 md:via-transparent md:to-[#000000]" />

                {/* Content */}
                <div className="section-container relative z-30 flex h-full items-center justify-center gap-8 pb-10 sm:pb-14 lg:pb-20 w-full lg:max-w-3xl mx-auto">


                    <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                        <span className="golden-text border border-golden">
                            About Us
                        </span>                        </h1>




                </div>
            </section>
            <section className="section-container">
                <div className="grid grid-cols-1 items-center gap-10 sm:gap-14 md:grid-cols-2 lg:gap-20">

                    {/* Image */}
                    <div className="relative">

                        {/* Decorative frame */}
                        {/* <div className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl border border-golden/50 sm:-bottom-4 sm:-right-4" /> */}

                        <div className="relative overflow-hidden rounded-2xl border-golden aspect-[4/4.2]">
                            <img
                                src="/images/ahmad.webp"
                                alt="Habibi Properties"
                                className="h-full w-full object-cover "
                            />

                            {/* Subtle image overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                            {/* Image label */}
                            <div className="absolute bottom-5 left-5 rounded-lg border border-white/20 bg-black/40 px-4 py-3 backdrop-blur-md">
                                <p className="font-heading text-xs uppercase tracking-[0.2em] text-white">
                                    Habibi Properties
                                </p>
                                <p className="mt-1 text-[11px] tracking-wide text-white/70">
                                    Dubai Real Estate
                                </p>
                            </div>
                        </div>
                    </div>


                    {/* Content */}
                    <div className="relative">

                        {/* Section label */}
                        <div className="flex items-center gap-3">
                            <span className="h-px w-10 bg-golden" />

                            <span className="font-heading text-sm uppercase tracking-[0.25em] text-gray-1">
                                About Us
                            </span>
                        </div>


                        {/* Heading */}
                        <h2 className="mt-5 max-w-xl font-heading text-2xl sm:text-3xl lg:text-4xl  font-semibold tracking-wider">
                            Helping You Find
                            <span className="golden-text"> More Than Just a Property.</span>
                        </h2>


                        {/* Description */}
                        <div className="mt-6 max-w-xl space-y-4 text-base leading-7 text-gray-1 sm:text-lg">
                            <p>
                                At Habibi Properties, we believe the right property is more
                                than an address. It is a decision that shapes your lifestyle,
                                your future, and your investment journey.
                            </p>

                            <p>
                                We connect our clients with carefully selected properties
                                across Dubai, combining local market knowledge with a
                                personal approach to buying, selling, and investing.
                            </p>
                        </div>


                        {/* Bottom information */}
                        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-gray-2 pt-7 sm:max-w-lg">

                            <div>
                                <span className="font-heading text-xl font-semibold golden-text">
                                    Dubai
                                </span>

                                <p className="mt-1 text-xs uppercase tracking-wider text-gray-1">
                                    Our Market
                                </p>
                            </div>

                            <div>
                                <span className="font-heading text-xl font-semibold golden-text">
                                    Personal
                                </span>

                                <p className="mt-1 text-xs uppercase tracking-wider text-gray-1">
                                    Our Approach
                                </p>
                            </div>

                        </div>

                    </div>

                </div>
            </section>

            <div className='max-w-8xl mx-auto w-full h-1 bg-gray-1' />


            {/* =========================
                WHY HABIBI
            ========================== */}
            <section className="section-container relative">
                <div>

                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">

                        <div>
                            <span className="font-body text-sm uppercase tracking-[0.25em] text-gray-1">
                                Why Habibi
                            </span>

                            <h2 className="mt-4 max-w-md text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider">
                                More than property.
                                <span className="golden-text">
                                    {' '}A relationship.
                                </span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 divide-y divide-white/10 border-t border-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:border-t-0">

                            <ValueCard
                                number="01"
                                title="Market Knowledge"
                                description="Local insight into Dubai's communities, developments, developers and investment opportunities."
                            />

                            <ValueCard
                                number="02"
                                title="Personal Guidance"
                                description="Every client has different goals. We take the time to understand them before recommending a property."
                            />

                            <ValueCard
                                number="03"
                                title="Curated Properties"
                                description="We focus on properties that offer genuine lifestyle appeal, location value and investment potential."
                            />

                            <ValueCard
                                number="04"
                                title="Long-Term Relationships"
                                description="Our relationship doesn't end when the paperwork is signed. We aim to remain a trusted property partner."
                            />

                        </div>
                    </div>
                </div>
            </section>


            {/* =========================
                OUR APPROACH
            ========================== */}
            <section className="section-container ">

                <div className="max-w-2xl">
                    <span className="font-body text-sm uppercase tracking-[0.25em] text-gray-1">
                        Our Approach
                    </span>

                    <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider">
                        From first conversation
                        <span className="golden-text"> to the right property.</span>
                    </h2>
                </div>

                <div className="mt-14 border-t border-gray-2">

                    <ProcessRow
                        number="01"
                        title="Understand"
                        description="We start by understanding your lifestyle, requirements, investment goals and preferred locations."
                    />

                    <ProcessRow
                        number="02"
                        title="Curate"
                        description="We narrow down the market and present properties that genuinely align with your objectives."
                    />

                    <ProcessRow
                        number="03"
                        title="Navigate"
                        description="From viewing and negotiation to documentation and closing, we guide you through every stage."
                    />

                    <ProcessRow
                        number="04"
                        title="Stay Connected"
                        description="Our relationship continues beyond the transaction, helping you make informed decisions as the market evolves."
                    />

                </div>
            </section>


            {/* =========================
                DUBAI MARKET
            ========================== */}
            <section className="section-container ">
                <div className="relative overflow-hidden rounded-3xl bg-[#111111]">

                    <div className="grid min-h-[500px] grid-cols-1 md:grid-cols-[1fr_0.85fr]">

                        <div className="relative flex flex-col justify-center p-8 sm:p-12 lg:p-16">

                            <span className="font-body text-sm uppercase tracking-[0.25em] text-gray-1">
                                Our Market
                            </span>

                            <h2 className="mt-5 max-w-xl text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider">
                                Connected to
                                <span className="golden-text"> Dubai's possibilities.</span>
                            </h2>

                            <p className="mt-6 max-w-lg text-base leading-7 text-gray-1 sm:text-lg">
                                Dubai offers a diverse property landscape, from established
                                communities and waterfront residences to emerging districts
                                and new investment destinations.
                            </p>

                            <div className="mt-10 grid max-w-lg grid-cols-2 gap-8">
                                <MarketItem
                                    title="Luxury Residences"
                                    text="Premium homes & branded residences"
                                />

                                <MarketItem
                                    title="Waterfront Living"
                                    text="Sea-facing apartments & villas"
                                />

                                <MarketItem
                                    title="Investment"
                                    text="Income & long-term opportunities"
                                />

                                <MarketItem
                                    title="New Developments"
                                    text="Off-plan & upcoming communities"
                                />
                            </div>
                        </div>

                        <div className="relative hidden md:block min-h-[360px] md:min-h-full">
                            <img
                                src="/images/about-2.webp"
                                alt="Dubai real estate"
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-transparent to-transparent lg:bg-gradient-to-r" />
                        </div>

                    </div>
                </div>
            </section>


            {/* =========================
                CTA
            ========================== */}
            <section className="section-container ">
                <div className="border-t border-gray-2 pt-16 sm:pt-20">

                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

                        <div className="max-w-3xl">
                            <span className="font-body text-sm uppercase tracking-[0.25em] text-gray-1">
                                Your Next Move
                            </span>

                            <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                                Let's find a property
                                <span className="golden-text"> worth coming home to.</span>
                            </h2>
                        </div>

                        <div className="shrink-0 inline-flex">
                            <GoldenButton
                                text="Schedule a Consultation"
                                href="/contact"
                            />
                        </div>

                    </div>
                </div>
            </section>

        </>
    )
}

export default AboutPage


const SkillBar = ({ title, percentage }: { title: string, percentage: number | string }) => {
    return (
        <div className='w-full sm:max-w-md'>
            <div className=' text-sm sm:text-base font-heading tracking-wide -mb-2'>
                <p>{title}</p>
            </div>
            <div className='text-end'>
                {percentage}%
            </div>
            <div className='relative h-3 w-full bg-gray-2 rounded-lg mt-1'>
                <div className='golden-bg relative h-full rounded-lg' style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

const SkillNumber = ({ title, number }: { title: string, number: number | string }) => {
    return (
        <div className='flex flex-col items-center justify-center gap-2'>
            <h3 className='text-4xl sm:text-[56px] font-bold font-heading tracking-wide golden-text'>{number} <span className='font-bold'>+</span></h3>
            <span className='text-sm font-body text-center'>{title}</span>
        </div>
    )
}



/* =========================================
   MARKET ITEM
========================================= */

const MarketItem = ({
    title,
    text,
}: {
    title: string
    text: string
}) => {
    return (
        <div>
            <h3 className="font-heading text-sm font-semibold sm:text-base">
                {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-1 sm:text-sm">
                {text}
            </p>
        </div>
    )
}



/* =========================================
   PROCESS ROW
========================================= */

const ProcessRow = ({
    number,
    title,
    description,
}: {
    number: string
    title: string
    description: string
}) => {
    return (
        <div className="grid grid-cols-[60px_1fr] gap-5 border-b border-gray-2 py-7 sm:grid-cols-[100px_0.7fr_1fr] sm:items-center sm:gap-8 sm:py-9">

            <span className="font-heading text-sm tracking-[0.2em] text-gray-1">
                {number}
            </span>

            <h3 className="font-heading text-xl font-semibold sm:text-2xl">
                {title}
            </h3>

            <p className="col-span-2 text-sm leading-6 text-gray-1 sm:col-span-1 sm:text-base">
                {description}
            </p>
        </div>
    )
}



/* =========================================
   VALUE CARD
========================================= */

const ValueCard = ({
    number,
    title,
    description,
}: {
    number: string
    title: string
    description: string
}) => {
    return (
        <div className="group border-b border-white/10 p-7 sm:p-8 lg:p-10">

            <span className="font-heading text-sm tracking-[0.2em] text-gray-1">
                {number}
            </span>

            <h3 className="mt-8 font-heading text-xl font-semibold sm:text-2xl">
                {title}
            </h3>

            <p className="mt-4 text-sm leading-6 text-gray-1 sm:text-base">
                {description}
            </p>
        </div>
    )
}

