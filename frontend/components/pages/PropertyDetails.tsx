'use client';

import { priceFormat } from '@/utils/priceFormat';
import { ChevronDown, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FaLongArrowAltLeft } from 'react-icons/fa';
import { IoArrowRedoSharp, IoLocationOutline } from 'react-icons/io5';
import { MdOutlinePool } from 'react-icons/md';
import PropertyCard from '../shared/PropertyCard';
import { IProperty } from '../types/types';
import ModelBox from '../ui/ModelBox';
import { getAmenityIcon } from '@/lib/amenities';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import "swiper/css";
import 'swiper/css/autoplay';
import BookAppointmentForm from '../forms/BookAppointmentForm';

const PropertyDetails = ({ property, similarProperties }: { property: IProperty, similarProperties: IProperty[] }) => {
    const [activePlan, setActivePlan] = useState(
        property.paymentPlans[0].planName
    );
    const [openBookApponModel, setOpenBookApponModel] = useState<boolean>(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [activeFloorImg, setActiveFloorImg] = useState<string | null>(null)
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    const [gallery, setGallery] = useState<string[]>([]);

    const [activeIndex, setActiveIndex] = useState(0);

    const [activeMedia, setActiveMedia] = useState<string>(
        property.coverImage
    );

    const paymentPlanRef = useRef<HTMLDivElement>(null)
    const unitsRef = useRef<HTMLDivElement>(null)

    const gotoPaymentSection = () => {
        paymentPlanRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }

    const gotoUnitsSection = () => {
        unitsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }

    const createMarkup = (html: string) => ({ __html: html });

    const isVideo = (src: string) => {
        const youtubeRegex =
            /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)/i;

        return youtubeRegex.test(src);
    };

    const getEmbedUrl = (url: string) => {
        const match = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
        );

        return match
            ? `https://www.youtube.com/embed/${match[1]}`
            : url;
    };

    const getYoutubeThumbnail = (url: string) => {
        const match = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
        );

        return match
            ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
            : '/images/property-card.jpg';
    };

    useEffect(() => {
        const videoArray = property?.ytVideos ? property?.ytVideos : []
        const media = [
            property.coverImage,
            ...property.images,
            ...videoArray,
        ];

        setGallery(media);
        setActiveIndex(0);
        setActiveMedia(media[0]);
    }, []);

    const changeMedia = (index: number) => {
        if (!gallery.length) return;

        const normalizedIndex =
            (index + gallery.length) % gallery.length;

        setActiveIndex(normalizedIndex);
        setActiveMedia(gallery[normalizedIndex]);
    };

    const handlePrevious = () => {
        changeMedia(activeIndex - 1);
    };

    const handleNext = () => {
        changeMedia(activeIndex + 1);
    };


    const smallMedia = [0, 1, 2].map((offset) => {
        if (!gallery.length) return null;

        const index =
            (activeIndex + offset) % gallery.length;

        return {
            src: gallery[index],
            index,
        };
    });

    return (
        <>
            <section className="section-container mt-18 lg:mt-4 flex flex-col lg:flex-row items-start lg:items-center justify-center gap-6 lg:gap-2">
                {/* Images */}
                <div className="relative w-full lg:w-auto">
                    <div className="aspect-auto">
                        {activeMedia && isVideo(activeMedia) ? (
                            <iframe
                                src={getEmbedUrl(activeMedia)}
                                title="Property video"
                                className="h-64 w-full sm:h-80 lg:w-200 lg:h-130 rounded-lg object-cover"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        ) : (
                            <img
                                src={activeMedia}
                                alt={property.title}
                                className="h-64 w-full sm:h-80 lg:w-200 lg:h-130 rounded-lg object-cover"
                            />
                        )}
                    </div>

                    <div className="absolute bottom-4 left-3 flex items-center gap-2 scale-90 origin-bottom-left sm:scale-100">
                        {/* Previous */}
                        <button
                            type="button"
                            onClick={handlePrevious}
                            aria-label="Previous media"
                            className="p-2 rounded-full bg-primary text-white cursor-pointer"
                        >
                            <FaLongArrowAltLeft />
                        </button>

                        {/* Small Media Cards */}
                        <div className="relative w-32 h-22">
                            {smallMedia.map(
                                (media, index) =>
                                    media && (
                                        <button
                                            key={`${media.src}-${media.index}`}
                                            type="button"
                                            onClick={() =>
                                                changeMedia(media.index)
                                            }
                                            aria-label={`View media ${media.index + 1}`}
                                            className={`absolute top-${index * 2} left-${index * 2} w-30 h-20 rounded-lg shadow-lg shadow-black overflow-hidden cursor-pointer ${media.index === activeIndex
                                                ? 'ring-2 ring-primary-1'
                                                : ''
                                                }`}
                                            style={{
                                                top: `${index * 8}px`,
                                                left: `${index * 8}px`,
                                            }}
                                        >
                                            {isVideo(media.src) ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={getYoutubeThumbnail(
                                                            media.src
                                                        )}
                                                        alt=""
                                                        width={120}
                                                        height={80}
                                                        className="w-full h-full object-cover"
                                                    />

                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white text-sm">
                                                            ▶
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img
                                                    src={media.src}
                                                    alt=""
                                                    width={120}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </button>
                                    )
                            )}
                        </div>

                        {/* Next */}
                        <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Next media"
                            className="p-2 rounded-full bg-primary text-white cursor-pointer"
                        >
                            <FaLongArrowAltLeft className="rotate-180" />
                        </button>
                    </div>
                </div>

                {/* Content side */}
                <div className="flex w-full flex-col items-start lg:w-auto">
                    <h1 className="my-3 text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider">
                        {property.title}
                    </h1>

                    <div className="flex items-center mb-3 gap-2">
                        <MapPin className="text-primary-1 text-base" aria-hidden="true" />

                        <span className="text-gray-1 text-base font-medium">
                            {property.location}
                        </span>
                    </div>

                    <div className="w-full max-w-[420px] md:w-100 lg:h-70 grid grid-cols-2 grid-rows-2 items-start justify-items-start gap-4 sm:gap-8 rounded-lg bg-primary p-4 sm:p-5">
                        <div className="flex items-center justify-center flex-col">
                            <img
                                src="/images/dirham-golden.png"
                                alt=""
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover"
                            />

                            <span className="text-lg sm:text-xl font-semibold font-body">
                                {priceFormat(property.price)}
                            </span>

                            <span className="text-sm sm:text-base text-gray-1">
                                Starting Price
                            </span>
                        </div>

                        <div className="flex items-center justify-center flex-col">
                            <img
                                src="/images/payment-plan.svg"
                                alt=""
                                width={44}
                                height={40}
                                className="w-11 h-10 object-cover"
                            />

                            <span className="text-lg sm:text-xl font-semibold font-body">
                                {property.paymentInstalment}
                            </span>

                            <span className="text-sm sm:text-base text-gray-1">
                                Payment Plan
                            </span>

                            <button
                                type="button"
                                onClick={gotoPaymentSection}
                                className="cursor-pointer golden-text text-xs"
                            >
                                View Plan
                            </button>
                        </div>

                        <div className="flex items-center justify-center flex-col">
                            <img
                                src="/images/handover.svg"
                                alt=""
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover"
                            />

                            <span className="text-lg sm:text-xl font-semibold font-body">
                                {property.handOver}
                            </span>

                            <span className="text-sm sm:text-base text-gray-1">
                                Hand Over
                            </span>
                        </div>

                        <div className="flex items-center justify-center flex-col">
                            <img
                                src="/images/square.svg"
                                alt=""
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover"
                            />

                            <span className="text-lg sm:text-xl font-semibold font-body">
                                {property.area} (SQFT)
                            </span>

                            <span className="text-sm sm:text-base text-gray-1">
                                Starting Price
                            </span>
                            {property.propertGroups ? (
                                <button
                                    type="button"
                                    onClick={gotoUnitsSection}
                                    className="cursor-pointer golden-text text-xs"
                                >
                                    View Units
                                </button>
                            ) : null}

                        </div>
                    </div>
                </div>
            </section>

            <section className="section-container  -mt-16 sm:-mt-20 lg:-mt-28">
                <h3 className="my-3 golden-text text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider">
                    Property Overview
                </h3>

                <div className="max-w-5xl mx-auto text-base tracking-normal lg:text-center leading-wide my-3"
                    dangerouslySetInnerHTML={createMarkup(property.description)}
                />

                <div className="pt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
                    <button
                        type="button"
                        onClick={() => setOpenBookApponModel(true)}
                        className="cursor-pointer flex flex-col items-center justify-center gap-1"
                    >
                        <img
                            src="/images/appointment.svg"
                            className="w-12 h-12 object-cover"
                            alt=""
                            width={48}
                            height={48}
                        />

                        <span className="text-lg font-semibold font-heading tracking-wide">
                            Book Appointment
                        </span>
                    </button>

                    <Link href={'/contact'} className="cursor-pointer flex flex-col items-center justify-center gap-1">
                        <img
                            src="/images/phone-call.svg"
                            className="w-12 h-12 object-cover"
                            alt=""
                            width={48}
                            height={48}
                        />

                        <span className="text-lg font-semibold font-heading tracking-wide">
                            Call For Any Queries.
                        </span>
                    </Link>
                </div>
            </section>

            <section className="section-container -mt-16 sm:-mt-20 lg:-mt-28">
                <h3 className="my-3 golden-text text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider">
                    Property Features
                </h3>

                <p className="text-base sm:text-lg font-body text-center">
                    Everything you need to know
                </p>

                <div className="flex items-start justify-center flex-wrap gap-4 mt-6 gap-x-6 gap-y-4 sm:gap-x-6 lg:gap-x-10">
                    {property?.amenities?.map((aminity, index) => {
                        const Icon = getAmenityIcon(aminity.icon)
                        return (
                            <div key={index} className="flex  items-center justify-center flex-col gap-1 text-base sm:text-lg border-golden rounded-[10px]! py-2 px-4 sm:px-8 lg:px-10">
                                <Icon className="text-primary-1" size={50} />
                                <span>{aminity.name}</span>
                            </div>
                        )
                    })}



                </div>
            </section>

            {property.paymentPlans ? (
                <section id='plan' ref={paymentPlanRef} className="section-container -mt-16 overflow-hidden sm:-mt-20 lg:-mt-28">
                    <div className="text-center">
                        <h3 className="my-3 font-heading text-2xl font-semibold tracking-wider golden-text sm:text-3xl lg:text-4xl">
                            Payment Plan
                        </h3>

                        <p className="font-body text-base sm:text-lg">
                            A Clear Path to Ownership
                        </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                        {property.paymentPlans.map((plan, planIndex) => {
                            const isActivePlan =
                                plan.planName === activePlan;

                            return (
                                <button
                                    key={planIndex}
                                    type="button"
                                    onClick={() =>
                                        setActivePlan(plan.planName)
                                    }
                                    className={`shrink-0 rounded-2xl px-4 py-1.5 font-heading text-sm font-medium tracking-wide transition-colors sm:px-5 sm:py-2 sm:text-base lg:text-lg ${isActivePlan
                                        ? 'golden-bg text-black'
                                        : 'border border-golden text-white'
                                        }`}
                                >
                                    {plan.planName}
                                </button>
                            );
                        })}
                    </div>

                    {(() => {
                        const currentPlan =
                            property.paymentPlans.find(
                                (plan) =>
                                    plan.planName === activePlan
                            );

                        if (!currentPlan?.parts?.length) return null;

                        const parts = currentPlan.parts;

                        return (
                            <>
                                {/* DESKTOP TIMELINE */}
                                <div className="mt-12 hidden w-full overflow-hidden sm:block sm:mt-16">
                                    <div className="relative mx-auto w-full max-w-6xl px-6">
                                        {parts.length > 1 && (
                                            <div className="absolute left-[calc(50px)] right-[calc(50px)] top-[68px] h-[5px] golden-bg" />
                                        )}

                                        <div className="flex items-start">
                                            {parts.map((part, index) => (
                                                <div
                                                    key={index}
                                                    className="relative flex min-w-0 flex-1 flex-col items-center"
                                                >
                                                    <span className="font-heading tracking-wide text-xl font-semibold golden-text sm:text-2xl">
                                                        {part.percentage} %
                                                    </span>

                                                    <div className="relative z-10 mt-5 top-1 h-6 w-6 shrink-0 rounded-full golden-bg" />

                                                    <h4 className="mt-5 max-w-[160px] text-center font-body text-sm font-semibold leading-tight text-white sm:text-base">
                                                        {part.partName}
                                                    </h4>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* MOBILE TIMELINE */}
                                <div className="mt-10 block sm:hidden">
                                    <div className="relative mx-auto max-w-sm">
                                        {parts.length > 1 && (
                                            <div className="absolute bottom-5 left-[11px] top-5 w-[4px] golden-bg" />
                                        )}

                                        <div className="space-y-8">
                                            {parts.map((part, index) => (
                                                <div
                                                    key={index}
                                                    className="relative flex items-start gap-5"
                                                >
                                                    <div className="relative z-10 mt-1.5 h-6 w-6 shrink-0 rounded-full golden-bg" />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-heading tracking-wide text-xl font-semibold golden-text">
                                                            {part.percentage} %
                                                        </div>

                                                        <h4 className="mt-1 font-body text-sm font-semibold leading-tight text-white">
                                                            {part.partName}
                                                        </h4>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </section>
            ) : null}


            {property.propertGroups ? (
                <section ref={unitsRef} id='units' className="section-container -mt-16 sm:-mt-20 lg:-mt-28">
                    <h3 className="my-3 text-center font-heading text-2xl font-semibold tracking-wider golden-text sm:text-3xl lg:text-4xl">
                        Property Collection
                    </h3>

                    <p className="text-center font-heading font-semibold tracking-wider text-xl sm:text-2xl">
                        Residential
                    </p>

                    {/* Desktop / Tablet */}
                    <div className="hidden md:block max-w-5xl mx-auto bg-gray-1 rounded-lg border-golden mt-6 overflow-x-auto">
                        <div className="min-w-[680px]">
                            <div className="grid grid-cols-[140px_1fr_140px_90px] items-center gap-4 border-primary-1 border-b! px-4 py-3 text-base font-heading tracking-wider">
                                <div />
                                <p>Starting Area (SQFT)</p>
                                <p>Price</p>
                                <p>Flore Plan</p>
                            </div>

                            {property?.propertGroups?.map(
                                (group, groupIndex) => (
                                    <div
                                        key={groupIndex}
                                        className={
                                            groupIndex !== 0
                                                ? 'border-t border-orange/35 pt-5'
                                                : 'pt-3'
                                        }
                                    >
                                        <div className="grid grid-cols-[140px_1fr] gap-4">
                                            <div className="flex items-start px-4 pt-5">
                                                <div>{group.name}</div>
                                            </div>

                                            <div className="space-y-2">
                                                {group?.units?.map(
                                                    (unit, unitIndex) => (
                                                        <div
                                                            key={unitIndex}
                                                            className="grid grid-cols-[1fr_140px_90px] items-center gap-4 rounded-[10px] border border-transparent px-4 py-4 transition-colors hover:border-stone text-base sm:text-lg font-body"
                                                        >
                                                            <p>
                                                                {unit.area} (SQFT)
                                                            </p>

                                                            <p>
                                                                {priceFormat(
                                                                    unit.price
                                                                )}
                                                            </p>

                                                            <button
                                                                type="button"
                                                                onClick={() => { setModalOpen(true); setActiveFloorImg(unit?.floreImage ?? null) }}
                                                                aria-label={`View floor plan for ${unit.type}`}
                                                                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-golden"
                                                            >
                                                                <FloorPlanIcon />
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Mobile */}
                    <div className="block md:hidden mt-6">
                        <div className="overflow-hidden rounded-2xl border border-golden bg-gray-1 shadow-sm">
                            <div className="divide-y divide-stone/70">
                                {property?.propertGroups?.map(
                                    (group, groupIndex) => {
                                        const isopenGroup =
                                            group.name === openGroup;

                                        return (
                                            <div key={groupIndex}>
                                                <button
                                                    onClick={() =>
                                                        setOpenGroup(
                                                            isopenGroup
                                                                ? null
                                                                : group.name ?? null
                                                        )
                                                    }
                                                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors"
                                                >
                                                    <div className="min-w-0">
                                                        <h4 className="truncate font-heading text-base font-semibold tracking-wide text-white">
                                                            {group.name}
                                                        </h4>

                                                        <span className="mt-1 inline-flex rounded-full bg-primary px-2.5 py-0.5 font-body text-xs font-medium text-white">
                                                            {group?.units?.length}{' '}
                                                            {group?.units?.length ===
                                                                1
                                                                ? 'Unit'
                                                                : 'Units'}
                                                        </span>
                                                    </div>

                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-golden bg-primary text-primary-1">
                                                        <ChevronDown
                                                            className={`h-5 w-5 transition-transform duration-300 ${isopenGroup
                                                                ? 'rotate-180'
                                                                : ''
                                                                }`}
                                                        />
                                                    </div>
                                                </button>

                                                {isopenGroup && (
                                                    <div className="space-y-3 px-4 pb-4">
                                                        {group?.units?.map(
                                                            (
                                                                unit,
                                                                unitIndex
                                                            ) => (
                                                                <div
                                                                    key={unitIndex}
                                                                    className="rounded-[10px] border border-stone bg-primary p-4 text-body"
                                                                >
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <p className="font-heading text-sm font-semibold text-charcoal">
                                                                            View
                                                                            Floor
                                                                            Plan
                                                                        </p>

                                                                        <button
                                                                            onClick={() => { setModalOpen(true); setActiveFloorImg(unit?.floreImage ?? null) }}
                                                                            type="button"
                                                                            aria-label={`View floor plan for ${unit.type}`}
                                                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone text-orange transition-colors hover:border-orange hover:bg-orange hover:text-white"
                                                                        >
                                                                            <FloorPlanIcon />
                                                                        </button>
                                                                    </div>

                                                                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-stone pt-4">
                                                                        <div>
                                                                            <p className="font-body text-[10px] font-medium uppercase tracking-[0.1em] text-text/40">
                                                                                Area
                                                                            </p>

                                                                            <p className="mt-1 font-body text-sm font-medium text-charcoal">
                                                                                {
                                                                                    unit.area
                                                                                }{' '}
                                                                                sqft
                                                                            </p>
                                                                        </div>

                                                                        <div>
                                                                            <p className="font-body text-[10px] font-medium uppercase tracking-[0.1em] text-text/40">
                                                                                Price
                                                                            </p>

                                                                            <p className="mt-1 font-body text-sm font-medium text-charcoal">
                                                                                {priceFormat(
                                                                                    unit.price
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            ) : null}


            <div className="max-w-8xl mx-auto w-full h-1 bg-gray-1" />

            <section className="section-container">
                <h3 className="my-3 text-center font-heading text-2xl font-semibold tracking-wider golden-text sm:text-3xl lg:text-4xl">
                    Location
                </h3>

                <h4 className="text-center font-heading font-semibold tracking-wider text-xl sm:text-2xl">
                    Located in {property.location}
                </h4>

                <p className="text-base sm:text-lg font-body text-center max-w-3xl mx-auto mt-3">
                    A desirable location offering convenient access to local
                    amenities, transport links, schools, and everything you
                    need for everyday living.
                </p>

                <div className="mt-6">
                    <div className="relative">
                        <div className="relative aspect-[4/5] sm:aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-stone max-w-4xl mx-auto">
                            <iframe
                                src={`https://www.google.com/maps?q=${encodeURIComponent(
                                    property?.mapQuery ?? ''
                                )}&z=15&hl=en&output=embed`}
                                className="absolute inset-0 h-full w-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`Map showing ${property.title}`}
                            />

                            <Link
                                href={property?.mapUrl ?? ''}
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
                                            {property.location}
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
                                href={property.mapUrl ?? ''}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-4 right-4 z-10 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-whit shadow-md transition-colors"
                            >
                                View on Google Maps
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-container -mt-16 sm:-mt-20 lg:-mt-28">
                <h3 className="my-3 text-center font-heading text-2xl font-semibold tracking-wider golden-text sm:text-3xl lg:text-4xl">
                    Similar Properties
                </h3>

                <div className=" pt-6">
                    <Swiper
                        modules={[Autoplay]}
                        slidesPerView={1}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 20
                            },
                            740: {
                                slidesPerView: 2,
                                spaceBetween: 20
                            },
                            1040: {
                                slidesPerView: 3,
                                spaceBetween: 20
                            }
                        }}
                        loop={true}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: true,
                            pauseOnMouseEnter: true,
                        }}

                    >
                        {similarProperties?.map((property, index) => (
                            <SwiperSlide key={property._id}>
                                <PropertyCard title={property.title} img={property.coverImage} paymentStructure={property.paymentInstalment} dld={property.dld}
                                    des={property.description} location={property.location} handover={property.handOver} type={property.category} price={property.price}
                                    slug={property.slug} />
                            </SwiperSlide>

                        ))}
                    </Swiper>


                </div>
            </section>

            <div className="max-w-8xl mx-auto w-full h-1 bg-gray-1" />
            <>
                <ModelBox size='2xl' open={openBookApponModel} onClose={() => setOpenBookApponModel(false)}>
                    <div>
                        <BookAppointmentForm handleClose={() => setOpenBookApponModel(false)} />
                    </div>
                </ModelBox>
            </>
            <>
                <ModelBox className='bg-white' size='3xl' open={modalOpen} onClose={() => { setModalOpen(false); setActiveFloorImg(null) }}>
                    <div className=' flex h-[68vh] items-center justify-center'>

                        <img src={activeFloorImg ?? ''} alt="Floor plan" className='max-h-full max-w-full object-contain' />
                    </div>
                </ModelBox>
            </>
        </ >
    );
};

export default PropertyDetails;

export function FloorPlanIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4"
            />

            <path
                strokeLinecap="round"
                d="M9 9h6v6H9z"
            />
        </svg>
    );
}