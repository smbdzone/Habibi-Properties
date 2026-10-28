'use client';
import React, { useMemo, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper/types';
import Link from 'next/link';
import { IBlog } from '../types/types';
import { formatDate } from '@/utils/formatDate';

import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';

interface BlogListProps {
    blogs: IBlog[];
}

/**
 * Section 1 — Featured post split in half: image on one side, category
 * badge + title + excerpt + "Read more" button on the other.
 *
 * Section 2 — "All articles": category filters sit in a column on the
 * right, the blog cards run as a Swiper slider on the left, filtered by
 * whichever category is selected. Swiper is re-keyed on filter change so
 * it resets to the first slide with the new slide count.
 *
 * Note: swap `blog.excerpt` below for whatever field your IBlog type
 * actually uses for the short description (e.g. `blog.description`).
 */
const BlogPage = ({ blogs: allBlogs }: BlogListProps) => {
    const featuredBlog = allBlogs.find((b) => b.featured) ?? allBlogs[0];
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const swiperRef = useRef<null | SwiperInstance>(null);

    const categories = useMemo(() => {
        const set = new Set(allBlogs.map((b) => b.category).filter(Boolean));
        return ['All', ...Array.from(set)];
    }, [allBlogs]);

    const sliderBlogs = useMemo(() => {
        const rest = allBlogs;
        // .filter((b) => b._id !== featuredBlog?._id);
        return activeCategory === 'All'
            ? rest
            : rest.filter((b) => b.category === activeCategory);
    }, [allBlogs, activeCategory, featuredBlog]);

    return (
        <>
            {/* Section 1 — Featured, split image / content */}
            {featuredBlog && (
                <section className="section-container mt-18 lg:mt-10">
                    <Link
                        href={`/blog/${featuredBlog.slug}`}
                        className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-10 bg-primary rounded-2xl p-4 lg:p-6 group"
                    >
                        <div className="flex-1">
                            <img
                                src={featuredBlog.image}
                                alt={featuredBlog.title}
                                className="w-full h-64 lg:h-full rounded-xl object-cover"
                            />
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            {featuredBlog.category && (
                                <div className="inline-flex items-center golden-bg rounded-2xl px-3 py-1 w-fit gap-2 text-black">
                                    <div className="w-2 h-2 rounded-full bg-black" />
                                    <p className="text-sm font-medium">{featuredBlog.category}</p>
                                </div>
                            )}

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wide mt-4">
                                {featuredBlog.title}
                            </h1>

                            {featuredBlog.excerpt && (
                                <p className="text-gray-1 mt-4 line-clamp-3 max-w-xl">
                                    {featuredBlog.excerpt}
                                </p>
                            )}

                            <div className="flex items-center gap-4 mt-6">
                                <span className="text-sm text-gray-1">
                                    {formatDate(featuredBlog.date ?? featuredBlog.createdAt ?? '')}
                                </span>
                                <span className="golden-bg text-black text-sm font-medium px-5 py-2 rounded-full inline-flex items-center gap-2 group-hover:gap-3 transition-all w-fit">
                                    Read more <span aria-hidden>&rarr;</span>
                                </span>
                            </div>
                        </div>
                    </Link>
                </section>
            )}

            <div className="max-w-8xl mx-auto w-full h-1 bg-gray-1 mt-10" />

            {/* Section 2 — filters on the right, slider on the left */}
            <section className="section-container mt-10 mb-16">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wide mb-6">
                    All Articles
                </h3>

                <div className="flex flex-col-reverse lg:flex-row gap-8">
                    {/* Slider */}
                    <div className="flex-1 min-w-0 relative">
                        {sliderBlogs.length > 0 ? (
                            <Swiper
                                key={activeCategory}
                                onSwiper={(swiper) => {
                                    swiperRef.current = swiper;
                                }}
                                modules={[Autoplay]}
                                slidesPerView="auto"
                                spaceBetween={24}
                                loop={sliderBlogs.length > 2}
                                autoplay={{ delay: 3000, disableOnInteraction: true }}

                                onMouseEnter={() => swiperRef.current?.autoplay.stop()}
                                onMouseLeave={() => swiperRef.current?.autoplay.start()}
                                className="!pb-2"
                            >
                                {sliderBlogs.map((blog) => (
                                    <SwiperSlide key={blog._id} className="!w-[280px] sm:!w-[320px]">
                                        <Link href={`/blog/${blog.slug}`} className="block rounded-xl p-2 group">
                                            <div className="relative">
                                                <img
                                                    src={blog.image}
                                                    alt={blog.title}
                                                    className="block w-full h-auto rounded-xl"
                                                />
                                                {blog.category && (
                                                    <span className="absolute top-3 left-3 golden-bg text-black text-xs font-medium px-3 py-1 rounded-full">
                                                        {blog.category}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-base sm:text-lg font-heading font-medium tracking-wide mt-3 h-13 sm:h-14 line-clamp-2 group-hover:golden-text transition-colors">
                                                {blog.title}
                                            </h4>
                                            <div className="text-sm text-gray-1 mt-1">
                                                {formatDate(blog.date ?? '')}
                                            </div>
                                        </Link>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            <p className="text-gray-1 py-16">No articles in this category yet.</p>
                        )}
                    </div>

                    {/* Category filters */}
                    <aside className="lg:w-48 flex-shrink-0">
                        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible lg:sticky lg:top-24">
                            <p className="hidden lg:block text-sm text-gray-1 mb-1 tracking-wide">
                                Filter by topic
                            </p>
                            {categories.map((cat) => {
                                const active = cat === activeCategory;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`whitespace-nowrap text-left px-4 py-2 rounded-full lg:rounded-lg text-sm font-medium transition-colors duration-200 ${active
                                            ? 'golden-bg text-black'
                                            : 'border border-gray-1 lg:border-0 text-gray-1 hover:golden-text'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
};

export default BlogPage;