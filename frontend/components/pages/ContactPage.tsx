'use client'

import ContactUsForm from '../forms/ContactUsForm'
import Link from 'next/link'
import { IoArrowRedoSharp, IoLocationOutline } from 'react-icons/io5'
import { useAbout } from '../context/AboutContext'

const ContactPage = () => {
    const { data } = useAbout()

    const number = data?.phone?.replace(/\D/g, '');

    const whatsappLink = `https://wa.me/${number}?text=${encodeURIComponent(
        "Hello, I would like to know more about your property."
    )}`;
    return (
        <>
            <section className="relative min-h-[400px] h-[50dvh] w-full overflow-hidden">

                {/* Background */}
                <img
                    src="/images/about-us.webp"
                    width={1920}
                    height={1080}
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                    alt="Contact Habibi Property"
                />

                {/* Overlay */}
                <div className="absolute inset-0 z-10 bg-linear-to-b from-white/10 via-primary/40 to-[#000000] md:from-white/10 md:via-transparent md:to-[#000000]" />

                {/* Content */}
                <div className="section-container relative z-30 flex h-full items-center justify-center gap-8 pb-10 sm:pb-14 lg:pb-20 w-full lg:max-w-3xl mx-auto">
                    <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                        <span className="golden-text border border-golden">
                            Contact Us
                        </span>
                    </h1>
                </div>
            </section>
            <div className='max-w-8xl mx-auto w-full h-1 bg-gray-1' />
            <section className='section-container max-w-5xl! mx-auto'>
                <div className='flex flex-col md:flex-row gap-8'>
                    <div className='flex-1'>
                        <ContactUsForm />
                    </div>
                    <div className='flex-1 '>
                        <div className='sticky top-32'>
                            <p>Reach out to us directly through any of the channels below. Our advisors are available to assist with all your real estate needs.</p>
                            <div className='grid grid-cols-2 gap-4 gap-y-10 items-start text-center'>
                                <div className='flex flex-col items-center gap-1'>
                                    <img
                                        src="/icons/phone-icon.svg"
                                        alt=""
                                        aria-hidden="true"
                                        width={48}
                                        height={48}
                                        className=''
                                    />
                                    <span className='text-lg font-bold font-heading tracking-wide'>Phone Number</span>
                                    <p className='text-xs text-gray-1'>{data?.phone}</p>
                                </div>

                                <Link href={`mailto:${data?.email}`} className='flex flex-col items-center gap-1'>
                                    <img
                                        src="/icons/email-icon.svg"
                                        alt=""
                                        aria-hidden="true"
                                        width={48}
                                        height={48}
                                        className=''
                                    />
                                    <span className='text-lg font-bold font-heading tracking-wide'>Email Address</span>
                                    <p className='text-xs text-gray-1'>{data?.email}</p>
                                </Link>

                                <Link href={whatsappLink} className='flex flex-col items-center gap-1'>
                                    <img
                                        src="/icons/whatsapp-icon.svg"
                                        alt=""
                                        aria-hidden="true"
                                        width={48}
                                        height={48}
                                        className=''
                                    />
                                    <span className='text-lg font-bold font-heading tracking-wide'>Whatsapp</span>
                                    <p className='text-xs text-gray-1'>{data?.phone}</p>
                                </Link>

                                <div className='flex flex-col items-center gap-1'>
                                    <img
                                        src="/icons/location-icon.svg"
                                        alt=""
                                        aria-hidden="true"
                                        width={48}
                                        height={48}
                                        className=''
                                    />
                                    <span className='text-lg font-bold font-heading tracking-wide'>Our Location</span>
                                    <p className='text-xs text-gray-1'>{data?.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className='max-w-8xl mx-auto w-full h-1 bg-gray-1' />
            <section className="section-container">
                <div className="relative">
                    {(() => {
                        const location = data?.location || "";

                        const googleMapsUrl =
                            data?.mapUrl ||
                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                location
                            )}`;

                        const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
                            location
                        )}&z=15&hl=en&output=embed`;

                        return (
                            <div className="relative aspect-[4/5] sm:aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-stone max-w-4xl mx-auto">
                                <iframe
                                    src={embedUrl}
                                    className="absolute inset-0 h-full w-full border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Map showing ${location}`}
                                />

                                <Link
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group absolute left-3 top-3 z-10 flex items-center gap-3 rounded-xl bg-primary px-3 py-2.5 text-white shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ivory/10">
                                            <IoLocationOutline className="text-lg text-primary-1" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-ivory/60">
                                                Location Area
                                            </p>

                                            <p className="max-w-[150px] truncate text-sm font-medium text-ivory">
                                                {location}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="h-8 w-px bg-ivory/15" />

                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange transition-colors duration-300 group-hover:bg-ivory/15">
                                            <IoArrowRedoSharp className="text-base text-primary-1" />
                                        </div>

                                        <span className="hidden text-xs font-semibold tracking-wide text-ivory sm:block">
                                            Directions
                                        </span>
                                    </div>
                                </Link>

                                <Link
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-4 right-4 z-10 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors"
                                >
                                    View on Google Maps
                                </Link>
                            </div>
                        );
                    })()}
                </div>
            </section>
        </>
    )
}

export default ContactPage