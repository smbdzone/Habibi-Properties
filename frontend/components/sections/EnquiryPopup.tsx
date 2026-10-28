'use client'
import React, { useEffect, useState } from 'react'
import ModelBox from '../ui/ModelBox'
import EnquiryForm from '../forms/EnquiryForm'

const EnquiryPopup = () => {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpen(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, [])

    return (
        <ModelBox size='sm' open={open} onClose={() => { setOpen(false) }}>
            <div role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
                <EnquiryForm onSuccess={() => { setOpen(false) }} />
            </div>
        </ModelBox>
    )
}

export default EnquiryPopup