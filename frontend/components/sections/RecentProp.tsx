'use client';
import React from 'react'
import PropertyCard from '../shared/PropertyCard'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import "swiper/css";
import 'swiper/css/autoplay';
import { IProperty } from '../types/types';

interface PropertyListProps {
    properties: IProperty[];
}
const RecentProp = (properties: PropertyListProps) => {
    const allProperties = properties.properties
    return (
        <>
            <div className='max-w-8xl mx-auto w-full h-1 bg-gray-1' />

            <section className='section-container relative'>
                <img src="/images/blob-right.png" alt="" className='hidden lg:absolute absolute top-1 -right-8 w-40 overflow-y-hidden' />
                <div>
                    <h1 className='text-white text-center text-2xl sm:text-3xl lg:text-5xl font-heading font-semibold tracking-wider'>Our Recent</h1>
                    <h2 className=' my-3 golden-text text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider'>Properties in UAE</h2>
                    <p className='text-base sm:text-lg text-gray-1 text-center max-w-5xl mx-auto'>UAE Real estate is hitting record highs. With high rental yields, tax-free returns, and premium new launches, it’s the perfect time to secure you next high-ROI property. </p>
                </div>

                <div className='mt-4 lg:mt-10 relative'>
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

                    // className='flex-1 min-w-0 md:pl-6!'
                    >
                        {allProperties.map((property, index) => (
                            <SwiperSlide>
                                <PropertyCard title={property.title} img={property.coverImage} paymentStructure={property.paymentInstalment} dld={property.dld}
                                    des={property.description} location={property.location} handover={property.handOver} type={property.category} price={property.price}
                                    slug={property.slug}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

            </section>
        </>
    )
}

export default RecentProp