'use client';
import { FolderBookmark, MapPin, Key } from 'lucide-react'
import ItemPrice from '../ui/ItemPrice'
import { priceFormat } from '@/utils/priceFormat'
import Link from 'next/link'
import { upperCase } from '@/utils/upperCase'
import { getOptimizedImageUrl } from '@/utils/optimizeCloudinary';

interface IPropertyCard {
    paymentStructure?: string | number,
    dld?: string,
    img?: string,
    title: string,
    des: string,
    location?: string,
    handover?: string,
    type?: string,
    price: string | number,
    slug: string
}

const infoBox =
    'flex flex-col items-center justify-start gap-1 text-sm font-body border-golden rounded-lg p-2 min-w-0 text-center'
const infoText = 'w-full text-xs md:text-lg line-clamp-2 break-words leading-tight min-h-[2.5em]'

const PropertyCard = (
    { paymentStructure, dld, img, title, des, location, handover, type, price, slug }: IPropertyCard) => {
    return (
        <Link href={`/properties/${slug}`} aria-label={`View ${title}`} className='block h-full'>
            <div className='group w-full md:w-[370px] h-full flex flex-col rounded-lg border-golden p-2 bg-black/60 shadow-sm shadow-amber-50'>
                <div className='relative'>
                    {paymentStructure && (
                        <div className='absolute top-2 left-2 z-20 golden-bg text-black px-3 py-1 font-body rounded-2xl'>{paymentStructure}</div>
                    )}
                    {dld && (
                        <div className='absolute top-2 right-2 z-20 bg-primary text-white px-3 py-1 font-heading rounded-2xl'>4% DLD Waiver</div>
                    )}
                    <div className='w-full h-70 rounded-md overflow-hidden'>
                        <img
                            src={getOptimizedImageUrl(img, 370)}
                            width={740}
                            height={560}
                            loading="lazy"
                            decoding="async"
                            className='w-full h-full rounded-md object-cover transition-transform ease-in duration-500 group-hover:scale-[1.035]'
                            alt={title} />
                    </div>
                </div>

                {/* flex-1 pushes the price bar to the bottom so all cards align */}
                <div className='mt-3 flex flex-col flex-1'>
                    <h3 className='text-lg sm:text-xl font-heading tracking-normal golden-text line-clamp-1'>{title}</h3>
                    <div
                        className='text-gray-1 text-sm sm:text-base line-clamp-2 min-h-[2.75em]'
                        dangerouslySetInnerHTML={{ __html: des }} />

                    {/* 3 equal columns, so long text can't resize a box */}
                    <div className='grid grid-cols-3 gap-2 mt-3 mb-2 items-stretch'>
                        <div className={infoBox}>
                            <MapPin className='text-primary-1 shrink-0' size={16} aria-hidden="true" />
                            <span className={infoText} title={location}>{location}</span>
                        </div>
                        <div className={infoBox}>
                            <Key className='text-primary-1 shrink-0' size={16} aria-hidden="true" />
                            <span className={infoText} title={handover}>{handover}</span>
                        </div>
                        <div className={infoBox}>
                            <FolderBookmark className='text-primary-1 shrink-0' size={16} aria-hidden="true" />
                            <span className={infoText}>{upperCase(type ?? '')}</span>
                        </div>
                    </div>

                    <div className='golden-bg-bordered rounded-lg mt-auto pt-0 w-full text-black flex items-center justify-center gap-2'>
                        <span>Starting From</span>
                        <ItemPrice price={priceFormat(price)} varient='black' />
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default PropertyCard