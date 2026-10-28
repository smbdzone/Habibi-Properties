import PropertyPage from '@/components/pages/PropertyPage'
import { fetchPropertiesPag } from '@/lib/actions'
import React from 'react'

interface PageProps {
    searchParams: Promise<{
        type?: string,
        location?: string,
        price?: string,
        page?: string | number
    }>
}

const page = async ({ searchParams }: PageProps) => {
    const { type, location, price, page } = await searchParams;
    const params = new URLSearchParams();
    params.set('limit', String(6))
    if (type) params.set('type', type);
    if (location) params.set('location', location);
    if (price) params.set('price', price);
    if (page) params.set('page', page.toString());

    const properties = await fetchPropertiesPag(
        `${params.toString()}`
    )
    return (
        <div>
            <PropertyPage properties={properties.data} pagination={properties.pagination} />
        </div>
    )
}

export default page