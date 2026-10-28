"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Dashboard", href: "/", icon: "/icons/home.svg" },
  {
    name: "Properties",
    href: "/properties",
    subLinks: [
      { label: "Residential", href: "/properties/Residential/Apartment" },
      { label: "Commercial", href: "/properties/Commercial/Retail" },
    ],
  },
  {
    name: "Blogs",
    href: "/blogs",
    subLinks: [
      { label: "Create Blog", href: "/create-blog" },
      { label: "Manage Blogs", href: "/manage-blogs" },
    ],
  },
  {
    name: "Subscribers",
    href: "/subscribers",
    subLinks: [
      { label: "Newsletter", href: "/subscribers/newsletter" },
      { label: "Enquiries", href: "/subscribers/enquiries" },
      { label: "Contact", href: "/subscribers/contact" },
      { label: "Comments", href: "/subscribers/comments" },
      { label: "Appointments", href: "/subscribers/email" },
      { label: "Testimonials", href: "/subscribers/testimonial" },
    ],
  },
  {
    name: "Settings",
    href: "/settings",

  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  if (pathname === "/add-property" || pathname === "/properties/add-new") return null;

  return (
    <aside className="w-60 bg-charcoal text-white flex flex-col min-h-screen py-3">
      <div className="mt-4 mb-6 flex items-center px-6">
        <Image
          src="/images/logo.png"
          width={140}
          height={140}
          alt="james"
          className=""
        />
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          {navLinks.map(({ name, href, icon, subLinks }) => {
            const isActive =
              pathname === href ||
              pathname.startsWith(`${href}/`) ||
              pathname.includes(`${href}?`);
            const hasSubLinks = !!subLinks;
            const isOpen = openDropdown === name;
            return (
              <li key={name}>
                {!hasSubLinks ? (
                  // Render as Link for items without subLinks (Dashboard, Settings, etc.)
                  <Link
                    href={href}
                    className={`flex mx-4 items-center justify-between gap-2 px-6 py-2 rounded-2xl transition-colors duration-200 cursor-pointer ${isActive
                      ? "bg-white/10"
                      : "hover:bg-white/10 text-white/80"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`${isActive
                          ? " golden-text font-semibold"
                          : "font-medium"
                          }`}

                      >
                        {name}
                      </span>
                    </div>
                  </Link>
                ) : (
                  // Render as dropdown for items with subLinks
                  <>
                    <div
                      onClick={() => toggleDropdown(name)}
                      className={`flex mx-4 items-center justify-between gap-2 px-6 py-2 rounded-2xl transition-colors duration-200 cursor-pointer ${isActive
                        ? "bg-white/10"
                        : "hover:bg-white/10 text-white/90"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`${isActive
                            ? " golden-text font-semibold"
                            : "font-semibold"
                            }`}

                        >
                          {name}
                        </span>
                      </div>
                      <Image
                        src="/icons/arrow-up.svg"
                        alt="arrow"
                        width={14}
                        height={14}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                          }`}
                      />
                    </div>
                    {/*  Dropdown for sublinks */}
                    {isOpen && (
                      <ul className="ml-10 mt-1 space-y-1">
                        {subLinks.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              className={`block px-4 font-semibold w-[90%] py-1.5 text-sm rounded-lg transition-all duration-200 ${pathname.startsWith(
                                sub.href.split("/").slice(0, 3).join("/")
                              )
                                ? "bg-white/10"
                                : "text-white/80 hover:bg-white/10"
                                }`}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

