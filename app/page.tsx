'use client';

import { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import { FreeNoticeModal } from './FreeNoticeModal';
import { NavigationMenu, MenuButton } from '@/components/NavigationMenu';
import { countries, CountryConfig } from '@/lib/countryData';
import { Icon } from '@/components/Icon';
import { haptic } from '@/lib/utils';
import {
  generateName,
  generateBirthday,
  generatePhone,
  generatePassword,
  generateEmail,
  getCountryConfig,
  getAllDomains
} from '@/lib/generator';

// 动态导入国旗库
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
      <div className={`${className} bg-primary rounded flex items-center justify-center`}>
        <Icon name="globe" className="w-4 h-4 text-primary-foreground" />
      </div>
    );
  }

  return (
    <div className={`${className} rounded overflow-hidden shadow-sm border border-border`}>
      <FlagComponent className="w-full h-full object-cover" title={countryCode} />
    </div>
  );
});
CountryFlag.displayName = 'CountryFlag';

interface UserInfo {
  firstName: string;
  lastName: string;
  birthday: string;
  phone: string;
  password: string;
  email: string;
}

const InfoRow = memo(({ label, value, onCopy, isCopied, isLast = false }: {
  label: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
  isLast?: boolean;
}) => (
  <div
    onClick={onCopy}
    className={`group relative flex items-center justify-between py-3.5 px-4 cursor-pointer transition-colors hover:bg-accent rounded-md ${
      isCopied ? 'bg-primary/10' : ''
    } ${!isLast ? 'border-b border-border' : ''}`}
  >
    <span className="text-sm font-medium text-muted-foreground w-20 shrink-0">
      {label}
    </span>

    <div className="flex items-center gap-3 min-w-0 flex-1 justify-end h-6 relative overflow-hidden">
      <span
        className={`absolute right-0 text-sm font-semibold truncate transition-all duration-300 ${
          isCopied ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100 text-foreground'
        }`}
      >
        {value || '---'}
      </span>

      <div
        className={`absolute right-0 flex items-center gap-1.5 transition-all duration-300 ${
          isCopied ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-90 pointer-events-none'
        }`}
      >
        <div className="bg-primary rounded-full p-0.5">
          <Icon name="check" className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-primary">
          已复制
        </span>
      </div>
    </div>
  </div>
));
InfoRow.displayName = 'InfoRow';

