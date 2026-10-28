'use client'
import React, { useState } from 'react'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import PhoneInput from '../ui/PhoneInput'
import GoldenButton from '../shared/GoldenButton'
import { contactSendMessage } from '@/lib/actions'
import { toast } from 'react-toastify'

const ContactUsForm = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        message: ''
    })
    const [phone, setPhone] = useState('')
    const [country, setCountry] = useState('AE')
    const [dialCode, setDialCode] = useState("+971");

    const handleChangeForm = (e: any) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSendMessage = async () => {
        try {
            const res = await contactSendMessage({
                firstName: form.name,
                email: form.email,
                countryCode: dialCode,
                countryName: country,
                phone: phone,
                subject: '',
                message: form.message
            })

            if (res.success) {
                toast.success("Message sent successfully", {
                    theme: 'dark'
                })
                setForm({
                    name: '',
                    email: '',
                    message: ""
                })
                setPhone('');
                setCountry('');
                setDialCode('');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'error in send message', {
                theme: 'dark'
            })
        }
    }

    return (
        <div className='bg-primary p-4 w-full rounded-lg border-golden shadow-sm shadow-gray-1 flex flex-col gap-4'>
            <div>
                <span className='font-heading text-2xl tracking-wider'>Contact Us</span>
                <h3 className='my-3 text-lg sm:text-xl lg:text-3xl font-heading tracking-wide golden-text'>We're Here To Help You</h3>
            </div>
            <Input type='text' value={form.name} handleChange={handleChangeForm} placeholder='Full name' name='name' label='Name' />
            <PhoneInput value={phone}
                handleChange={setPhone}
                country={country}
                handleCountryChange={(selectedCountry) => {
                    setCountry(selectedCountry.code)
                }}
                handleDialCodeChange={setDialCode} label='Phone No.' placeholder='Enter phone number' />
            <Input type='email' value={form.email} handleChange={handleChangeForm} placeholder='Email Address' name='email' label='Email' />
            <Textarea value={form.message} handleChange={handleChangeForm} placeholder='Message' name='message' label='Message' inputClassName='h-40! w-full!' />
            <div>
                <GoldenButton text='Send Message' handleClick={handleSendMessage} />
            </div>

        </div>
    )
}

export default ContactUsForm