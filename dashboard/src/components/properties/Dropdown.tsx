"use client";

import { useState } from "react";
import Image from "next/image";

interface DropdownProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  selected,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-w-[140px]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-sm cursor-pointer focus:outline-none"
      >
        <span>{selected || label}</span>
        <Image
          src="/icons/arrow-up.svg"
          width={14}
          height={14}
          alt="arrow"
          className={`transform invert transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-auto transition-all duration-300">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-white/90 transition-colors duration-200 ${
                option === selected ? "bg-primary text-white/90" : ""
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;

