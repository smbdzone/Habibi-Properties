"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModelBoxProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
    showCloseButton?: boolean;
    closeOnOverlay?: boolean;
    closeOnEsc?: boolean;
    className?: string
}

const ModelBox = ({
    open,
    onClose,
    title,
    children,
    footer,
    size = "md",
    showCloseButton = true,
    closeOnOverlay = true,
    className,
    closeOnEsc = true,
}: ModelBoxProps) => {
    useEffect(() => {
        if (!open || !closeOnEsc) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, closeOnEsc, onClose]);

    if (!open) return null;

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
        full: "max-w-[95vw]",
    };

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeOnOverlay ? onClose : undefined}
            />

            {/* Modal */}
            <div
                className={`relative z-10 ${className} w-full max-h-[98vh]  ${sizes[size]} scrollbar-thin scrollbar-thumb-black overflow-hidden rounded-xl bg-primary shadow-2xl`}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-1">
                        {title && (
                            <h2 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h2>
                        )}

                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close modal"
                                className="rounded-lg p-1.5 text-primary-1 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="max-h-[75vh] overflow-y-auto p-5">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelBox;