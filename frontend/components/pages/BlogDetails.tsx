'use client';
import React, { useRef } from 'react'
import BlogCommentForm from '../forms/BlogCommentForm'
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper/types';
import { Autoplay } from 'swiper/modules';

import "swiper/css";
import 'swiper/css/autoplay';
import { IBlog, IComment } from '../types/types';
import { formatDate } from '@/utils/formatDate';
import Link from 'next/link';

interface IBlogDetails {
    blog: IBlog,
    allBlog: IBlog[],
    comments: IComment[]
}

const BlogDetails = ({ blog, allBlog, comments }: IBlogDetails) => {
    const blogDetails = blog
    const swiperRef = useRef<null | SwiperInstance>(null)
    return (
        <>
            <section className='section-container max-w-5xl! mx-auto flex items-center justify-center mt-18 md:mt-12 lg:mt-6 '>
                <div className='flex flex-col items-center justify-center gap-2'>
                    <div className='flex items-center justify-between! w-full '>
                        <div className='flex items-center golden-bg rounded-2xl px-2 py-1 shrink-0 gap-2 text-black'>
                            <div className='w-2 h-2 rounded-full bg-black' />
                            <p>{blogDetails.category}</p>
                            <div className='w-2 h-2 rounded-full bg-black' />
                        </div>
                        <div className='text-sm text-gray-1'>{formatDate(blogDetails.date)}</div>
                    </div>
                    <h3 className='text-lg sm:text-xl lg:text-2xl font-semibold text-center text-white font-heading tracking-wider max-w-2xl'>{blogDetails.title}</h3>

                    <img src={blogDetails.image} alt=""
                        className='w-full max-h-[400px] rounded-lg object-cover mt-2'
                    />
                </div>

            </section>
            <div className="max-w-8xl mx-auto w-full h-1 bg-gray-1" />
            <section className='flex flex-col md:flex-row gap-4 items-start justify-between section-container'>
                <div className='flex-1' dangerouslySetInnerHTML={{ __html: blogDetails.content }} />


                <div className='w-full md:w-90 lg:w-122 sticky top-33'>
                    <div className='flex-1 flex flex-col items-start '>
                        <h3 className='my-3 golden-text text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider'>Latest Post</h3>
                        <div className='flex flex-col gap-4'>
                            {allBlog.slice(0, 3).map((blog, index) => (
                                <Link href={`/blog/${blog.slug}`} key={blog._id} className='flex items-start gap-2'>
                                    <img src={blog.image} alt=""
                                        className='w-40 h-25 object-cover rounded-lg'
                                    />
                                    <div className='h-full min-h-[100px] flex flex-col items-start justify-between'>
                                        <h3 className='text-base sm:text-lg lg:text-xl font-heading font-medium tracking-wide line-clamp-2'>{blog.title}</h3>
                                        <div className='flex  items-center justify-between'>
                                            <div className='w-26 text-sm text-gray-1'>{formatDate(blog.date)}</div>
                                            <div className='flex md:hidden lg:flex items-center  rounded-2xl px-2 py-1  gap-2 shrink-0'>
                                                <div className='w-2 h-2 rounded-full golden-bg' />
                                                <p className='text-gray-1 text-sm'>{blog.category}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                        </div>
                    </div>
                </div>
            </section>
            <div className="max-w-8xl mx-auto w-full h-1 bg-gray-1" />
            <section className='section-container'>
                <BlogCommentForm id={blogDetails._id} />
                <div className='max-w-2xl mx-auto mt-8 flex flex-col gap-8'>
                    {comments.map((comment, index) => (
                        <div key={comment._id}>
                            <div className='flex items-start gap-2'>
                                <div className='py-4 px-6 rounded-full bg-primary text-white'>{comment.name.slice(0, 1)}</div>
                                <div>
                                    <span className='text-lg font-heading text-white tracking-wide font-semibold'>{comment.name}</span>
                                    <p className='text-base text-gray-1'>{comment.comment}</p>

                                </div>

                            </div>
                            <div className='h-0.5 w-full bg-primary mt-2' />
                        </div>
                    ))}


                </div>
            </section>
            <div className="max-w-8xl mx-auto w-full h-1 bg-gray-1" />
            <section className="section-container">
                <div className="relative">
                    <Swiper
                        modules={[Autoplay]}
                        slidesPerView={1}
                        spaceBetween={20}
                        loop={allBlog.length > 3}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="w-full"
                    >
                        {allBlog.map((blog) => (
                            <SwiperSlide key={blog._id} className="!h-auto">
                                <Link
                                    href={`/blog/${blog.slug}`}
                                    className="block rounded-xl p-2 group"
                                >
                                    <div className="relative">
                                        {/* no fixed height, no object-cover: full image always shows */}
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            loading="lazy"
                                            className="block w-full h-auto rounded-xl"
                                        />

                                        {blog.category && (
                                            <span className="absolute top-3 left-3 golden-bg text-black text-xs font-medium px-3 py-1 rounded-full">
                                                {blog.category}
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="text-base sm:text-lg font-heading font-medium tracking-wide mt-3 min-h-[3.5rem] line-clamp-2 group-hover:golden-text transition-colors">
                                        {blog.title}
                                    </h4>

                                    <div className="text-sm text-gray-1 mt-1">
                                        {formatDate(blog.date ?? "")}
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
        </>
    )
}

export default BlogDetails