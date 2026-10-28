// Predefined list of amenities with react-icons
import {
    FaSnowflake,
    FaFire,
    FaWifi,
    FaSatelliteDish,
    FaHome,
    FaRobot,
    FaLightbulb,
    FaMicrophone,
    FaCouch,
    FaChair,
    FaBoxOpen,
    FaPalette,
    FaGem,
    FaCar,
    FaCarSide,
    FaParking,
    FaBolt,
    FaSwimmingPool,
    FaUmbrellaBeach,
    FaGlassMartini,
    FaWater,
    FaHotTub,
    FaShip,
    FaFish,
    FaSun,
    FaShieldAlt,
    FaLock,
    FaUserShield,
    FaKey,
    FaVideo,
    FaFingerprint,
    FaBatteryFull,
    FaPlug,
    FaFireExtinguisher,
    FaBell,
    FaDumbbell,
    FaRunning,
    FaSpa,
    FaStar,
    FaLayerGroup,
    FaLeaf,
    FaTree,
    FaFilm,
    FaChild,
    FaSeedling,
    FaBuilding,
    FaArrowUp,
    FaUtensils,
    FaThLarge
} from 'react-icons/fa';

// Icon component type
export type IconComponent = React.ComponentType<{ className?: string; size?: number | string }>;

// Predefined list of amenities with default icons from react-icons
export interface Amenity {
    name: string;
    iconComponent: IconComponent; // React icon component
    iconName: string; // Icon identifier for storage
}

// Icon mapping - maps amenity names to react-icons components
const getIconComponent = (iconName: string): IconComponent => {
    const iconMap: Record<string, IconComponent> = {
        // Air Conditioning & Heating
        "Air Conditioning": FaSnowflake,
        "Central Air Conditioning": FaSnowflake,
        "Central A/C": FaSnowflake,
        "Heating System": FaFire,

        // Internet & Technology
        "High-Speed Internet": FaWifi,
        "Fiber Internet": FaWifi,
        "Satellite TV": FaSatelliteDish,
        "Smart Home System": FaHome,
        "Home Automation": FaRobot,
        "Smart Lighting": FaLightbulb,
        "Voice Control": FaMicrophone,

        // Furnishing
        "Fully Furnished": FaCouch,
        "Semi-Furnished": FaChair,
        "Unfurnished": FaBoxOpen,
        "Furnished": FaCouch,
        "Designer Furnishing": FaPalette,
        "Premium Furnishing": FaGem,

        // Parking
        "Covered Parking": FaCar,
        "Valet Parking": FaCarSide,
        "Dedicated Parking": FaParking,
        "Visitor Parking": FaCar,
        "Underground Parking": FaCar,

        // Electric Vehicle
        "Electric Vehicle Charging": FaBolt,
        "EV Charging Station": FaBolt,

        // Pools
        "Shared Pool": FaSwimmingPool,
        "Private Pool": FaSwimmingPool,
        "Swimming Pool": FaSwimmingPool,
        "Olympic-Size Pool": FaSwimmingPool,
        "Temperature-Controlled Pool": FaSwimmingPool,
        "Infinity Pool": FaSwimmingPool,
        "Kids Pool": FaSwimmingPool,
        "Children's Pool": FaSwimmingPool,
        "Pool Deck": FaUmbrellaBeach,
        "Pool Bar": FaGlassMartini,
        "Poolside Cabanas": FaUmbrellaBeach,
        "Waterfall Feature": FaWater,
        "Jacuzzi": FaHotTub,
        "Hot Tub": FaHotTub,

        // Water Features
        "Waterfront": FaWater,
        "View of Water": FaWater,
        "Beach Access": FaUmbrellaBeach,
        "Private Beach": FaUmbrellaBeach,
        "Boat Dock": FaShip,
        "Dock Access": FaShip,
        "Marina Access": FaShip,
        "Fishing Pier": FaFish,
        "Water Sports": FaSwimmingPool,

        // Outdoor Spaces
        "Sun Deck": FaSun,

        // Security
        "Security": FaShieldAlt,
        "Gated Community": FaLock,
        "24/7 Security": FaShieldAlt,
        "Security Guards": FaUserShield,
        "Access Control": FaKey,
        "CCTV Surveillance": FaVideo,
        "Biometric Access": FaFingerprint,

        // Safety & Backup
        "Backup Power": FaBatteryFull,
        "Generator Backup": FaPlug,
        "Fire Safety System": FaFireExtinguisher,
        "Smoke Detectors": FaBell,
        "Safe Room": FaLock,
        "Panic Room": FaLock,

        // Fitness & Wellness
        "Gym/Fitness Center": FaDumbbell,
        "Fully Equipped Gym": FaDumbbell,
        "Shared Gym": FaDumbbell,
        "Personal Training Studio": FaRunning,
        "Yoga Studio": FaSpa,
        "Pilates Studio": FaRunning,
        "Spa & Wellness": FaSpa,
        "Gym": FaDumbbell,
        "Yoga zone": FaSpa,

        // Pool & Outdoor (extended)
        "Baja shelf": FaLayerGroup,
        "Cabana area": FaUmbrellaBeach,
        "Sunken climate-cooled balconies": FaSnowflake,
        "Winter gardens": FaLeaf,
        "Hammock forest": FaTree,
        "Outdoor cinema": FaFilm,
        "Kids cooled playground": FaChild,
        "Vegetable garden": FaSeedling,
        "BBQ area": FaFire,
        "Premium lobby": FaBuilding,
        "Elevator access": FaArrowUp,
        "Private Winter Garden": FaLeaf,
        "Sunken climate-controlled balconies": FaSnowflake,
        "Multiple terraces": FaThLarge,
        "Infinity swimming pool": FaSwimmingPool,
        "Kids pool": FaSwimmingPool,
        "Cabanas & hammock forest": FaUmbrellaBeach,
        "Premium lobby & elevators": FaBuilding,
        "German kitchen": FaUtensils,
    };

    return iconMap[iconName] || FaStar; // Default icon
};

