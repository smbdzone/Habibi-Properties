'use client';

import Link from 'next/link';
import React from 'react';

import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaXTwitter,
    FaYoutube,
} from 'react-icons/fa6';

import { useAbout } from '../context/AboutContext';

const NAV_MENU = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Residential', path: '/properties?type=residential' },
    { name: 'Blogs', path: '/blog' },
    { name: 'Contact Us', path: '/contact' },
];

const Footer = () => {
    const { data } = useAbout();

    const socialLinks = [
        {
            name: 'Facebook',
            href: data?.socialMedia?.facebook,
            icon: FaFacebookF,
        },
        {
            name: 'Instagram',
            href: data?.socialMedia?.instagram,
            icon: FaInstagram,
        },
        {
            name: 'LinkedIn',
            href: data?.socialMedia?.linkedin,
            icon: FaLinkedinIn,
        },
        {
            name: 'X',
            href: data?.socialMedia?.twitter,
            icon: FaXTwitter,
        },
        {
            name: 'YouTube',
            href: data?.socialMedia?.youtube,
            icon: FaYoutube,
        },
    ].filter((link) => link.href);

    return (
        <footer className="mt-16 border-t border-white/10 pt-10">

            {/* Main Footer */}
            <div className="section-container">

                <div className="
                    grid
                    grid-cols-1
                    gap-10
                    sm:grid-cols-2
                    lg:grid-cols-[1fr_1.5fr_1fr]
                    lg:items-start
                ">

                    {/* Contact */}
                    <div className="min-w-0">
                        <h2 className="font-heading mb-4 text-lg font-medium">
                            Reach Us
                        </h2>

                        <div className="flex flex-col items-start gap-2 text-sm sm:text-base">

                            {data?.phone && (
                                <Link
                                    href={`tel:${data.phone}`}
                                    className="transition-opacity hover:opacity-70"
                                >
                                    {data.phone}
                                </Link>
                            )}

                            {data?.email && (
                                <Link
                                    href={`mailto:${data.email}`}
                                    className="break-all transition-opacity hover:opacity-70"
                                >
                                    {data.email}
                                </Link>
                            )}

                            {data?.location && (
                                <p className="max-w-xs leading-relaxed">
                                    {data.location}
                                </p>
                            )}

                        </div>
                    </div>

                    {/* Logo + Navigation */}
                    <div className="
                        flex
                        min-w-0
                        flex-col
                        items-center
                        justify-center
                        gap-6
                        sm:col-span-2
                        lg:col-span-1
                    ">
                        <Link href="/" className="shrink-0">
                            <img
                                src="/images/logo-white.png"
                                alt="Habibi Property"
                                width={280}
                                height={200}
                                className="h-auto w-36 object-contain sm:w-40"
                            />
                        </Link>

                        <nav className="
                            flex
                            w-full
                            flex-wrap
                            items-center
                            justify-center
                            gap-x-5
                            gap-y-3
                        ">
                            {NAV_MENU.map((menu) => (
                                <Link
                                    key={menu.name}
                                    href={menu.path}
                                    className="
                                        whitespace-nowrap
                                        text-sm
                                        font-body
                                        transition-opacity
                                        hover:opacity-70
                                        sm:text-base
                                    "
                                >
                                    {menu.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Social Links */}
                    <div className="
                        flex
                        min-w-0
                        items-center
                        justify-center
                        lg:justify-end
                    ">
                        {socialLinks.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {socialLinks.map((link) => {
                                    const Icon = link.icon;

                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={link.name}
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-white/20
                                                transition-all
                                                duration-300
                                                hover:border-white
                                                hover:bg-white
                                                hover:text-black
                                            "
                                        >
                                            <Icon className="text-base" />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

                {/* Bottom Footer */}
                <div className="
                    mt-10
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-3
                    border-t
                    border-white/10
                    py-6
                    text-center
                    text-xs
                    sm:flex-row
                    sm:flex-wrap
                    sm:gap-2
                    sm:text-sm
                ">
                    <p className="leading-relaxed">
                        © {new Date().getFullYear()} HABIBI Property. All rights reserved.
                    </p>

                    <span className="hidden sm:block text-white/40">
                        |
                    </span>

                    <Link
                        href="https://smbdigitalzone.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity hover:opacity-70"
                    >
                        Designed &amp; Developed by SMB DigitalZone.
                    </Link>
                </div>

            </div>
        </footer>
    );
};

export default Footer;