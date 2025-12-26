'use client';

import { useState } from 'react';
import { Country, PhoneNumber } from '@/lib/types';
import { countries, phoneNumbers } from '@/lib/data';
import { CountrySelector } from '@/components/country-selector';
import { PhoneList } from '@/components/phone-list';
import { VerificationCodes } from '@/components/verification-codes';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';

type View = 'countries' | 'phones' | 'codes';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('countries');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<PhoneNumber | null>(null);

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setCurrentView('phones');
  };

  const handleSelectPhone = (phone: PhoneNumber) => {
    setSelectedPhone(phone);
    setCurrentView('codes');
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setCurrentView('countries');
  };

  const handleBackToPhones = () => {
    setSelectedPhone(null);
    setCurrentView('phones');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <Toaster position="top-center" richColors />

      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 py-12"
        >
          {currentView === 'countries' && (
            <CountrySelector
              countries={countries}
              onSelectCountry={handleSelectCountry}
            />
          )}

          {currentView === 'phones' && selectedCountry && (
            <PhoneList
              country={selectedCountry}
              phoneNumbers={phoneNumbers[selectedCountry.code]}
              onSelectPhone={handleSelectPhone}
              onBack={handleBackToCountries}
            />
          )}

          {currentView === 'codes' && selectedCountry && selectedPhone && (
            <VerificationCodes
              country={selectedCountry}
              phone={selectedPhone}
              onBack={handleBackToPhones}
            />
          )}
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="container mx-auto px-4 py-8 mt-12"
        >
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              This is a demo service. Numbers and codes are simulated for demonstration purposes.
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
