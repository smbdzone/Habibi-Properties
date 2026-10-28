# Marry Homes - Real Estate Dashboard

A modern, scalable real estate dashboard built with Next.js 16, TypeScript, and Tailwind CSS.

## 🏗️ Project Structure

```
marry-homes/
├── public/                 # Static assets (images, icons, etc.)
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── layout.tsx     # Root layout with Header/Footer
│   │   ├── page.tsx       # Home page
│   │   └── globals.css    # Global styles
│   │
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/       # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── features/     # Feature-specific components
│   │       ├── PropertyCard.tsx
│   │       ├── PropertyFilter.tsx
│   │       └── index.ts
│   │
│   ├── features/         # Feature modules (page-level components)
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── index.ts
│   │
│   ├── lib/              # External library configurations
│   │   └── api.ts        # API client functions
│   │
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # All type definitions
│   │
│   ├── utils/            # Utility functions
│   │   ├── index.ts      # General utilities
│   │   └── validation.ts # Validation functions
│   │
│   └── constants/        # Application constants
│       └── index.ts      # All constants
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## 📁 Folder Structure Explained

### `/src/app`
Next.js App Router directory. Contains pages and layouts.

### `/src/components`
Reusable React components organized by purpose:
- **`ui/`**: Basic, reusable UI components (Button, Input, Card, etc.)
- **`layout/`**: Layout components (Header, Footer, Sidebar, etc.)
- **`features/`**: Feature-specific components (PropertyCard, PropertyFilter, etc.)

### `/src/features`
Feature modules for page-level components. Use this for complex features that might have their own sub-components, hooks, and utilities.

### `/src/hooks`
Custom React hooks for reusable logic:
- `useLocalStorage`: Persist state to localStorage
- `useDebounce`: Debounce values for search/filtering
- `useMediaQuery`: Responsive design hooks

### `/src/lib`
External library configurations and wrappers:
- API clients
- Third-party service integrations
- Database connections

### `/src/types`
TypeScript type definitions for:
- Domain models (Property, Agent, etc.)
- Component props
- API responses
- Utility types

### `/src/utils`
Pure utility functions:
- Formatting (currency, dates, numbers)
- String manipulation
- Validation
- Common helpers

### `/src/constants`
Application-wide constants:
- API endpoints
- Route paths
- Configuration values
- Enum-like data structures

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🛠️ Technologies

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Utility-first CSS
- **React 19**: UI library

## 📝 Key Features

- ✅ Type-safe with TypeScript
- ✅ Responsive design with Tailwind CSS
- ✅ Component-based architecture
- ✅ Reusable UI components
- ✅ Custom hooks for common patterns
- ✅ Utility functions for formatting/validation
- ✅ API client abstraction
- ✅ Constants management

## 🎨 Component Usage Examples

### Button
```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

### Card
```tsx
import { Card, CardHeader, CardBody } from "@/components/ui";

<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

### PropertyCard
```tsx
import { PropertyCard } from "@/components/features";
import { Property } from "@/types";

<PropertyCard property={property} />
```

## 🔧 Utilities

### Formatting
```tsx
import { formatCurrency, formatArea, formatDate } from "@/utils";

formatCurrency(450000); // "$450,000"
formatArea(2500); // "2,500 sq ft"
formatDate(new Date()); // "Jan 12, 2025"
```

### Hooks
```tsx
import { useLocalStorage, useDebounce } from "@/hooks";

const [value, setValue] = useLocalStorage("key", "default");
const debouncedValue = useDebounce(searchQuery, 500);
```

## 📦 Adding New Features

1. **Create types** in `/src/types/index.ts`
2. **Add constants** in `/src/constants/index.ts` if needed
3. **Create components** in appropriate folder:
   - UI components → `/src/components/ui`
   - Feature components → `/src/components/features`
4. **Add utilities** in `/src/utils` if needed
5. **Create hooks** in `/src/hooks` for reusable logic
6. **Update API client** in `/src/lib/api.ts` if needed

## 🎯 Best Practices

- ✅ Use TypeScript for all new files
- ✅ Keep components small and focused
- ✅ Extract reusable logic into hooks
- ✅ Use utility functions for formatting/validation
- ✅ Follow the folder structure conventions
- ✅ Export components through index files
- ✅ Use path aliases (`@/`) for imports

## 📄 License

Private project - All rights reserved
