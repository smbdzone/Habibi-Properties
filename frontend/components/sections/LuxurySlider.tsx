'use client';
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import ItemPrice from '../ui/ItemPrice'
import GoldenButton from '../shared/GoldenButton'
// import  from 'swiper';
import { SwiperSlide, Swiper, useSwiper } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

import "swiper/css";
import 'swiper/css/autoplay';
import { ChevronRight } from 'lucide-react';
import type { Swiper as SwiperInstance } from 'swiper/types';
import { priceFormat } from '@/utils/priceFormat';
import { getOptimizedImageUrl } from '@/utils/optimizeCloudinary';
import { IProperty } from '../types/types';
import ModelBox from '../ui/ModelBox';
import BookAppointmentForm from '../forms/BookAppointmentForm';

interface PropertyListProps {
    properties: IProperty[];
}

const LuxurySlider = (properties: PropertyListProps) => {
    const allProperties = properties.properties;
    const swiperRef = useRef<null | SwiperInstance>(null)

    return (
        <section className='section-container relative'>
            <img src="/images/blob.png" alt="" className='absolute top-1/2 -left-12 w-50' />
            <div>
                <h1 className='text-white text-center text-2xl sm:text-3xl lg:text-5xl font-heading font-semibold tracking-wider'>Most Luxury</h1>
                <h2 className=' my-3 golden-text text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider'>The pinnacle of luxury in the UAE.</h2>
                <p className='text-base sm:text-lg text-gray-1 text-center max-w-5xl mx-auto'>expensive ultra luxury living with the UAE’s most exclusive branded residences and elite waterfront villas. designed for the global elite, these premoer properties offer unmaatched architectural masterpiece, private amenities, and a legendary lifestyle. </p>
            </div>
            <div className='flex items-end gap-2 lg:hidden pt-3 justify-end'>
                <div onClick={() => swiperRef.current?.slidePrev()} className='golden-bg flex items-center justify-center p-2 h-10 w-10 rounded-full'><ChevronRight className='text-lg font-extrabold font-heading rotate-180 text-white' /></div>

                <div onClick={() => swiperRef.current?.slideNext()} className='golden-bg flex items-center justify-center p-2 h-10 w-10 rounded-full'><ChevronRight className='text-lg font-extrabold font-heading text-white' /></div>
            </div>
            <div className='mt-4 lg:mt-10 flex items-center gap-4'>
                {/* <div onClick={() => swiperRef.current?.slidePrev()} className='hidden lg:flex golden-bg  items-center justify-center p-2 h-10 w-10 rounded-full'><ChevronRight className='text-lg font-extrabold font-heading rotate-180 text-white' /></div> */}
                {/* <Swiper
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    modules={[Autoplay]}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: true,
                    }}
                    onMouseEnter={() => {
                        swiperRef.current?.autoplay.stop();
                    }}
                    onMouseLeave={() => {
                        swiperRef.current?.autoplay.start();
                    }}
                    className='flex-1 min-w-0'
                > */}
                {allProperties.slice(0, 1).map((property, index) => (
                    // <SwiperSlide>
                    <PropertySliderCard key={index} img={property?.coverImage ?? ''} title={property.title}
                        price={property.price} des={property.description} slug={property.slug} id={property._id} type={property.type}
                    />
                ))}
                {/* </SwiperSlide> */}




                {/* </Swiper> */}
                {/* <div onClick={() => swiperRef.current?.slideNext()} className='golden-bg hidden lg:flex items-center justify-center p-2 h-10 w-10 rounded-full'><ChevronRight className='text-lg font-extrabold font-heading text-white' /></div> */}
            </div>
        </section>
    )
}

export default LuxurySlider


const PropertySliderCard = (
    { img, title, price, type, des, slug }:
        { img: string, title: string, price: string | number, type: string, des: string, slug: string, id: string }) => {
    const [openModal, setOpenModal] = useState<boolean>(false)
    return (
        <>
            <div className='grid grid-cols-1 gap-2 sm:gap-4 lg:gap-8 md:grid-cols-[0.75fr_1.25fr] max-w-5xl mx-auto'>
                <div className='relative w-full  aspect-[4/3] md:aspect-[4/3] lg:aspect-[5/4]'>
                    <img
                        src={getOptimizedImageUrl(img, 693, 520)}
                        alt=''
                        loading='lazy'
                        className='w-full  h-full rounded-lg transition-transform duration-700 ease-in hover:scale-[1.035]'
                    />
                </div>
                <div>
                    <h2 className='text-xl sm:text-2xl lg:text-3xl font-heading leading-tight text-white'>{title}</h2>

                    <div className='flex items-center gap-2 pt-3'>
                        <span className='text-sm text-gray-1 tracking-wider'>Price:</span>
                        <div className='pt-0'><ItemPrice price={priceFormat(price)} /> </div>
                    </div>

                    <div className='flex items-center gap-2 pt-3'>
                        <span className='text-sm text-gray-1 tracking-wider'>Property Type:</span>
                        <h3 className='text-lg lg:text-xl font-heading font-semibold tracking-tight golden-text'>{type}</h3>
                    </div>
                    <div className='text-base sm:text-lg text-gray-1 pt-3 mx-auto line-clamp-5' dangerouslySetInnerHTML={{ __html: des }} />

                    <div className='pt-4 flex items-center gap-2 flex-wrap'>
                        <GoldenButton text='View Details' href={`/properties/${slug}`} />
                        <GoldenButton text='Book Appointment' varient='black' handleClick={() => setOpenModal(true)} />
                    </div>
                </div>
            </div>

            <ModelBox size='2xl' open={openModal} onClose={() => { setOpenModal(false) }} >
                <BookAppointmentForm handleClose={() => { setOpenModal(false) }} />
            </ModelBox>
        </>
    )
}

const LuxuryPropertySlider = (slides: any[]) => {
    const [current, setCurrent] = useState(1);
    const [transition, setTransition] = useState(false)
    const totalSlides = slides.length;
    const sliderItems = [
        slides[slides.length - 1],
        ...slides,
        slides[0]
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => prev + 1)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div>

        </div>
    )
}