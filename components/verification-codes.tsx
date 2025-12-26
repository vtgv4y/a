'use client';

import { useState, useEffect } from 'react';
import { PhoneNumber, Country, VerificationCode } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, RefreshCw, Phone, Clock, AlertCircle } from 'lucide-react';
import { generateMockVerificationCodes } from '@/lib/data';
import { toast } from 'sonner';

interface VerificationCodesProps {
  country: Country;
  phone: PhoneNumber;
  onBack: () => void;
}

export function VerificationCodes({ country, phone, onBack }: VerificationCodesProps) {
  const [codes, setCodes] = useState<VerificationCode[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setCodes(generateMockVerificationCodes(5));

    const interval = setInterval(() => {
      setCodes((prevCodes) => {
        const now = new Date();
        const updatedCodes = prevCodes.map((code) => ({
          ...code,
          expired: now.getTime() - code.timestamp.getTime() > 5 * 60 * 1000,
        }));

        if (Math.random() > 0.7) {
          const newCodes = generateMockVerificationCodes(1);
          return [...newCodes, ...updatedCodes].slice(0, 10);
        }

        return updatedCodes;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newCodes = generateMockVerificationCodes(2);
      setCodes((prevCodes) => [...newCodes, ...prevCodes].slice(0, 10));
      setIsRefreshing(false);
      toast.success('Messages refreshed');
    }, 1000);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -5 }}
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-lg">Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Number</p>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-semibold text-gray-900 dark:text-white font-mono">
                  {phone.countryCode} {phone.number}
                </span>
                <span className="text-2xl">{country.flag}</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Active and receiving messages</span>
        </div>
      </motion.div>

      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Verification Codes
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Messages will appear here automatically. Codes expire after 5 minutes.
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {codes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Waiting for messages...
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {codes.map((code, index) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border ${
                  code.expired
                    ? 'border-red-200/50 dark:border-red-900/50 opacity-60'
                    : 'border-gray-200/50 dark:border-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {code.service}
                      </span>
                      {code.expired && (
                        <span className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          <span>Expired</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white font-mono tracking-wider">
                        {code.code}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(code.code)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(code.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50"
      >
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          How to use
        </h4>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">1.</span>
            <span>Use this number to register on any service</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">2.</span>
            <span>Verification codes will appear here automatically</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">3.</span>
            <span>Click the copy button to copy the code</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">4.</span>
            <span>Codes expire after 5 minutes for security</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
