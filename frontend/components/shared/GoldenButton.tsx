import Link from 'next/link';
import React from 'react'

interface IGoldenButton {
    text: string;
    rightIcon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    href?: string;
    handleClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    varient?: 'default' | 'black';
    type?: 'button' | 'submit'
}

const GoldenButton = ({ text, rightIcon, leftIcon, href, handleClick, varient = 'default', type = 'button' }: IGoldenButton) => {
    const varients = {
        default: "golden-bg-bordered rounded-xl text-black text-lg font-heading tracking-wider px-4 py-2",
        black: "border-golden rounded-xl text-white text-lg font-heading tracking-wider px-4 py-2",
    }

    const content = <div className={`flex items-center justify-center ${varients[varient]}`}>
        <span className=' '>{text}</span>
    </div>

    return href ? <Link href={href}>{content}</Link> : <button type={type} onClick={handleClick}>{content}</button>
}

export default GoldenButton