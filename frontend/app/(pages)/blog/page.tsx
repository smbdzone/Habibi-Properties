import BlogPage from '@/components/pages/BlogPage'
import { fetchBlogs } from '@/lib/actions'
import React from 'react'

const page = async () => {
    const blogs = await fetchBlogs()
    return (
        <>
            <BlogPage blogs={blogs} />
        </>
    )
}

export default page