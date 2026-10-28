import React from 'react'

interface IInput {
    type?: 'text' | 'email' | 'password' | 'number' | 'date';
    name: string;
    value?: string | number | undefined;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    inputClassName?: string;
    label?: string
}

const Input = ({ type = 'text', name, value, handleChange, placeholder, inputClassName, label }: IInput) => {
    return (
        <div className='flex flex-col items-start justify-start gap-1 w-full'>
            {label ? (<label className='text-white font-heading tracking-wide px-2 text-base '>
                {label}
            </label>) : null}
            <input type={type} name={name} value={value} onChange={handleChange} placeholder={placeholder}
                className={`${inputClassName} w-full bg-black rounded-xl px-3 py-2  text-white outline-none`}
            />
        </div>
    )
}

export default Input