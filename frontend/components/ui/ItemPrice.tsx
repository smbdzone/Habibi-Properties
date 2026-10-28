import React from 'react'

interface IItemPrice {
    img?: string;
    price: number | string;
    varient?: 'white' | 'golden' | 'black'
}

const ItemPrice = ({ img, price, varient = 'white' }: IItemPrice) => {
    const varients = {
        white: 'golden-text text-white text-xl font-heading lg:text-2xl font-semibold tracking-normal leading-tight',
        golden: 'golden-text text-xl font-heading lg:text-2xl font-semibold tracking-normal leading-tight',
        black: ' text-black text-xl font-heading lg:text-2xl font-semibold tracking-normal leading-tight'
    }
    const imgVarient = {
        white: '/images/dirham-white.png',
        golden: '/images/dirham-golden.png',
        black: '/images/dirham-black.png'
    }
    return (
        <div className={`flex items-center gap-2 ${varients[varient]}`}>
            <div>
                <img src={imgVarient[varient]} alt='dirham symboal' className='w-6 h-6' />
            </div>
            <div className=''>
                {price}
            </div>
        </div>
    )
}

export default ItemPrice