// Get icon name identifier for storage
const getIconName = (amenityName: string): string => {
    const iconNameMap: Record<string, string> = {
        "Air Conditioning": "snowflake",
        "Central Air Conditioning": "snowflake",
        "Central A/C": "snowflake",
        "Heating System": "fire",
        "High-Speed Internet": "wifi",
        "Fiber Internet": "wifi",
        "Satellite TV": "satellite-dish",
        "Smart Home System": "home",
        "Home Automation": "robot",
        "Smart Lighting": "lightbulb",
        "Voice Control": "microphone",
        "Fully Furnished": "couch",
        "Semi-Furnished": "chair",
        "Unfurnished": "box-open",
        "Furnished": "couch",
        "Designer Furnishing": "palette",
        "Premium Furnishing": "gem",
        "Covered Parking": "car",
        "Valet Parking": "car-side",
        "Dedicated Parking": "parking",
        "Visitor Parking": "car",
        "Underground Parking": "car",
        "Electric Vehicle Charging": "bolt",
        "EV Charging Station": "bolt",
        "Shared Pool": "swimming-pool",
        "Private Pool": "swimming-pool",
        "Swimming Pool": "swimming-pool",
        "Olympic-Size Pool": "swimming-pool",
        "Temperature-Controlled Pool": "swimming-pool",
        "Infinity Pool": "swimming-pool",
        "Kids Pool": "swimming-pool",
        "Children's Pool": "swimming-pool",
        "Pool Deck": "umbrella-beach",
        "Pool Bar": "cocktail",
        "Poolside Cabanas": "umbrella-beach",
        "Waterfall Feature": "water",
        "Jacuzzi": "hot-tub",
        "Hot Tub": "hot-tub",
        "Waterfront": "water",
        "View of Water": "water",
        "Beach Access": "umbrella-beach",
        "Private Beach": "umbrella-beach",
        "Boat Dock": "ship",
        "Dock Access": "ship",
        "Marina Access": "ship",
        "Fishing Pier": "fish",
        "Water Sports": "swimming-pool",
        "Sun Deck": "sun",
        "Security": "shield-alt",
        "Gated Community": "lock",
        "24/7 Security": "shield-alt",
        "Security Guards": "user-shield",
        "Access Control": "key",
        "CCTV Surveillance": "video",
        "Biometric Access": "fingerprint",
        "Backup Power": "battery-full",
        "Generator Backup": "plug",
        "Fire Safety System": "fire-extinguisher",
        "Smoke Detectors": "bell",
        "Safe Room": "lock",
        "Panic Room": "lock",
        "Gym/Fitness Center": "dumbbell",
        "Fully Equipped Gym": "dumbbell",
        "Shared Gym": "dumbbell",
        "Personal Training Studio": "running",
        "Yoga Studio": "spa",
        "Pilates Studio": "running",
        "Spa & Wellness": "spa",
        "Gym": "dumbbell",
        "Yoga zone": "spa",

        // New amenities
        "Baja shelf": "layer-group",
        "Cabana area": "umbrella-beach",
        "Sunken climate-cooled balconies": "snowflake",
        "Winter gardens": "leaf",
        "Hammock forest": "tree",
        "Outdoor cinema": "film",
        "Kids cooled playground": "child",
        "Vegetable garden": "seedling",
        "BBQ area": "fire",
        "Premium lobby": "building",
        "Elevator access": "arrow-up",
        "Private Winter Garden": "leaf",
        "Sunken climate-controlled balconies": "snowflake",
        "Multiple terraces": "th-large",
        "Infinity swimming pool": "swimming-pool",
        "Kids pool": "swimming-pool",
        "Cabanas & hammock forest": "umbrella-beach",
        "Premium lobby & elevators": "building",
        "German kitchen": "utensils",
    };

    return iconNameMap[amenityName] || "star";
};

