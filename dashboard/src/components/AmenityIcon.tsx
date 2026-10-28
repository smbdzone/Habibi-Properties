"use client";

import React from 'react';
import { getDefaultAmenityIcon } from '@/data/amenities';
import { IconComponent } from '@/data/amenities';

interface AmenityIconProps {
    amenityName: string;
    customIconUrl?: string;
    className?: string;
    size?: number | string;
}

export const AmenityIcon: React.FC<AmenityIconProps> = ({
    amenityName,
    customIconUrl,
    className = "",
    size = 20
}) => {
    // If custom icon URL is provided and it's not a react-icon identifier, use it as image
    if (customIconUrl && !customIconUrl.startsWith('react-icon:')) {
        return (
            <img
                src={customIconUrl}
                alt={amenityName}
                className={className}
                style={{ width: size, height: size }}
            />
        );
    }

    // Otherwise, use the default react-icon component
    const IconComponent = getDefaultAmenityIcon(amenityName);
    return <IconComponent className={className} size={size} />;
};

