'use client'
import Link from 'next/link'
import React, { useRef } from 'react'
// import  from 'swiper';
import { SwiperSlide, Swiper } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper/types';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import "swiper/css";
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import { ChevronRight } from 'lucide-react';
import { IBlog } from '../types/types';
import { getOptimizedImageUrl } from '@/utils/optimizeCloudinary';
import { formatDate } from '@/utils/formatDate';

interface PropertyListProps {
    blogs: IBlog[];
}

const BlogsSection = (blogs: PropertyListProps) => {
    const allBlogs = blogs.blogs;
    const swiperRef = useRef<null | SwiperInstance>(null)
    return (
        <>
            <div className='max-w-8xl mx-auto w-full h-1 bg-gray-1' />
            <section className='section-container relative'>
                <div>
                    <h1 className='text-white text-center text-2xl sm:text-3xl lg:text-5xl font-heading font-semibold tracking-wider'>Real Estate</h1>
                    <h2 className=' my-3 golden-text text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider'>Insights & Regulations</h2>
                    <p className='text-base sm:text-lg text-gray-1 text-center max-w-5xl mx-auto'>Stay updated with the latest real estate news. Explore to make informed decisions for your next move! </p>
                </div>
                <div className='mt-6 relative'>
                    <Swiper
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
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
                                spaceBetween: 10
                            }
                        }}
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

                        className='flex-1 min-w-0 md:pl-6! overflow-y-auto! md:h-[500px] lg:h-[450px]!'
                    >
                        {allBlogs.map((blog, index) => (
                            <SwiperSlide key={index}>
                                <BlogCard title={blog.title} img={blog.image} date={blog.date} des={blog.excerpt} slug={blog.slug} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="flex items-center justify-center gap-2 pt-3">
                        <button
                            onClick={() => swiperRef.current?.slidePrev()}
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                        >
                            <ChevronRight className="rotate-180 text-white" />
                        </button>

                        <button
                            onClick={() => swiperRef.current?.slideNext()}
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

export default BlogsSection


const BlogCard = ({ img, date, title, des, slug }:
    { img: string, date: string, title: string, des: string, slug: string }) => {
    return (
        <Link href={`/blog/${slug}`} aria-label={`Read: ${title}`}>
            <div className='w-full md:w-[520px] relative blog-card'>
                <div className='relative w-full '>
                    <img src={getOptimizedImageUrl(img, 700)}
                        width={720}
                        height={480}
                        loading="lazy"
                        decoding="async"
                        alt={title}
                        className='w-full md:w-[360px] object-cover max-h-60 lg:max-h-80 rounded-lg z-0!' />
                    <div className='md:absolute left-40 top-22 bg-primary/50 backdrop-blur-3xl p-4 rounded-lg'>
                        <div>{formatDate(date)}</div>
                        <h3 className='golden-text text-lg md:text-2xl font-medium tracking-tight font-heading'>{title}</h3>
                        <p className='mb-2 line-clamp-3 md:line-clamp-6'>{des}</p>
                        <span className='inline px-2 py-1 my-3 bg-white text-black rounded-lg font-medium font-heading'>Read More</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}