'use client';
import React, { useEffect, useState } from 'react'
import Input from '../ui/Input'
import PhoneInput from '../ui/PhoneInput'
import Textarea from '../ui/Textarea';
import GoldenButton from '../shared/GoldenButton';
import { createAppointment, fetchSlots } from '@/lib/actions';
import { toast } from 'react-toastify';

interface TimeSlot {
    start: string;
    end: string;
}

const BookAppointmentForm = ({ handleClose }: { handleClose?: () => void }) => {
    const [date, setDate] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [phone, setPhone] = useState('')
    const [country, setCountry] = useState('AE')
    const [dialCode, setDialCode] = useState("+971");
    const [timeSlots, setTimeSlots] = useState<any[]>([])
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    const handleCreateAppointment = async () => {

        try {
            const res = await createAppointment({ phone, name, email, date, message, startTime: selectedSlot?.start, endTime: selectedSlot?.end })

            if (res.success) {
                toast.success("Appointment submitted successfully", {
                    theme: 'dark'
                })

                setPhone('');
                setName('');
                setDate('')
                setEmail('');
                setMessage('');
                setSelectedSlot(null);
                setTimeSlots([])
                if (handleClose) handleClose();
            }

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error in Book Appointment.', {
                theme: 'dark'
            })
        }
    }

    useEffect(() => {
        if (!date) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setErrorMessage('Please select today or future date.')
            return
        };

        const fetchAllSlots = async () => {
            try {
                const res = await fetchSlots(date)
                if (res.success) {
                    setTimeSlots(res.data)

                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Error in fetching slots', {
                    theme: 'dark'
                })
            }
        }

        fetchAllSlots()
    }, [date])

    return (
        <div>
            <div>
                <h4 className='text-xl sm:text-xl md:text-2xl  font-heading text-white tracking-wide'>Book your appointment</h4>
                <p className='text-base text-gray-1 font-body'>Fill in your details and we'll be in touch to confirm your appointment.</p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2'>
                <Input name='name' type='text' value={name} handleChange={(e) => setName(e.target.value)} label='Name' placeholder='Enter Your Name' />
                <Input name='email' type='email' value={email} handleChange={(e) => setEmail(e.target.value)} label='Email' placeholder='Enter Email' />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2'>
                <PhoneInput
                    value={phone}
                    handleChange={setPhone}
                    country={country}
                    handleCountryChange={(selectedCountry) => {
                        setCountry(selectedCountry.code)
                    }}
                    handleDialCodeChange={setDialCode}
                    label="Phone No."
                    placeholder="Enter phone number"
                />

                <Input name='date' type='date' value={date} handleChange={(e) => { setDate(e.target.value); setErrorMessage(null); setSelectedSlot(null); setTimeSlots([]) }} label='Select Date' inputClassName=' appearance-auto!' />

            </div>
            <div>
                {errorMessage && (<div className='text-red-500 text-lg font-body'>
                    {errorMessage}
                </div>)}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mt-2">
                    {timeSlots.map((slot) => {
                        const isSelected =
                            selectedSlot?.start === slot.start &&
                            selectedSlot?.end === slot.end;

                        return (
                            <button
                                key={`${slot.start}-${slot.end}`}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${isSelected
                                    ? "border-primary golden-bg text-black"
                                    : "border-gray-200 bg-white text-gray-800 hover:border-primary"
                                    }`}
                            >
                                {slot.start} – {slot.end}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className='mt-2'>
                <Textarea value={message} handleChange={(e) => setMessage(e.target.value)} name='message' placeholder='Write Message' inputClassName='h-30!' label='Additional Message (Optional)' />
            </div>
            <div className='mt-2'>
                <GoldenButton text='Book Appointment' handleClick={handleCreateAppointment} />
            </div>
        </div>
    )
}

export default BookAppointmentForm