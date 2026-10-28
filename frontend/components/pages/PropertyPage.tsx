'use client'
import React, { useState } from 'react'
import PropertyCard from '../shared/PropertyCard'
import PropertySearch from '../shared/PropertySearch'
import { ChevronRight } from 'lucide-react'
import { IProperty } from '../types/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'


interface PageProps {
    properties: IProperty[],
    pagination: any
}

const PropertyPage = ({ properties, pagination }: PageProps) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const totalPages = Number(pagination.totalPages);
    const [pageNumber, setPageNumber] = useState(Number(pagination.currentPage))

    const handleChangePageNext = () => {
        const params = new URLSearchParams(searchParams);

        const nextPage = totalPages >= pageNumber ? 1 : pageNumber + 1
        setPageNumber(nextPage)
        params.set('page', nextPage.toString())
        router.replace(`${pathname}?${params.toString()}`)
    }

    const handleChangePagePrev = () => {
        const params = new URLSearchParams(searchParams);

        const prevPage = totalPages <= pageNumber ? totalPages : pageNumber - 1
        setPageNumber(prevPage)
        params.set('page', prevPage.toString())
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <>
            <section className="relative min-h-[600px] h-[80dvh] w-full overflow-hidden">

                {/* Background */}
                <img
                    src="/images/hero-property.png"
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                    alt="Premium property"
                />

                {/* Overlay */}
                <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0)_-80.9%,rgba(0,0,0,0.701961)_100%)]" />

                {/* Content */}
                <div className="section-container relative z-30 flex h-full  flex-col justify-center items-center text-center gap-8 pb-10 sm:pb-14 lg:pb-20">

                    {/* Heading */}
                    <div className="w-full lg:max-w-3xl">
                        <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl ">
                            <span className='golden-text border border-golden'> Discover Dubai’s Most Exclusive</span>
                            <span className='golden-text border border-golden'>{' '} Luxury Properties</span>

                        </h1>

                        <p className="max-w-2xl pt-3 font-body text-base tracking-tight text-white sm:text-lg md:text-white">
                            Explore handpicked architectural masterpieces, elite waterfront villas, and high-yield branded residences tailored for the global elite.
                        </p>
                    </div>
                    <div>
                        <PropertySearch />
                    </div>
                </div>
            </section>
            <div className='max-w-8xl mx-auto w-full h-1 bg-gray-1' />
            <section className='section-container'>
                <div>
                    <h1 className='golden-text text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider'>Find your Dream Home Today <br className='hidden md:block' /> Subscribe to our newsletter</h1>

                    <p className='text-base my-4 sm:text-lg text-gray-1 text-center max-w-3xl mx-auto'>Subscribe to our newsletters to get  the latest updates, design insights, and exclusive offers delivered straight to your inbox.</p>
                </div>
                <div className='mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 gap-y-5'>
                    {properties.map((property, index) => (
                        <div key={property._id}>
                            <PropertyCard title={property.title} img={property.coverImage} paymentStructure={property.paymentInstalment} dld={property.dld}
                                des={property.description} location={property.location} handover={property.handOver} type={property.category} price={property.price}
                                slug={property.slug}
                            />
                        </div>
                    ))}

                </div>
                {totalPages > 6 && (
                    <div className="flex items-center justify-center gap-2 pt-3">
                        <button
                            onClick={handleChangePagePrev}
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                        >
                            <ChevronRight className="rotate-180 text-white" />
                        </button>

                        <div className='flex items-center justify-center gap-1'>
                            {Array.from({ length: totalPages }).map((a, i) => (
                                <div key={i} className={`text-white bg-white w-2 h-2 rounded-full ${pageNumber === (i + 1) && 'golden-bg w-4 rounded-[10px]'}`} />
                            ))}
                        </div>

                        <button
                            onClick={handleChangePageNext}
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                        >
                            <ChevronRight className="text-white" />
                        </button>
                    </div>
                )}

            </section>

        </>
    )
}

export default PropertyPage