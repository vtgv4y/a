import { Country, PhoneNumber, VerificationCode } from './types';

export const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
];

export const phoneNumbers: Record<string, PhoneNumber[]> = {
  US: [
    { id: 'us1', number: '(555) 123-4567', countryCode: '+1', available: true },
    { id: 'us2', number: '(555) 234-5678', countryCode: '+1', available: true },
    { id: 'us3', number: '(555) 345-6789', countryCode: '+1', available: true },
  ],
  GB: [
    { id: 'gb1', number: '7700 123456', countryCode: '+44', available: true },
    { id: 'gb2', number: '7700 234567', countryCode: '+44', available: true },
    { id: 'gb3', number: '7700 345678', countryCode: '+44', available: true },
  ],
  CA: [
    { id: 'ca1', number: '(604) 123-4567', countryCode: '+1', available: true },
    { id: 'ca2', number: '(604) 234-5678', countryCode: '+1', available: true },
    { id: 'ca3', number: '(604) 345-6789', countryCode: '+1', available: true },
  ],
  DE: [
    { id: 'de1', number: '157 12345678', countryCode: '+49', available: true },
    { id: 'de2', number: '157 23456789', countryCode: '+49', available: true },
    { id: 'de3', number: '157 34567890', countryCode: '+49', available: true },
  ],
  FR: [
    { id: 'fr1', number: '6 12 34 56 78', countryCode: '+33', available: true },
    { id: 'fr2', number: '6 23 45 67 89', countryCode: '+33', available: true },
    { id: 'fr3', number: '6 34 56 78 90', countryCode: '+33', available: true },
  ],
  JP: [
    { id: 'jp1', number: '90-1234-5678', countryCode: '+81', available: true },
    { id: 'jp2', number: '90-2345-6789', countryCode: '+81', available: true },
    { id: 'jp3', number: '90-3456-7890', countryCode: '+81', available: true },
  ],
  AU: [
    { id: 'au1', number: '412 345 678', countryCode: '+61', available: true },
    { id: 'au2', number: '423 456 789', countryCode: '+61', available: true },
    { id: 'au3', number: '434 567 890', countryCode: '+61', available: true },
  ],
  SG: [
    { id: 'sg1', number: '8123 4567', countryCode: '+65', available: true },
    { id: 'sg2', number: '8234 5678', countryCode: '+65', available: true },
    { id: 'sg3', number: '8345 6789', countryCode: '+65', available: true },
  ],
};

const services = [
  'WhatsApp',
  'Telegram',
  'Instagram',
  'Facebook',
  'Twitter',
  'Google',
  'Microsoft',
  'Amazon',
  'Apple',
  'Netflix',
];

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateMockVerificationCodes = (count: number = 5): VerificationCode[] => {
  const codes: VerificationCode[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 10 * 60 * 1000);
    const expired = now.getTime() - timestamp.getTime() > 5 * 60 * 1000;

    codes.push({
      id: `code-${Date.now()}-${i}`,
      service: services[Math.floor(Math.random() * services.length)],
      code: generateVerificationCode(),
      timestamp,
      expired,
    });
  }

  return codes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
