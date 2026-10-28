'use client';

import React, { FormEvent, useState } from 'react';
import Input from '../ui/Input';
import PhoneInput from '../ui/PhoneInput';
import GoldenButton from '../shared/GoldenButton';
import { SendEnquiry } from '@/lib/actions';

interface EnquiryFormData {
    name: string;
    email: string;
    budget: string;
    propertyType: 'residential' | 'commercial' | '';
}

interface EnquiryFormProps {
    onSuccess?: () => void;
}

const EnquiryForm = ({ onSuccess }: EnquiryFormProps) => {
    const [formData, setFormData] = useState<EnquiryFormData>({
        name: '',
        email: '',
        budget: '',
        propertyType: '',
    });
    const [phone, setPhone] = useState('')
    const [country, setCountry] = useState('AE')
    const [dialCode, setDialCode] = useState("+971");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePhoneChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            phone: value,
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (!formData.name.trim()) {
            setError('Please enter your name.');
            return;
        }

        if (!formData.email.trim()) {
            setError('Please enter your email.');
            return;
        }



        if (!formData.budget) {
            setError('Please select your budget.');
            return;
        }

        if (!formData.propertyType) {
            setError('Please select a property type.');
            return;
        }

        try {
            setLoading(true);
            console.log({ ...formData, phoneNumber: phone, country, countryCode: dialCode, fullName: formData.name })
            const response = await SendEnquiry({ ...formData, phoneNumber: phone, country, countryCode: dialCode, fullName: formData.name })

            if (response.success) {
                setSuccess(
                    response?.message || 'Your enquiry has been submitted successfully.'
                );

                setFormData({
                    name: '',
                    email: '',
                    budget: '',
                    propertyType: '',
                });

                onSuccess?.();
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to submit your enquiry.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 id="enquiry-title" className='text-lg sm:text-xl lg:text-2xl font-semibold golden-text'>Submit an Enquiry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

                <Input
                    name="name"
                    value={formData.name}
                    handleChange={handleChange}
                    label="Name"
                    placeholder="Enter your name"
                />

                <Input
                    name="email"
                    value={formData.email}
                    handleChange={handleChange}
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                />

                <PhoneInput
                    value={phone}
                    handleChange={setPhone}
                    country={country}
                    handleCountryChange={(selectedCountry) => {
                        setCountry(selectedCountry.code)
                    }}
                    handleDialCodeChange={setDialCode}
                    label="Phone"
                    placeholder="Enter your phone number"
                />


                <div className="grid grid-cols-2 gap-2">

                    {/* Budget */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="budget"
                            className="text-base font-medium font-heading tracking-wide"
                        >
                            Budget
                        </label>

                        <select
                            id="budget"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-stone bg-transparent px-4 py-3 text-white outline-none transition focus:border-primary"
                        >
                            <option value="" className="bg-primary text-white">
                                Select your budget
                            </option>
                            <option value="under-500k" className="bg-primary text-white">
                                Under AED 500K
                            </option>
                            <option value="500k-1m" className="bg-primary text-white">
                                AED 500K - 1M
                            </option>
                            <option value="1m-2m" className="bg-primary text-white">
                                AED 1M - 2M
                            </option>
                            <option value="2m-5m" className="bg-primary text-white">
                                AED 2M - 5M
                            </option>
                            <option value="5m-plus" className="bg-primary text-white">
                                AED 5M+
                            </option>
                        </select>
                    </div>

                    {/* Property Type */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="propertyType"
                            className="text-base font-medium font-heading tracking-wide"
                        >
                            Property Type
                        </label>

                        <select
                            id="propertyType"
                            name="propertyType"
                            value={formData.propertyType}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-stone bg-transparent px-4 py-3 text-white outline-none transition focus:border-primary"
                        >
                            <option value="" className="bg-primary text-white">
                                Select property type
                            </option>
                            <option value="residential" className="bg-primary text-white">
                                Residential
                            </option>
                            <option value="commercial" className="bg-primary text-white">
                                Commercial
                            </option>
                        </select>
                    </div>

                </div>
                {/* Error */}
                {error && (
                    <p className="text-sm text-error">
                        {error}
                    </p>
                )}

                {/* Success */}
                {success && (
                    <p className="text-sm text-success">
                        {success}
                    </p>
                )}

                <GoldenButton handleClick={handleSubmit} text={loading ? 'Submitting...' : 'Submit Enquiry'} />

            </form>
        </div>

    );
};

export default EnquiryForm;