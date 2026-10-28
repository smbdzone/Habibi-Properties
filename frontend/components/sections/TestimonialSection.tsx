"use client";

import { ChevronRight } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { ITestimonial } from "../types/types";

interface Custom3DCarouselProps {
    slides: ITestimonial[];
}

interface VideoCardProps {
    slide: ITestimonial;
    isActive: boolean;
    onPlay: (id: string) => void;
    onEnd: (id: string) => void;
    registerRef: (id: string, ref: HTMLVideoElement | null) => void;
}

interface TestimonialListProps {
    testimonials: ITestimonial[];
}

const TestimonialSection = (testimonials: TestimonialListProps) => {
    return (
        <>
            <div className="max-w-8xl mx-auto w-full h-1 bg-gray-1" />

            <section className="section-container relative">
                <div>
                    <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider">
                        Trusted by the people
                    </h2>

                    <p className="my-6 text-base sm:text-lg text-gray-1 text-center max-w-3xl mx-auto">
                        Every property journey is different. Here is what some of my
                        clients have to say about working together.
                    </p>
                </div>

                <div className="mt-3">
                    <Custom3DCarousel testimonials={testimonials.testimonials} />
                </div>
            </section>
        </>
    );
};

export default TestimonialSection;

function Custom3DCarousel({
    testimonials,
}: {
    testimonials: ITestimonial[];
}) {
    if (!testimonials.length) return null;

    const total = testimonials.length;

    const [activeIndex, setActiveIndex] = useState(0);
    const [playingId, setPlayingId] = useState<string | null>(null);

    const autoplayRef = useRef<NodeJS.Timeout | null>(null);

    // ---- Drag state ----
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const startXRef = useRef(0);
    const currentXRef = useRef(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const isSwipingRef = useRef(false);

    // Video refs map
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    // ----- Autoplay Control -----
    const startAutoplay = useCallback(() => {
        if (autoplayRef.current) {
            clearInterval(autoplayRef.current);
        }

        if (playingId !== null) return;
        if (isDragging) return;

        autoplayRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % total);
        }, 3000);
    }, [playingId, total, isDragging]);

    const stopAutoplay = useCallback(() => {
        if (autoplayRef.current) {
            clearInterval(autoplayRef.current);
            autoplayRef.current = null;
        }
    }, []);

    useEffect(() => {
        startAutoplay();

        return () => stopAutoplay();
    }, [startAutoplay, stopAutoplay]);

    // Restart autoplay when dragging ends
    useEffect(() => {
        if (!isDragging && playingId === null) {
            startAutoplay();
        } else {
            stopAutoplay();
        }
    }, [
        isDragging,
        playingId,
        startAutoplay,
        stopAutoplay,
    ]);

    // ----- Video Handlers -----
    const registerVideoRef = (
        id: string,
        ref: HTMLVideoElement | null
    ) => {
        if (ref) {
            videoRefs.current.set(id, ref);
        } else {
            videoRefs.current.delete(id);
        }
    };

    const pauseVideo = (id: string) => {
        const video = videoRefs.current.get(id);

        if (video && !video.paused) {
            video.pause();
        }
    };

    const handleVideoPlay = (id: string) => {
        if (playingId && playingId !== id) {
            pauseVideo(playingId);
        }

        setPlayingId(id);
        stopAutoplay();
    };

    const handleVideoEnd = (id: string) => {
        if (playingId === id) {
            setPlayingId(null);

            setTimeout(() => startAutoplay(), 500);
        }
    };

    // ----- Navigation -----
    const goToPrev = () => {
        setActiveIndex(
            (prev) => (prev - 1 + total) % total
        );

        if (playingId === null) {
            startAutoplay();
        }
    };

    const goToNext = () => {
        setActiveIndex(
            (prev) => (prev + 1) % total
        );

        if (playingId === null) {
            startAutoplay();
        }
    };

    // ----- Drag Handlers -----
    const handlePointerDown = (
        e: React.PointerEvent
    ) => {
        const target = e.target as HTMLElement;

        if (
            target.closest("video") ||
            target.closest("button")
        ) {
            return;
        }

        setIsDragging(true);
        isSwipingRef.current = false;

        startXRef.current = e.clientX;
        currentXRef.current = e.clientX;

        setDragOffset(0);
        stopAutoplay();

        if (containerRef.current) {
            containerRef.current.style.userSelect = "none";
        }
    };

    const handlePointerMove = (
        e: React.PointerEvent
    ) => {
        if (!isDragging) return;

        const deltaX =
            e.clientX - startXRef.current;

        if (Math.abs(deltaX) > 5) {
            isSwipingRef.current = true;
        }

        setDragOffset(deltaX);
        currentXRef.current = e.clientX;
    };

    const handlePointerUp = (
        e: React.PointerEvent
    ) => {
        if (!isDragging) return;

        setIsDragging(false);

        const deltaX =
            currentXRef.current - startXRef.current;

        const threshold = 80;

        if (
            Math.abs(deltaX) > threshold &&
            isSwipingRef.current
        ) {
            if (deltaX < 0) {
                goToNext();
            } else {
                goToPrev();
            }
        }

        setDragOffset(0);
        isSwipingRef.current = false;

        if (containerRef.current) {
            containerRef.current.style.userSelect = "";
        }
    };

    const handlePointerLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            setDragOffset(0);
            isSwipingRef.current = false;

            if (containerRef.current) {
                containerRef.current.style.userSelect = "";
            }

            startAutoplay();
        }
    };

    // ----- Render Slides -----
    const getSlideStyle = (index: number) => {
        let offset = index - activeIndex;

        if (offset > total / 2) {
            offset -= total;
        }

        if (offset < -total / 2) {
            offset += total;
        }

        const absOffset = Math.abs(offset);

        const scale = 1 - absOffset * 0.15;
        const opacity = 1 - absOffset * 0.25;

        const baseTranslateX = offset * 280;

        const translateX =
            baseTranslateX +
            (isDragging ? dragOffset : 0);

        const zIndex = total - absOffset;
        const rotateY = offset * 10;

        const transition = isDragging
            ? "none"
            : "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.6s ease";

        return {
            transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
            opacity: Math.max(0, opacity),
            zIndex: Math.round(zIndex),
            transition,
        };
    };

    return (
        <div
            className="relative w-full overflow-hidden py-10"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            ref={containerRef}
            style={{ touchAction: "none" }}
            role="region"
            aria-label="Testimonials carousel"
        >
            {/* Carousel Track */}
            <div className="relative flex justify-center items-center h-[470px]">
                {testimonials.map((slide, index) => {
                    const isActive =
                        index === activeIndex;

                    const style =
                        getSlideStyle(index);

                    return (
                        <div
                            key={slide._id}
                            className="absolute top-0 w-[320px] h-full"
                            style={style}
                        >
                            <VideoCard
                                slide={slide}
                                isActive={isActive}
                                onPlay={handleVideoPlay}
                                onEnd={handleVideoEnd}
                                registerRef={
                                    registerVideoRef
                                }
                            />
                        </div>
                    );
                })}
            </div>

            {/* Navigation Buttons */}
            {total > 1 && (
                <div className="hidden md:flex absolute top-1 right-4 z-30 items-center gap-2">
                    <button
                        onClick={goToPrev}
                        className="z-30 flex h-11 w-11 items-center justify-center rounded-full bg-orange text-white golden-bg shadow-lg transition-all hover:scale-110 hover:text-black"
                        aria-label="Previous"
                    >
                        <span className="text-lg leading-none">
                            <ChevronRight className="rotate-180" />
                        </span>
                    </button>

                    <button
                        onClick={goToNext}
                        className="z-30 flex h-11 w-11 items-center justify-center rounded-full bg-orange text-white golden-bg shadow-lg transition-all hover:scale-110 hover:text-black"
                        aria-label="Next"
                    >
                        <span className="text-lg leading-none">
                            <ChevronRight />
                        </span>
                    </button>
                </div>
            )}

            {/* Dots indicator */}
            {total > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {/* Dots can be added here */}
                </div>
            )}
        </div>
    );
}