export const ALL_AMENITIES: Amenity[] = [
    // Air Conditioning & Heating
    { name: "Air Conditioning", iconComponent: getIconComponent("Air Conditioning"), iconName: getIconName("Air Conditioning") },
    { name: "Central Air Conditioning", iconComponent: getIconComponent("Central Air Conditioning"), iconName: getIconName("Central Air Conditioning") },
    { name: "Central A/C", iconComponent: getIconComponent("Central A/C"), iconName: getIconName("Central A/C") },
    { name: "Heating System", iconComponent: getIconComponent("Heating System"), iconName: getIconName("Heating System") },

    // Internet & Technology
    { name: "High-Speed Internet", iconComponent: getIconComponent("High-Speed Internet"), iconName: getIconName("High-Speed Internet") },
    { name: "Fiber Internet", iconComponent: getIconComponent("Fiber Internet"), iconName: getIconName("Fiber Internet") },
    { name: "Satellite TV", iconComponent: getIconComponent("Satellite TV"), iconName: getIconName("Satellite TV") },
    { name: "Smart Home System", iconComponent: getIconComponent("Smart Home System"), iconName: getIconName("Smart Home System") },
    { name: "Home Automation", iconComponent: getIconComponent("Home Automation"), iconName: getIconName("Home Automation") },
    { name: "Smart Lighting", iconComponent: getIconComponent("Smart Lighting"), iconName: getIconName("Smart Lighting") },
    { name: "Voice Control", iconComponent: getIconComponent("Voice Control"), iconName: getIconName("Voice Control") },

    // Furnishing
    { name: "Fully Furnished", iconComponent: getIconComponent("Fully Furnished"), iconName: getIconName("Fully Furnished") },
    { name: "Semi-Furnished", iconComponent: getIconComponent("Semi-Furnished"), iconName: getIconName("Semi-Furnished") },
    { name: "Unfurnished", iconComponent: getIconComponent("Unfurnished"), iconName: getIconName("Unfurnished") },
    { name: "Furnished", iconComponent: getIconComponent("Furnished"), iconName: getIconName("Furnished") },
    { name: "Designer Furnishing", iconComponent: getIconComponent("Designer Furnishing"), iconName: getIconName("Designer Furnishing") },
    { name: "Premium Furnishing", iconComponent: getIconComponent("Premium Furnishing"), iconName: getIconName("Premium Furnishing") },

    // Parking
    { name: "Covered Parking", iconComponent: getIconComponent("Covered Parking"), iconName: getIconName("Covered Parking") },
    { name: "Valet Parking", iconComponent: getIconComponent("Valet Parking"), iconName: getIconName("Valet Parking") },
    { name: "Dedicated Parking", iconComponent: getIconComponent("Dedicated Parking"), iconName: getIconName("Dedicated Parking") },
    { name: "Visitor Parking", iconComponent: getIconComponent("Visitor Parking"), iconName: getIconName("Visitor Parking") },
    { name: "Underground Parking", iconComponent: getIconComponent("Underground Parking"), iconName: getIconName("Underground Parking") },

    // Electric Vehicle
    { name: "Electric Vehicle Charging", iconComponent: getIconComponent("Electric Vehicle Charging"), iconName: getIconName("Electric Vehicle Charging") },
    { name: "EV Charging Station", iconComponent: getIconComponent("EV Charging Station"), iconName: getIconName("EV Charging Station") },

    // Pools
    { name: "Shared Pool", iconComponent: getIconComponent("Shared Pool"), iconName: getIconName("Shared Pool") },
    { name: "Private Pool", iconComponent: getIconComponent("Private Pool"), iconName: getIconName("Private Pool") },
    { name: "Swimming Pool", iconComponent: getIconComponent("Swimming Pool"), iconName: getIconName("Swimming Pool") },
    { name: "Olympic-Size Pool", iconComponent: getIconComponent("Olympic-Size Pool"), iconName: getIconName("Olympic-Size Pool") },
    { name: "Temperature-Controlled Pool", iconComponent: getIconComponent("Temperature-Controlled Pool"), iconName: getIconName("Temperature-Controlled Pool") },
    { name: "Infinity Pool", iconComponent: getIconComponent("Infinity Pool"), iconName: getIconName("Infinity Pool") },
    { name: "Kids Pool", iconComponent: getIconComponent("Kids Pool"), iconName: getIconName("Kids Pool") },
    { name: "Children's Pool", iconComponent: getIconComponent("Children's Pool"), iconName: getIconName("Children's Pool") },
    { name: "Pool Deck", iconComponent: getIconComponent("Pool Deck"), iconName: getIconName("Pool Deck") },
    { name: "Pool Bar", iconComponent: getIconComponent("Pool Bar"), iconName: getIconName("Pool Bar") },
    { name: "Poolside Cabanas", iconComponent: getIconComponent("Poolside Cabanas"), iconName: getIconName("Poolside Cabanas") },
    { name: "Waterfall Feature", iconComponent: getIconComponent("Waterfall Feature"), iconName: getIconName("Waterfall Feature") },
    { name: "Jacuzzi", iconComponent: getIconComponent("Jacuzzi"), iconName: getIconName("Jacuzzi") },
    { name: "Hot Tub", iconComponent: getIconComponent("Hot Tub"), iconName: getIconName("Hot Tub") },

    // Water Features
    { name: "Waterfront", iconComponent: getIconComponent("Waterfront"), iconName: getIconName("Waterfront") },
    { name: "View of Water", iconComponent: getIconComponent("View of Water"), iconName: getIconName("View of Water") },
    { name: "Beach Access", iconComponent: getIconComponent("Beach Access"), iconName: getIconName("Beach Access") },
    { name: "Private Beach", iconComponent: getIconComponent("Private Beach"), iconName: getIconName("Private Beach") },
    { name: "Boat Dock", iconComponent: getIconComponent("Boat Dock"), iconName: getIconName("Boat Dock") },
    { name: "Dock Access", iconComponent: getIconComponent("Dock Access"), iconName: getIconName("Dock Access") },
    { name: "Marina Access", iconComponent: getIconComponent("Marina Access"), iconName: getIconName("Marina Access") },
    { name: "Fishing Pier", iconComponent: getIconComponent("Fishing Pier"), iconName: getIconName("Fishing Pier") },
    { name: "Water Sports", iconComponent: getIconComponent("Water Sports"), iconName: getIconName("Water Sports") },

    // Outdoor Spaces
    { name: "Sun Deck", iconComponent: getIconComponent("Sun Deck"), iconName: getIconName("Sun Deck") },

    // Security
    { name: "Security", iconComponent: getIconComponent("Security"), iconName: getIconName("Security") },
    { name: "Gated Community", iconComponent: getIconComponent("Gated Community"), iconName: getIconName("Gated Community") },
    { name: "24/7 Security", iconComponent: getIconComponent("24/7 Security"), iconName: getIconName("24/7 Security") },
    { name: "Security Guards", iconComponent: getIconComponent("Security Guards"), iconName: getIconName("Security Guards") },
    { name: "Access Control", iconComponent: getIconComponent("Access Control"), iconName: getIconName("Access Control") },
    { name: "CCTV Surveillance", iconComponent: getIconComponent("CCTV Surveillance"), iconName: getIconName("CCTV Surveillance") },
    { name: "Biometric Access", iconComponent: getIconComponent("Biometric Access"), iconName: getIconName("Biometric Access") },

    // Safety & Backup
    { name: "Backup Power", iconComponent: getIconComponent("Backup Power"), iconName: getIconName("Backup Power") },
    { name: "Generator Backup", iconComponent: getIconComponent("Generator Backup"), iconName: getIconName("Generator Backup") },
    { name: "Fire Safety System", iconComponent: getIconComponent("Fire Safety System"), iconName: getIconName("Fire Safety System") },
    { name: "Smoke Detectors", iconComponent: getIconComponent("Smoke Detectors"), iconName: getIconName("Smoke Detectors") },
    { name: "Safe Room", iconComponent: getIconComponent("Safe Room"), iconName: getIconName("Safe Room") },
    { name: "Panic Room", iconComponent: getIconComponent("Panic Room"), iconName: getIconName("Panic Room") },

    // Fitness & Wellness
    { name: "Gym/Fitness Center", iconComponent: getIconComponent("Gym/Fitness Center"), iconName: getIconName("Gym/Fitness Center") },
    { name: "Fully Equipped Gym", iconComponent: getIconComponent("Fully Equipped Gym"), iconName: getIconName("Fully Equipped Gym") },
    { name: "Shared Gym", iconComponent: getIconComponent("Shared Gym"), iconName: getIconName("Shared Gym") },
    { name: "Personal Training Studio", iconComponent: getIconComponent("Personal Training Studio"), iconName: getIconName("Personal Training Studio") },
    { name: "Yoga Studio", iconComponent: getIconComponent("Yoga Studio"), iconName: getIconName("Yoga Studio") },
    { name: "Pilates Studio", iconComponent: getIconComponent("Pilates Studio"), iconName: getIconName("Pilates Studio") },
    { name: "Spa & Wellness", iconComponent: getIconComponent("Spa & Wellness"), iconName: getIconName("Spa & Wellness") },

    // Pool & Outdoor
    { name: "Baja shelf", iconComponent: getIconComponent("Baja shelf"), iconName: getIconName("Baja shelf") },
    { name: "Cabana area", iconComponent: getIconComponent("Cabana area"), iconName: getIconName("Cabana area") },
    { name: "Sunken climate-cooled balconies", iconComponent: getIconComponent("Sunken climate-cooled balconies"), iconName: getIconName("Sunken climate-cooled balconies") },
    { name: "Winter gardens", iconComponent: getIconComponent("Winter gardens"), iconName: getIconName("Winter gardens") },
    { name: "Hammock forest", iconComponent: getIconComponent("Hammock forest"), iconName: getIconName("Hammock forest") },
    { name: "Outdoor cinema", iconComponent: getIconComponent("Outdoor cinema"), iconName: getIconName("Outdoor cinema") },
    { name: "Kids cooled playground", iconComponent: getIconComponent("Kids cooled playground"), iconName: getIconName("Kids cooled playground") },
    { name: "Vegetable garden", iconComponent: getIconComponent("Vegetable garden"), iconName: getIconName("Vegetable garden") },
    { name: "BBQ area", iconComponent: getIconComponent("BBQ area"), iconName: getIconName("BBQ area") },
    { name: "Premium lobby", iconComponent: getIconComponent("Premium lobby"), iconName: getIconName("Premium lobby") },
    { name: "Elevator access", iconComponent: getIconComponent("Elevator access"), iconName: getIconName("Elevator access") },

    // User-requested amenities (exact names)
    { name: "Private Winter Garden", iconComponent: getIconComponent("Private Winter Garden"), iconName: getIconName("Private Winter Garden") },
    { name: "Sunken climate-controlled balconies", iconComponent: getIconComponent("Sunken climate-controlled balconies"), iconName: getIconName("Sunken climate-controlled balconies") },
    { name: "Multiple terraces", iconComponent: getIconComponent("Multiple terraces"), iconName: getIconName("Multiple terraces") },
    { name: "Infinity swimming pool", iconComponent: getIconComponent("Infinity swimming pool"), iconName: getIconName("Infinity swimming pool") },
    { name: "Kids pool", iconComponent: getIconComponent("Kids pool"), iconName: getIconName("Kids pool") },
    { name: "Yoga zone", iconComponent: getIconComponent("Yoga zone"), iconName: getIconName("Yoga zone") },
    { name: "Gym", iconComponent: getIconComponent("Gym"), iconName: getIconName("Gym") },
    { name: "Cabanas & hammock forest", iconComponent: getIconComponent("Cabanas & hammock forest"), iconName: getIconName("Cabanas & hammock forest") },
    { name: "Premium lobby & elevators", iconComponent: getIconComponent("Premium lobby & elevators"), iconName: getIconName("Premium lobby & elevators") },
    { name: "German kitchen", iconComponent: getIconComponent("German kitchen"), iconName: getIconName("German kitchen") },
];

// Helper function to get default icon component for an amenity
export const getDefaultAmenityIcon = (amenityName: string): IconComponent => {
    const amenity = ALL_AMENITIES.find(a => a.name === amenityName);
    return amenity?.iconComponent || FaStar;
};

// Helper function to get icon name identifier for storage
export const getDefaultAmenityIconName = (amenityName: string): string => {
    const amenity = ALL_AMENITIES.find(a => a.name === amenityName);
    return amenity?.iconName || "star";
};

// Helper function to convert icon name to a storage-friendly format
// For backend storage, we'll use a prefix to identify react-icons
export const getDefaultAmenityIconUrl = (amenityName: string): string => {
    const iconName = getDefaultAmenityIconName(amenityName);
    // Store as "react-icon:icon-name" format for backend
    return `react-icon:${iconName}`;
};

