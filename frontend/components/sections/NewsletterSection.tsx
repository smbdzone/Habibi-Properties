'use client';
import React, { useState } from 'react'
import GoldenButton from '../shared/GoldenButton'
import { subscribeNewsletter } from '@/lib/actions';
import { toast } from 'react-toastify';

const NewsletterSection = () => {
    const [email, setEmail] = useState('')

    const handleSubscribe = async (e: any) => {
        e.preventDefault()
        try {
            const res = await subscribeNewsletter(email)
            if (res.success) {
                toast.success(res.message, {
                    theme: 'dark'
                })
                setEmail('')
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Faild to subscribe', {
                theme: 'dark'
            })
        }

    }
    return (
        <>
            <div className='max-w-8xl mx-auto w-full h-1 bg-gray-1' />
            <section className='section-container relative'>
                <div>
                    <h1 className='text-center text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-wider'>Find your Dream Home Today <br /> Subscribe to our newsletter</h1>

                    <p className='text-base my-4 sm:text-lg text-gray-1 text-center max-w-3xl mx-auto'>Subscribe to our newsletters to get  the latest updates, design insights, and exclusive offers delivered straight to your inbox.</p>
                </div>

                <form onSubmit={handleSubscribe} className='flex items-center justify-center my-12'>
                    <div className="border-golden flex w-full max-w-md items-center rounded-full p-1.5 px-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/50"
                        />

                        <GoldenButton type='submit' text="Subscribe" />
                    </div>
                </form>

            </section>
            <div className='max-w-8xl mx-auto w-full h-1 bg-gray-1' />
        </>
    )
}

export default NewsletterSection