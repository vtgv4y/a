'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { countries, generatePhoneNumber, searchCountries, type CountryData } from '@/lib/phoneData';
import { NavigationMenu, MenuButton } from '@/components/NavigationMenu';
import { Icon } from '@/components/Icon';
import { haptic } from '@/lib/utils';

const loadFlagIcon = async (countryCode: string) => {
  try {
    const flags = await import('country-flag-icons/react/3x2');
    const FlagComponent = flags[countryCode as keyof typeof flags];
    if (FlagComponent && typeof FlagComponent === 'function') {
      return FlagComponent;
    }
    return null;
  } catch {
    return null;
  }
};

const CountryFlag = memo(({ countryCode, className = "w-8 h-6" }: { countryCode: string; className?: string }) => {
  const [FlagComponent, setFlagComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    loadFlagIcon(countryCode)
      .then((component) => {
        if (component) {
          setFlagComponent(() => component);
        } else {
          setFlagComponent(null);
        }
      })
      .catch(() => {
        setFlagComponent(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [countryCode]);

  if (isLoading || !FlagComponent) {
    return (
      <div className={`${className} bg-muted rounded flex items-center justify-center`}>
        <Icon name="globe" className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`${className} rounded overflow-hidden border border-border`}>
      <FlagComponent className="w-full h-full object-cover" title={countryCode} />
    </div>
  );
});
CountryFlag.displayName = 'CountryFlag';

const STORAGE_KEY_COUNTRY = 'phone_generator_selected_country';
const STORAGE_KEY_COUNT = 'phone_generator_count';

interface CountrySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (country: CountryData) => void;
  currentCountry: CountryData | null;
}

const CountrySelector = memo(({ isOpen, onClose, onSelect, currentCountry }: CountrySelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(0);
    }, 200);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchQuery]);

  const filteredCountries = useMemo(() => {
    return searchCountries(debouncedQuery);
  }, [debouncedQuery]);

  const paginatedCountries = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return filteredCountries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCountries, page]);

  const totalPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchQuery('');
      setPage(0);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [page]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="h-full flex flex-col bg-background">
        <div className="shrink-0 p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              选择国家/地区
            </h2>
            <button
              onClick={() => { haptic(20); onClose(); }}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Icon name="close" className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索国家或区号..."
              className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => { haptic(20); setSearchQuery(''); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon name="close" className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="text-muted-foreground text-xs mt-2">
            找到 {filteredCountries.length} 个国家
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {paginatedCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => {
                  haptic(30);
                  onSelect(country);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  currentCountry?.id === country.id
                    ? 'bg-accent border-border'
                    : 'bg-card border-border hover:bg-accent'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <CountryFlag countryCode={country.id} className="w-10 h-7 shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-foreground font-medium text-sm truncate">
                      {country.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {country.code}
                    </div>
                  </div>
                </div>
                {currentCountry?.id === country.id && (
                  <Icon name="check" className="w-5 h-5 text-primary shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="shrink-0 p-4 border-t border-border">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { haptic(20); setPage(p => Math.max(0, p - 1)); }}
                disabled={page === 0}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                上一页
              </button>
              <span className="text-muted-foreground text-sm min-w-[60px] text-center">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => { haptic(20); setPage(p => Math.min(totalPages - 1, p + 1)); }}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
CountrySelector.displayName = 'CountrySelector';

export default function PhoneGeneratorPage() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [generatedNumbers, setGeneratedNumbers] = useState<string[]>([]);
  const [count, setCount] = useState<number>(10);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    try {
      const savedCountryId = localStorage.getItem(STORAGE_KEY_COUNTRY);
      const savedCount = localStorage.getItem(STORAGE_KEY_COUNT);

      if (savedCountryId) {
        const country = countries.find(c => c.id === savedCountryId);
        if (country) {
          setSelectedCountry(country);
        } else {
          setSelectedCountry(countries[0]);
        }
      } else {
        setSelectedCountry(countries[0]);
      }

      if (savedCount) {
        const parsedCount = parseInt(savedCount, 10);
        if (parsedCount > 0 && parsedCount <= 10000) {
          setCount(parsedCount);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSelectedCountry(countries[0]);
    }
  }, []);

  const handleSelectCountry = useCallback((country: CountryData) => {
    setSelectedCountry(country);
    setGeneratedNumbers([]);
    setPage(0);
    try {
      localStorage.setItem(STORAGE_KEY_COUNTRY, country.id);
    } catch (error) {
      console.error('Failed to save country:', error);
    }
  }, []);

  const handleGenerate = useCallback(() => {
    if (!selectedCountry) return;
    haptic(50);

    requestAnimationFrame(() => {
      if (count <= 2000) {
        const numbers = generatePhoneNumber(selectedCountry, count);
        setGeneratedNumbers(numbers);
      } else {
        const batchSize = 1000;
        const batches = Math.ceil(count / batchSize);
        const allNumbers: string[] = [];

        for (let i = 0; i < batches; i++) {
          const currentBatchSize = Math.min(batchSize, count - i * batchSize);
          const batchNumbers = generatePhoneNumber(selectedCountry, currentBatchSize);
          allNumbers.push(...batchNumbers);
        }

        setGeneratedNumbers(allNumbers);
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY_COUNT, count.toString());
    } catch (error) {
      console.error('Failed to save count:', error);
    }
  }, [selectedCountry, count]);

  const handleCopy = useCallback(async (text: string, index: number) => {
    haptic(30);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (error) {
      console.error('Copy failed:', error);
      haptic(50);
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    haptic(30);
    try {
      const text = generatedNumbers.join('\n');
      await navigator.clipboard.writeText(text);
      setIsCopiedAll(true);
      setTimeout(() => setIsCopiedAll(false), 1500);
    } catch (error) {
      console.error('Copy all failed:', error);
      haptic(50);
    }
  }, [generatedNumbers]);

  const handleDownload = useCallback(() => {
    haptic(30);
    if (generatedNumbers.length === 0) return;

    const text = generatedNumbers.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    a.download = `${selectedCountry?.name || 'phone'}_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedNumbers, selectedCountry]);

  const paginatedNumbers = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return generatedNumbers.slice(start, start + ITEMS_PER_PAGE);
  }, [generatedNumbers, page]);

  const totalPages = Math.ceil(generatedNumbers.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground">
            手机号生成器
          </h1>
          <MenuButton onClick={() => { haptic(20); setShowMenu(true); }} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <button
            onClick={() => { haptic(20); setShowCountrySelector(true); }}
            className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {selectedCountry ? (
                <CountryFlag countryCode={selectedCountry.id} className="w-12 h-9 shrink-0" />
              ) : (
                <div className="shrink-0 w-12 h-9 bg-muted rounded flex items-center justify-center">
                  <Icon name="globe" className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <div className="text-muted-foreground text-xs mb-0.5">当前地区</div>
                <div className="text-foreground font-semibold text-base truncate">
                  {selectedCountry?.name || '选择国家'}
                </div>
                <div className="text-muted-foreground text-sm">
                  {selectedCountry?.code || ''}
                </div>
              </div>
            </div>
            <Icon name="chevronRight" className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-sm p-4 space-y-4">
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              生成数量
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val > 0 && val <= 10000) setCount(val);
              }}
              min="1"
              max="10000"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="text-muted-foreground text-xs mt-1.5">
              最多支持生成 10000 个号码
            </div>
          </div>

          <button
            ref={buttonRef}
            onClick={handleGenerate}
            disabled={!selectedCountry}
            className="w-full py-3 bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon name="sparkles" className="w-4 h-4" />
            <span>生成号码</span>
          </button>
        </div>

        {generatedNumbers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground font-semibold text-base">
                生成结果 ({generatedNumbers.length})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className="p-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  {isCopiedAll ? (
                    <Icon name="check" className="w-5 h-5 text-primary" />
                  ) : (
                    <Icon name="copy" className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <Icon name="download" className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="divide-y divide-border">
                {paginatedNumbers.map((number, idx) => {
                  const actualIndex = page * ITEMS_PER_PAGE + idx;
                  const isCopied = copiedIndex === actualIndex;
                  return (
                    <button
                      key={actualIndex}
                      onClick={() => handleCopy(number, actualIndex)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors"
                    >
                      <span className="text-foreground font-mono text-sm truncate">
                        {number}
                      </span>
                      {isCopied ? (
                        <Icon name="check" className="w-4 h-4 text-primary ml-3 shrink-0" />
                      ) : (
                        <Icon name="copy" className="w-4 h-4 text-muted-foreground ml-3 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => { haptic(20); setPage(p => Math.max(0, p - 1)); }}
                  disabled={page === 0}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  上一页
                </button>
                <span className="text-muted-foreground text-sm">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => { haptic(20); setPage(p => Math.min(totalPages - 1, p + 1)); }}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}

        <footer className="pt-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            支持 {countries.length} 个国家/地区
          </p>
          <p className="text-xs text-muted-foreground">
            生成的号码仅供测试使用
          </p>
        </footer>
      </main>

      <CountrySelector
        isOpen={showCountrySelector}
        onClose={() => setShowCountrySelector(false)}
        onSelect={handleSelectCountry}
        currentCountry={selectedCountry}
      />

      <NavigationMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </div>
  );
}
