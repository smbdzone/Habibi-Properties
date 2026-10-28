import BlogDetails from '@/components/pages/BlogDetails'
import { fetchBlogs, fetchComments, fetchSingleBlog } from '@/lib/actions'
import React from 'react'

interface Type {
    params: Promise<{ slug: string }>
}

const page = async ({ params }: Type) => {
    const slug = (await params).slug
    const [singleBlog, blogs] = await Promise.all([
        fetchSingleBlog(slug),
        fetchBlogs(),
    ])

    const allComments = await fetchComments(singleBlog._id)
    return (
        <div>
            <BlogDetails blog={singleBlog} allBlog={blogs} comments={allComments} />
        </div>
    )
}

export default page