const BottomSheet = memo(({
  isOpen,
  onClose,
  title,
  children,
  rightAction
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        <div className="p-4 border-b border-border sticky top-0 z-10 shrink-0 bg-card">
          <div className="w-10 h-1.5 bg-muted rounded-full mx-auto mb-4" />
          <div className="relative flex items-center justify-center min-h-[24px]">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            {rightAction ? (
              <div className="absolute right-0 top-1/2 -translate-y-1/2">{rightAction}</div>
            ) : (
              <button
                onClick={onClose}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-md transition-colors"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
});
BottomSheet.displayName = 'BottomSheet';

const ListItem = memo(({ label, isSelected, onClick, icon }: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
      isSelected
        ? 'bg-primary text-primary-foreground font-medium'
        : 'hover:bg-accent text-foreground'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon && (
        <div className={`p-1.5 rounded-md ${isSelected ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
          <Icon name={icon} className={`w-4 h-4 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
        </div>
      )}
      <span className="text-sm">{label}</span>
    </div>
    {isSelected && <Icon name="check" className="w-5 h-5" />}
  </button>
));
ListItem.displayName = 'ListItem';

const CountryList = memo(({ countries, selectedCode, onSelect }: {
  countries: CountryConfig[];
  selectedCode: string;
  onSelect: (c: CountryConfig) => void;
}) => (
  <div className="p-4 space-y-2">
    {countries.map((country) => (
      <button
        key={country.code}
        onClick={() => onSelect(country)}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors border ${
          selectedCode === country.code
            ? 'bg-primary/10 border-primary'
            : 'bg-card border-border hover:bg-accent'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CountryFlag countryCode={country.code} className="w-10 h-7 shrink-0" />
          <span className="text-sm font-medium truncate">
            {country.name}
          </span>
        </div>
        {selectedCode === country.code && (
          <Icon name="check" className="w-5 h-5 text-primary shrink-0 ml-2" />
        )}
      </button>
    ))}
  </div>
));
CountryList.displayName = 'CountryList';

const DomainList = memo(({ allDomains, selectedDomain, onSelect }: {
  allDomains: string[];
  selectedDomain: string;
  onSelect: (d: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setVisibleCount(50);
    }, 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchQuery]);

  const filteredDomains = useMemo(() => {
    if (!debouncedQuery) return allDomains;
    const query = debouncedQuery.toLowerCase();
    return allDomains.filter(d => d.toLowerCase().includes(query));
  }, [allDomains, debouncedQuery]);

  const visibleDomains = useMemo(() => {
    return filteredDomains.slice(0, visibleCount);
  }, [filteredDomains, visibleCount]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredDomains.length) {
          setVisibleCount(prev => Math.min(prev + 50, filteredDomains.length));
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [visibleCount, filteredDomains.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pb-2 sticky top-0 z-10 bg-card">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="w-4 h-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索域名"
            className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <div className="bg-muted rounded-full p-0.5">
                <Icon name="close" className="w-3 h-3" />
              </div>
            </button>
          )}
        </div>
      </div>
      <div className="p-4 pt-2 space-y-2">
        {!debouncedQuery && (
          <ListItem
            label="随机域名"
            isSelected={selectedDomain === 'random'}
            onClick={() => onSelect('random')}
            icon="sparkles"
          />
        )}
        {visibleDomains.map((domain) => (
          <ListItem
            key={domain}
            label={domain}
            isSelected={selectedDomain === domain}
            onClick={() => onSelect(domain)}
          />
        ))}
        {visibleCount < filteredDomains.length && (
          <div ref={sentinelRef} className="py-4 text-center">
            <div className="inline-block w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {filteredDomains.length === 0 && debouncedQuery && (
          <div className="text-center py-8 text-muted-foreground text-sm">无匹配结果</div>
        )}
      </div>
    </div>
  );
});
DomainList.displayName = 'DomainList';

export default function GlassStylePage() {
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(countries[0]);
  const [selectedDomain, setSelectedDomain] = useState<string>('random');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '', lastName: '', birthday: '', phone: '', password: '', email: ''
  });
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [showDomainSheet, setShowDomainSheet] = useState(false);
  const [ipInfo, setIpInfo] = useState({ ip: '...', country: 'US' });
  const [isInitialized, setIsInitialized] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [inboxStatus, setInboxStatus] = useState<'idle' | 'opening'>('idle');
  const [showMenu, setShowMenu] = useState(false);

  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    haptic(30);
    try {
      await navigator.clipboard.writeText(text);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      setCopiedField(label);
      copyTimerRef.current = setTimeout(() => setCopiedField(null), 1500);
    } catch {
      haptic(50);
    }
  }, []);

  const generate = useCallback(() => {
    haptic(50);
    setCopiedField(null);

    try {
      const { firstName, lastName } = generateName(selectedCountry.code);
      const birthday = generateBirthday();
      const phone = generatePhone(selectedCountry);
      const password = generatePassword();
      const customDomain = selectedDomain === 'random' ? undefined : selectedDomain;
      const email = generateEmail(firstName, lastName, customDomain);
      setUserInfo({ firstName, lastName, birthday, phone, password, email });
    } catch (error) {
      console.error(error);
    }
  }, [selectedCountry, selectedDomain]);

  const handleInboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (inboxStatus === 'opening') return;
    haptic(30);
    setInboxStatus('opening');
    const emailName = userInfo.email.split('@')[0];
    setTimeout(() => {
      window.open(`https://yopmail.net/?login=${emailName}`, '_blank');
      setInboxStatus('idle');
    }, 600);
  }, [userInfo.email, inboxStatus]);

  useEffect(() => {
    let isMounted = true;
    const initializeApp = async () => {
      try {
        const response = await fetch('/api/ip-info');
        const data = await response.json();
        if (!isMounted) return;
        setIpInfo({ ip: data.ip || '未知', country: data.country || 'US' });
        if (data.country && data.accurate) {
          const detectedCountry = getCountryConfig(data.country);
          if (detectedCountry) setSelectedCountry(detectedCountry);
        }
        setIsInitialized(true);
      } catch (error) {
        if (isMounted) {
          setIpInfo({ ip: '检测失败', country: 'US' });
          setIsInitialized(true);
        }
      }
    };
    initializeApp();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isInitialized && !userInfo.firstName) {
      try {
        const { firstName, lastName } = generateName(selectedCountry.code);
        const birthday = generateBirthday();
        const phone = generatePhone(selectedCountry);
        const password = generatePassword();
        const customDomain = selectedDomain === 'random' ? undefined : selectedDomain;
        const email = generateEmail(firstName, lastName, customDomain);
        setUserInfo({ firstName, lastName, birthday, phone, password, email });
      } catch (e) {
        console.error(e);
      }
    }
  }, [isInitialized, userInfo.firstName, selectedCountry, selectedDomain]);

  useEffect(() => {
    if (isInitialized && userInfo.firstName) generate();
  }, [selectedCountry.code]);

  const allDomains = useMemo(() => getAllDomains(), []);
  const displayDomain = selectedDomain === 'random' ? '随机' : selectedDomain;

  const handleCountrySelect = useCallback((country: CountryConfig) => {
    haptic(20);
    setSelectedCountry(country);
    setShowCountrySheet(false);
  }, []);

  const handleDomainSelect = useCallback((domain: string) => {
    haptic(20);
    setSelectedDomain(domain);
    setShowDomainSheet(false);
  }, []);

  return (
    <div className="min-h-screen relative pb-10">

      <FreeNoticeModal />

      <div className="relative z-10">

        <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-14 items-center justify-between px-4">
            <h1 className="text-lg font-semibold">
              脸书小助手
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono">{ipInfo.ip}</span>
              </div>
              <MenuButton onClick={() => { haptic(20); setShowMenu(true); }} />
            </div>
          </div>
        </header>

        <main className="container max-w-2xl mx-auto px-4 pt-6 pb-10 space-y-6">

          {!isInitialized ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : (
            <>
              <section className="bg-card rounded-lg border border-border shadow-sm">
                <div className="divide-y divide-border">
                  <InfoRow label="姓氏" value={userInfo.lastName} onCopy={() => copyToClipboard(userInfo.lastName, '姓氏')} isCopied={copiedField === '姓氏'} />
                  <InfoRow label="名字" value={userInfo.firstName} onCopy={() => copyToClipboard(userInfo.firstName, '名字')} isCopied={copiedField === '名字'} />
                  <InfoRow label="生日" value={userInfo.birthday} onCopy={() => copyToClipboard(userInfo.birthday, '生日')} isCopied={copiedField === '生日'} />
                  <InfoRow label="手机号" value={userInfo.phone} onCopy={() => copyToClipboard(userInfo.phone, '手机号')} isCopied={copiedField === '手机号'} />
                  <InfoRow label="密码" value={userInfo.password} onCopy={() => copyToClipboard(userInfo.password, '密码')} isCopied={copiedField === '密码'} />

                  <div className="relative flex flex-col p-4">
                    <div
                      className="flex items-center justify-between mb-3 cursor-pointer"
                      onClick={() => copyToClipboard(userInfo.email, '邮箱')}
                    >
                      <span className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                        邮箱
                      </span>

                      <div className="flex items-center gap-3 min-w-0 flex-1 justify-end h-6 relative overflow-hidden">
                        <span
                          className={`absolute right-0 text-sm font-semibold truncate transition-all duration-300 ${
                            copiedField === '邮箱' ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100 text-foreground'
                          }`}
                        >
                          {userInfo.email}
                        </span>
                        <div
                          className={`absolute right-0 flex items-center gap-1.5 transition-all duration-300 ${
                            copiedField === '邮箱' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-90 pointer-events-none'
                          }`}
                        >
                          <div className="bg-primary rounded-full p-0.5">
                            <Icon name="check" className="w-3 h-3 text-primary-foreground" />
                          </div>
                          <span className="text-sm font-semibold text-primary">已复制</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleInboxClick}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                          inboxStatus === 'opening'
                            ? 'bg-green-500/10 border-green-500/50 text-green-600'
                            : 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
                        }`}
                      >
                        {inboxStatus === 'opening' ? (
                          <>
                            <Icon name="open" className="w-3.5 h-3.5" />
                            已打开
                          </>
                        ) : (
                          <>
                            <Icon name="inbox" className="w-3.5 h-3.5" />
                            查看收件箱
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <button
                onClick={generate}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Icon name="sparkles" className="w-5 h-5" />
                生成新身份
              </button>

              <section className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground px-1">
                  生成设置
                </h2>
                <div className="bg-card rounded-lg border border-border shadow-sm divide-y divide-border">
                  <button
                    onClick={() => { haptic(20); setShowCountrySheet(true); }}
                    className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
                  >
                    <span className="text-sm font-medium">
                      选择地区
                    </span>
                    <div className="flex items-center gap-2">
                      <CountryFlag countryCode={selectedCountry.code} className="w-7 h-5" />
                      <span className="text-sm text-muted-foreground">
                        {selectedCountry.name}
                      </span>
                      <Icon name="chevronRight" className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                  <button
                    onClick={() => { haptic(20); setShowDomainSheet(true); }}
                    className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
                  >
                    <span className="text-sm font-medium">
                      邮箱域名
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {displayDomain}
                      </span>
                      <Icon name="chevronRight" className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                </div>
              </section>

              <footer className="pt-4 text-center space-y-3">
                <a
                  href="https://t.me/fang180"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <Icon name="link" className="w-4 h-4" />
                  加入 Telegram 频道
                </a>
                <p className="text-xs text-muted-foreground">
                  支持 {countries.length} 个国家 • {allDomains.length} 个域名
                </p>
              </footer>
            </>
          )}
        </main>
      </div>

      <BottomSheet
        isOpen={showCountrySheet}
        onClose={() => setShowCountrySheet(false)}
        title="选择地区"
      >
        <CountryList
          countries={countries}
          selectedCode={selectedCountry.code}
          onSelect={handleCountrySelect}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={showDomainSheet}
        onClose={() => setShowDomainSheet(false)}
        title="选择域名"
        rightAction={
          <button
            onClick={() => setShowDomainSheet(false)}
            className="text-primary font-medium text-sm px-2 py-1 hover:bg-accent rounded-md transition-colors"
          >
            完成
          </button>
        }
      >
        <DomainList
          allDomains={allDomains}
          selectedDomain={selectedDomain}
          onSelect={handleDomainSelect}
        />
      </BottomSheet>

      <NavigationMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </div>
  );
}
