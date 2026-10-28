'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import GoldenButton from '../shared/GoldenButton'
import { Menu, X } from 'lucide-react'

const NAV_MENU = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    // { name: 'Commercial', path: '/properties?type=commercial' },
    { name: 'Properties', path: '/properties' },
    { name: 'Blogs', path: '/blog' },
]

const Navbar = () => {
    const pathname = usePathname()
    // const searchParams = useSearchParams()

    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Detect scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        handleScroll()

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    // Detect mobile screen
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024

            setIsMobile(mobile)

            if (!mobile) {
                setIsMenuOpen(false)
            }
        }

        handleResize()

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isMenuOpen])

    // Close menu with Escape
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const isSolid = isScrolled || isMobile

    const isActive = (path: string) => {

        if (pathname === path) {
            return true;
        } else {
            return false;
        }

        // const [pathnamePart, queryPart] = path.split('?')

        // if (pathname !== pathnamePart) {
        //     return false
        // }

        // if (!queryPart) {
        //     return pathname === pathnamePart
        // }

        // return searchParams.toString().includes(queryPart)
    }

    return (
        <nav className="fixed top-0 left-0 z-[100] w-full">
            {/* Navbar */}
            <div
                className={`
                    flex items-center justify-between
                    px-2 sm:px-6 lg:px-14
                    py-1
                    transition-all duration-300
                    ${isSolid
                        ? 'bg-white/10 backdrop-blur-lg backdrop-saturate-50'
                        : 'bg-transparent'
                    }
                `}
            >
                {/* Logo */}
                <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="relative z-[110] hidden sm:block"
                >
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        width={175}
                        height={125}
                        className="h-auto w-[100px] sm:w-[90px]"
                    />
                </Link>

                <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="relative z-[110]  sm:hidden"
                >
                    <img
                        src="/images/logo.webp"
                        alt="Logo"
                        width={175}
                        height={125}
                        className="h-auto w-[100px] sm:w-[90px]"
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden items-center gap-2 lg:flex">
                    {NAV_MENU.map((menu) => {
                        const active = isActive(menu.path)

                        return (
                            <Link
                                key={menu.name}
                                href={menu.path}
                                className="
                                    group
                                    relative
                                    overflow-hidden
                                    rounded-3xl
                                    border
                                    border-golden
                                    px-5
                                    py-1
                                    pb-2
                                "
                            >
                                {/* Hover background */}
                                <span
                                    className="
                                        absolute
                                        inset-0
                                        z-0
                                        -translate-x-full
                                        bg-(image:--golden-gradient)
                                        transition-transform
                                        duration-300
                                        group-hover:translate-x-0
                                    "
                                />

                                {/* Text */}
                                <span
                                    className={`
                                        relative
                                        z-10
                                        font-heading
                                        text-lg
                                        tracking-tight
                                        transition-colors
                                        duration-300
                                        group-hover:text-black
                                        ${active
                                            ? 'border-b border-white'
                                            : ''
                                        }
                                    `}
                                >
                                    {menu.name}
                                </span>
                            </Link>
                        )
                    })}


                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    aria-label={
                        isMenuOpen
                            ? 'Close navigation menu'
                            : 'Open navigation menu'
                    }
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="
                        relative
                        z-[110]
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-golden
                        lg:hidden
                    "
                >
                    {isMenuOpen ? (
                        <X className="text-primary-1" size={24} />
                    ) : (
                        <Menu className="text-primary-1" size={24} />
                    )}
                </button>
                <div className='hidden lg:block'>
                    <GoldenButton text="Contact Us" href='/contact' />
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`
                    fixed
                    top-18
                    w-full
                    py-3
                    z-[100]
                    bg-black
                    transition-all
                    duration-300
                    lg:hidden
                    ${isMenuOpen
                        ? 'visible opacity-100'
                        : 'invisible opacity-0'
                    }
                `}
            >

                <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
                    {NAV_MENU.map((menu) => {
                        const active = isActive(menu.path)

                        return (
                            <Link
                                key={menu.name}
                                href={menu.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`
                                    font-heading
                                    text-2xl
                                    transition-colors
                                    duration-300
                                    ${active
                                        ? 'text-primary-1 border-b border-primary-1'
                                        : 'text-primary-1/80 hover:text-primary-1'
                                    }
                                `}
                            >
                                {menu.name}
                            </Link>
                        )
                    })}

                    <div className="mt-4">
                        <GoldenButton text="Contact Us" href='/contact' />
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar