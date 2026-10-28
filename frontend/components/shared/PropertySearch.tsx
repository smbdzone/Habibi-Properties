'use client'

import React, { useEffect, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { fetchPropertiesLocations } from '@/lib/actions'
import { upperCase } from '@/utils/upperCase'

type Option = {
    label: string;
    value: string;
};

const locationOption: Option[] = [
    { label: 'Abu Dhabi', value: 'abu-dhabi' },
    { label: 'Dubai', value: 'dubai' },
    { label: 'Sharjah', value: 'sharjah' },
    { label: 'Ajman', value: 'ajman' },
    { label: 'Umm Al Quwain', value: 'umm-al-quwain' },
    { label: 'Ras Al Khaimah', value: 'ras-al-khaimah' },
    { label: 'Fujairah', value: 'fujairah' },
];

const pricesOption: Option[] = [
    {
        label: ' 500,000 AED',
        value: 'below-50000',
    },
    {
        label: '500,000 - 10,000,000 AED',
        value: '50000-100000',
    },
    {
        label: '< 10,000,000 AED',
        value: 'above-100000',
    },
    {
        label: '50,000,000 AED',
        value: 'below-500000',
    },
    {
        label: '50,000,0 - 100,000,0 AED',
        value: '500000-1000000',
    },
    {
        label: '50,000,0 - 100,000,0 AED',
        value: '500000-1000000',
    },
    {
        label: '100,000,0-200,000,0 AED',
        value: '1000000-2000000',
    },
]

const propertyTypeOptions: Option[] = [
    {
        label: 'Residential',
        value: 'residential',
    },
    // {
    //     label: 'Commercial',
    //     value: 'commercial',
    // },
];



const PropertySearch = () => {

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [location, setLocation] = useState('Dubai')
    const [propertyType, setPropertyType] = useState('Residential')
    const [price, setPrice] = useState('Any Price')

    const [allLocations, setAllLocations] = useState<any[]>([])

    const handleSearch = () => {
        console.log({
            location,
            propertyType,
            price,
        })

        const params = new URLSearchParams(searchParams);
        if (location) {
            params.set('location', location.toLowerCase());
        } else {
            params.delete('location')
        }

        if (propertyType) {
            params.set('type', propertyType.toLowerCase())
        } else {
            params.delete('type')
        }

        if (price) {
            params.set('price', price.toLowerCase())
        } else {
            params.delete('delete')
        }

        router.replace(`/properties?${params.toString()}`)

    }

    const fetchLocations = async () => {
        const res = await fetchPropertiesLocations()
        setAllLocations(res)

    }

    useEffect(() => {
        fetchLocations()
    }, [])

    const selectClass =
        'w-full appearance-none golden-bg-bordered/20 backdrop-blur-md  px-4 py-2 rounded-2xl bg-transparent pr-6 text-sm text-white outline-none cursor-pointer transition focus:border-golden focus:ring-1 focus:ring-golden  '

    return (
        <div className='flex flex-col items-center justify-center gap-4'>
            <div className="flex  items-center justify-center gap-3">
                <CustomSelect
                    value={location}
                    onChange={setLocation}
                    options={allLocations.length > 0 ? allLocations : locationOption}
                />

                <CustomSelect
                    value={propertyType}
                    onChange={setPropertyType}
                    options={propertyTypeOptions}
                />

                <CustomSelect
                    value={price}
                    onChange={setPrice}
                    options={pricesOption}
                />


            </div>
            <button
                type="button"
                onClick={handleSearch}
                className="flex w-36 items-center gap-2 rounded-full golden-bg-bordered px-7 py-2.5 text-sm font-medium text-black transition hover:scale-[1.02]"
            >
                Search
                <Search size={15} />
            </button>
        </div>
    )
}

export default PropertySearch


const CustomSelect = ({
    value,
    options,
    onChange,
}: {
    value: string
    options: Option[]
    onChange: (value: string) => void
}) => {
    const [open, setOpen] = useState(false)

    return (
        <div className="relative min-w-[50px] sm:min-w-[130px]">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/10 px-1.5 lg:px-4 py-1 lg:py-2.5 text-xs sm:text-sm text-white backdrop-blur-md transition hover:border-golden"
            >
                <span>{upperCase(value)}</span>
                <ChevronDown
                    size={15}
                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="absolute translate-x-1/2 md:left-0 top-full z-1000 mt-2 w-full min-w-[150px] overflow-hidden rounded-xl border border-white/10 bg-[#303030] p-1 shadow-xl">
                    {options.map((option) => (
                        <button
                            key={option.label}
                            type="button"
                            onClick={() => {
                                onChange(option.value)
                                setOpen(false)
                            }}
                            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/10 ${value === option.value
                                ? 'golden-bg text-black'
                                : 'text-white'
                                }`}
                        >
                            {upperCase(option.value)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}