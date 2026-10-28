"use client";

import Image from "next/image";
import Link from "next/link";

interface DashboardCardProps {
  label: string;
  value: number | string;
  bgColor: string; // background color of the card
  textColor: string; // text color of the card
  arrowBgColor: string; // background color of the arrow circle
  href?: string;
}

export default function DashboardCard({
  label,
  value,
  bgColor,
  textColor,
  arrowBgColor,
  href = "#",
}: DashboardCardProps) {
  return (
    <div
      className={`py-4 px-3 space-y-4 min-h-[170px] w-[190px] rounded-3xl flex flex-col justify-between`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="w-full flex justify-between gap-3">
        <p className="text-[20px] font-medium max-w-[75%]">{label}</p>
        <Link
          href={href}
          className={`w-7 h-7 flex justify-center items-center rounded-full`}
          style={{ backgroundColor: arrowBgColor }}
        >
          <Image
            src="/icons/arrow.svg"
            width={12}
            height={12}
            alt="open in new tab"
          />
        </Link>
      </div>
      <p className="text-3xl font-semibold ">{value}</p>
    </div>
  );
}

