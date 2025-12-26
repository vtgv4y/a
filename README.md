# Receive SMS Online - Apple Style

A beautiful, Apple-inspired temporary phone number verification code receiver built with Next.js.

## Features

- **Apple-Style Design**: Clean, minimalist interface with glassmorphism effects and smooth animations
- **Country Selection**: Choose from 8 popular countries (US, UK, Canada, Germany, France, Japan, Australia, Singapore)
- **Phone Number Selection**: 3 available phone numbers per country
- **Real-time SMS Reception**: Simulated verification codes that appear automatically
- **Auto-refresh**: New messages arrive every 30 seconds
- **Code Expiration**: Codes expire after 5 minutes for security
- **One-click Copy**: Easy copy-to-clipboard functionality with toast notifications
- **Responsive Design**: Works perfectly on mobile and desktop
- **Dark Mode Support**: Automatic dark mode detection

## Tech Stack

- **Next.js 13.5** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── country-selector.tsx     # Country selection component
│   ├── phone-list.tsx           # Phone number list component
│   └── verification-codes.tsx   # SMS verification codes component
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   ├── data.ts           # Mock data for countries, phones, and SMS
│   └── utils.ts          # Utility functions
```

## Features Details

### Country Selection
- Grid layout with country cards
- Hover animations and transitions
- Country flags and dial codes
- 8 popular countries to choose from

### Phone Number Management
- Formatted phone numbers with country codes
- Availability status indicators
- Smooth selection animations

### Verification Codes
- Real-time display of incoming codes
- Service name and timestamp
- Auto-expiration after 5 minutes
- Refresh button for manual updates
- Copy to clipboard with visual feedback

## Design Philosophy

This project follows Apple's design principles:

- **Simplicity**: Clean, uncluttered interface
- **Clarity**: Clear visual hierarchy and readable typography
- **Depth**: Layered effects with glassmorphism
- **Deference**: Content-focused design
- **Feedback**: Immediate visual response to interactions

## Customization

### Adding More Countries

Edit `lib/data.ts` to add more countries:

```typescript
export const countries: Country[] = [
  { code: 'XX', name: 'Country Name', flag: '🇽🇽', dialCode: '+00' },
  // ...
];
```

### Modifying Phone Numbers

Add phone numbers for each country in `lib/data.ts`:

```typescript
export const phoneNumbers: Record<string, PhoneNumber[]> = {
  XX: [
    { id: 'xx1', number: '123-456-7890', countryCode: '+00', available: true },
  ],
};
```

### Adjusting Refresh Interval

Change the auto-refresh interval in `components/verification-codes.tsx`:

```typescript
// Change 30000 (30 seconds) to your desired interval
setInterval(() => { ... }, 30000);
```

### Modifying Expiration Time

Adjust code expiration time in `components/verification-codes.tsx`:

```typescript
// Change 5 * 60 * 1000 (5 minutes) to your desired time
expired: now.getTime() - code.timestamp.getTime() > 5 * 60 * 1000
```

## License

MIT

## Note

This is a demo application. All phone numbers and verification codes are simulated for demonstration purposes only.
