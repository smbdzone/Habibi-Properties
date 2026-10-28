"use client";

import React, { useEffect, useRef, useState } from "react";

interface Country {
    name: string;
    code: string;
    dialCode: string;
    flag: string;
}

interface PhoneInputProps {
    value?: string;
    handleChange: (value: string) => void;
    country?: string;
    handleCountryChange?: (country: Country) => void;

    // NEW: receive dial code in parent
    handleDialCodeChange?: (dialCode: string) => void;

    label?: string;
    placeholder?: string;
    inputClassName?: string;
}

export const countries: Country[] = [
    { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
    { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
    { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
    { name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿" },
    { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭" },
    { name: "Comoros", code: "KM", dialCode: "+269", flag: "🇰🇲" },
    { name: "Djibouti", code: "DJ", dialCode: "+253", flag: "🇩🇯" },
    { name: "Iraq", code: "IQ", dialCode: "+964", flag: "🇮🇶" },
    { name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴" },
    { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼" },
    { name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧" },
    { name: "Libya", code: "LY", dialCode: "+218", flag: "🇱🇾" },
    { name: "Mauritania", code: "MR", dialCode: "+222", flag: "🇲🇷" },
    { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦" },
    { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲" },
    { name: "Palestine", code: "PS", dialCode: "+970", flag: "🇵🇸" },
    { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦" },
    { name: "Somalia", code: "SO", dialCode: "+252", flag: "🇸🇴" },
    { name: "Sudan", code: "SD", dialCode: "+249", flag: "🇸🇩" },
    { name: "Syria", code: "SY", dialCode: "+963", flag: "🇸🇾" },
    { name: "Tunisia", code: "TN", dialCode: "+216", flag: "🇹🇳" },
    { name: "Yemen", code: "YE", dialCode: "+967", flag: "🇾🇪" },
    { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
    { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
    { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
    { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
    { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
    { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
    { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
    { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
    { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
];

const PhoneInput = ({
    value,
    handleChange,
    country = "AE",
    handleCountryChange,
    handleDialCodeChange,
    label,
    placeholder = "Enter phone number",
    inputClassName = "",
}: PhoneInputProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCountry =
        countries.find((item) => item.code === country) || countries[0];

    const filteredCountries = countries.filter((item) =>
        `${item.name} ${item.dialCode}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectCountry = (item: Country) => {
        handleCountryChange?.(item);

        // Send only dial code to parent
        handleDialCodeChange?.(item.dialCode);

        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className="flex w-full flex-col items-start justify-start gap-1">
            {label && (
                <label className="px-2 font-heading text-base tracking-wide text-white">
                    {label}
                </label>
            )}

            <div className="flex w-full">
                {/* Country Picker */}
                <div ref={dropdownRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="flex h-10 items-center gap-2 rounded-l-xl border border-white/10 bg-black px-3 text-white outline-none"
                    >
                        <span className="text-lg">
                            {selectedCountry.flag}
                        </span>

                        <span className="text-sm">
                            {selectedCountry.dialCode}
                        </span>

                        <span className="text-xs text-white/60">
                            {isOpen ? "▲" : "▼"}
                        </span>
                    </button>

                    {isOpen && (
                        <div className="absolute left-0 top-full z-100 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-black shadow-xl">
                            {/* Search */}
                            <div className="border-b border-white/10 p-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search country..."
                                    autoFocus
                                    className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-golden"
                                />
                            </div>

                            {/* Countries */}
                            <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-primary">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((item) => (
                                        <button
                                            key={item.code}
                                            type="button"
                                            onClick={() =>
                                                selectCountry(item)
                                            }
                                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 ${item.code ===
                                                selectedCountry.code
                                                ? "bg-white/10"
                                                : ""
                                                }`}
                                        >
                                            <span className="text-lg">
                                                {item.flag}
                                            </span>

                                            <span className="flex-1">
                                                {item.name}
                                            </span>

                                            <span className="text-white/50">
                                                {item.dialCode}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="px-3 py-4 text-center text-sm text-white/50">
                                        No country found
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Phone Number */}
                <input
                    type="tel"
                    name="phone"
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={placeholder}
                    className={`h-10 min-w-0 flex-1 rounded-r-xl border border-l-0 border-white/10 bg-black px-3 text-white outline-none placeholder:text-white/40 focus:border-golden ${inputClassName}`}
                />
            </div>
        </div>
    );
};

export default PhoneInput;
