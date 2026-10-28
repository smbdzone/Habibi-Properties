'use client';
import React, { useState } from 'react'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea';
import GoldenButton from '../shared/GoldenButton';
import { Preahvihear } from 'next/font/google';
import { commentBlog } from '@/lib/actions';
import { toast } from 'react-toastify';

const BlogCommentForm = ({ id }: { id?: string }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        comment: '',
    })
    const handleChangeForm = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const res = await commentBlog({ ...form, blog: id })
            if (res.success) {
                setForm({
                    name: '',
                    email: '',
                    comment: '',
                })
                toast.success(res.message, {
                    theme: 'dark'
                })
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error in Posting comment', {
                theme: 'dark'
            })
        }
    }
    return (
        <div className='flex flex-col gap-4 max-w-2xl mx-auto'>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                <Input name='name' value={form.name} handleChange={handleChangeForm}
                    label='Name' inputClassName='border-white! border'
                    placeholder='Full name'
                />
                <Input name='email' type='email' value={form.email} handleChange={handleChangeForm}
                    label='Email' inputClassName='border-white! border'
                    placeholder='Enter email address'
                />
            </div>
            <Textarea handleChange={handleChangeForm} value={form.comment} name='comment'
                inputClassName='border-white! border h-40!' label='Comment'
                placeholder='Write Comment'
            />
            <div className='inline-flex'>
                <GoldenButton text='Post Now' handleClick={handleSubmit} />
            </div>
        </div>
    )
}

export default BlogCommentForm