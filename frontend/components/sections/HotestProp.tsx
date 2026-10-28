
'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, FolderBookmark, MapPin } from 'lucide-react'
import ItemPrice from '../ui/ItemPrice'
import { priceFormat } from '@/utils/priceFormat'
// import  from 'swiper';
import { SwiperSlide, Swiper } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper/types';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import "swiper/css";
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import PropertyCard from '../shared/PropertyCard';
import { IProperty } from '../types/types';

const categories = [
    { name: 'All', value: 'all' },
    { name: 'Commercial', value: 'commercial' },
    { name: 'Residential', value: 'residential' },
]

interface PropertyListProps {
    properties: IProperty[];
}

const HotestProp = (properties: PropertyListProps) => {
    const [activeCategory, setActiveCategory] = useState('all');

    const swiperRef = useRef<SwiperInstance | null>(null);

    const allProperties = useMemo(() => {
        if (activeCategory === 'all') {
            return properties.properties;
        }

        return properties.properties.filter(
            (property) => property.category?.toLowerCase() === activeCategory
        );
    }, [properties, activeCategory]);
    return (
        <>
            <div className='max-w-8xl mx-auto w-full h-1 bg-gray-1' />
            <section className='section-container relative'>
                <h2 className=' my-3 text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider'>Dubai’s <span className='golden-text'>Zoya Hottest</span> Projects Right Now</h2>
                <div className='mt-3 inline-flex items-center gap-6 rounded-2xl bg-white py-1 px-4 text-black'>
                    {categories.map((cat, index) => (
                        <div key={index} onClick={() => setActiveCategory(cat.value)}
                            className={`${activeCategory === cat.value ? 'bg-black text-white rounded-2xl px-4 py-1 border-golden border-2!' : ''} text-black cursor-pointer`}
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>

                <div className='mt-6 relative'>
                    <Swiper
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        modules={[Autoplay, Pagination]}
                        pagination={{
                            clickable: true,
                            el: ".swiper-pagination",
                        }}
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
                        onMouseEnter={() => {
                            swiperRef.current?.autoplay.stop();
                        }}
                        onMouseLeave={() => {
                            swiperRef.current?.autoplay.start();
                        }}

                        className='flex-1 min-w-0 lg:pl-6!'
                    >
                        {allProperties?.map((property, index) => (
                            <SwiperSlide key={index}>
                                <PropertyCard title={property.title} img={property.coverImage} paymentStructure={property.paymentInstalment} dld={property.dld}
                                    des={property.description} location={property.location} handover={property.handOver} type={property.category} price={property.price}
                                    slug={property.slug} />
                            </SwiperSlide>
                        ))}

                    </Swiper>
                    <div className="flex items-center justify-center gap-2 pt-3">
                        <button
                            onClick={() => swiperRef.current?.slidePrev()}
                            aria-label="Previous slide"
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                        >
                            <ChevronRight className="rotate-180 text-white" />
                        </button>

                        <div className="swiper-pagination !relative !inset-auto !w-auto !transform-none flex items-center justify-center gap-2"></div>

                        <button
                            onClick={() => swiperRef.current?.slideNext()}
                            aria-label="Next slide"
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                        >
                            <ChevronRight className="text-white" />
                        </button>
                    </div>

                </div>

            </section>
        </>
    )
}

export default HotestProp

const HotestPropertyCard = () => {
    return (
        <div className='group w-full md:w-[360px] h-auto rounded-lg p-2 md:p-4 bg-primary shadow-sm shadow-amber-50 '>
            <div className='relative'>
                <div className='absolute top-2 left-2 z-20 golden-bg text-black px-3 py-1 font-heading rounded-2xl'>40/60</div>
                <img src="/images/property-card.jpg"
                    className='w-full h-70 aspect-3/4 rounded-md object-cover transition-transform ease-in duration-500 group-hover:scale-[1.035]'
                    alt="" />
            </div>
            <div className='mt-3'>
                <div className=' my-3 w-full text-black flex flex-col items-start gap-1'>
                    <span className='text-sm text-white'>Starting From</span>
                    <ItemPrice price={priceFormat(30000)} varient='golden' />
                </div>
                <h5 className='text-lg sm:text-xl font-heading tracking-normal golden-text'>Calisi by Zoya</h5>
                <div className='flex items-center gap-1 text-sm  font-body pt-2'>
                    <MapPin className='text-xs text-primary-1' size={16} />
                    <span>Dubai Industrial City</span>
                </div>
                <div className='flex items-center gap-1 text-sm  font-body pt-2'>
                    <FolderBookmark className='text-xs text-primary-1' size={16} />
                    <span>Commercial</span>
                </div>

            </div>
        </div>
    )
}
