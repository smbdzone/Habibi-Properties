import PropertyDetails from '@/components/pages/PropertyDetails'
import React, { Suspense } from 'react'
import {
    fetchSimilarProperties,
    fetchSingleProperty,
    fetchPropertySeo
} from '@/lib/actions'
import Loading from '@/app/loading'
import type { Metadata } from 'next'

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata(
    { params }: PageProps
): Promise<Metadata> {
    const { slug } = await params

    const seo: any = await fetchPropertySeo(slug)

    const title = seo?.title || 'Property Details'
    const description = seo?.description || ''
    const image = seo?.image || ''

    return {
        title,
        description,

        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_FRONTEND}/properties/${slug}`,
        },

        openGraph: {
            title,
            description,
            type: 'website',
            url: `${process.env.NEXT_PUBLIC_FRONTEND}/properties/${slug}`,
            images: image
                ? [
                    {
                        url: image,
                        alt: title,
                    },
                ]
                : [],
        },

        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: image ? [image] : [],
        },
    }
}

const page = async ({ params }: PageProps) => {
    const { slug } = await params

    const propertyDetails = await fetchSingleProperty(slug)
    const similarProperties = await fetchSimilarProperties(slug)

    return (
        <Suspense fallback={<Loading />}>
            <PropertyDetails
                property={propertyDetails}
                similarProperties={similarProperties}
            />
        </Suspense>
    )
}

export default page