function VideoCard({
    slide,
    isActive,
    onPlay,
    onEnd,
    registerRef,
}: VideoCardProps) {
    const videoRef =
        useRef<HTMLVideoElement>(null);

    const containerRef =
        useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] =
        useState(false);

    const [shouldLoadVideo, setShouldLoadVideo] =
        useState(false);

    // Lazy-load video when card gets close
    useEffect(() => {
        const element = containerRef.current;

        if (
            !element ||
            !slide.video ||
            shouldLoadVideo
        ) {
            return;
        }

        const observer =
            new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setShouldLoadVideo(true);
                        observer.disconnect();
                    }
                },
                {
                    root: null,
                    rootMargin: "600px",
                    threshold: 0.01,
                }
            );

        observer.observe(element);

        return () => observer.disconnect();
    }, [
        slide.video,
        shouldLoadVideo,
    ]);

    // Register/unregister video ref
    useEffect(() => {
        const ref = videoRef.current;

        registerRef(slide._id, ref);

        return () =>
            registerRef(slide._id, null);
    }, [
        slide._id,
        registerRef,
        shouldLoadVideo,
    ]);

    // Force-pause if card becomes inactive
    useEffect(() => {
        if (
            !isActive &&
            videoRef.current &&
            !videoRef.current.paused
        ) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const handlePlay = async () => {
        if (
            !isActive ||
            !videoRef.current
        ) {
            return;
        }

        try {
            await videoRef.current.play();

            setIsPlaying(true);
            onPlay(slide._id);
        } catch (error) {
            console.error(
                "Video play failed:",
                error
            );
        }
    };

    const handlePause = () => {
        if (!videoRef.current) return;

        videoRef.current.pause();
        setIsPlaying(false);
    };

    const handleVideoClick = () => {
        if (!isActive) return;

        isPlaying
            ? handlePause()
            : handlePlay();
    };

    return (
        <div
            ref={containerRef}
            className="group relative h-[470px] w-full max-w-sm overflow-hidden rounded-[10px] bg-charcoal shadow-[0_15px_50px_rgba(0,0,0,0.2)]"
        >
            {slide.video &&
                shouldLoadVideo && (
                    <video
                        ref={videoRef}
                        src={slide.video}
                        playsInline
                        preload="metadata"
                        aria-label={`Testimonial video from ${slide.name}`}
                        onEnded={() => {
                            setIsPlaying(false);
                            onEnd(slide._id);
                        }}
                        onPause={() =>
                            setIsPlaying(false)
                        }
                        onPlay={() => {
                            setIsPlaying(true);
                            onPlay(slide._id);
                        }}
                        onClick={
                            handleVideoClick
                        }
                        className={`h-full w-full bg-charcoal object-cover md:object-cover ${isActive
                            ? "cursor-pointer"
                            : "cursor-default"
                            }`}
                    />
                )}

            {!isPlaying &&
                slide.video &&
                isActive && (
                    <button
                        type="button"
                        onClick={handlePlay}
                        aria-label="Play video"
                        className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full golden-bg shadow-xl transition-all duration-300 hover:scale-110 hover:bg-charcoal"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="ml-1 h-7 w-7 text-white"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                )}

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 bg-primary px-6 pb-5 pt-6">
                <div
                    className="mb-2 flex items-center gap-1"
                    role="img"
                    aria-label={`Rating: ${slide.rating} out of 5`}
                >
                    {Array.from({
                        length: 5,
                    }).map((_, index) => (
                        <svg
                            key={index}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                            className={`h-3.5 w-3.5 ${index <
                                slide.rating
                                ? "text-primary-1"
                                : "text-white/20"
                                }`}
                        >
                            <path d="M12 2.5l2.94 5.95 6.56.95-4.75 4.63 1.12 6.54L12 17.48l-5.87 3.09 1.12-6.54L2.5 9.4l6.56-.95L12 2.5z" />
                        </svg>
                    ))}
                </div>

                {slide.name && (
                    <p className="font-heading text-lg font-semibold tracking-wide text-charcoal">
                        {slide.name}
                    </p>
                )}

                <p className="mt-0.5 font-body text-sm tracking-wide golden-text">
                    {slide.company}
                </p>
            </div>
        </div>
    );
}