'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { getFavorites, removeFavorite, type TempMail } from '@/lib/mailData';
import { NavigationMenu, MenuButton } from '@/components/NavigationMenu';
import { Icon } from '@/components/Icon';
import { haptic } from '@/lib/utils';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  mailName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = memo(({ isOpen, mailName, onConfirm, onCancel }: DeleteConfirmModalProps) => {
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onCancel}
      />

      <div
        className="relative w-full max-w-sm bg-card border border-border rounded-lg shadow-lg"
        style={{
          animation: 'scaleIn 0.2s ease-out',
          willChange: 'transform'
        }}
      >
        <div className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
              <Icon name="delete" className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              确认删除
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              确定要从收藏中移除<br />
              <span className="font-semibold text-foreground">{mailName}</span> 吗?
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { haptic(20); onCancel(); }}
              className="flex-1 py-2 rounded-lg bg-muted hover:bg-accent text-foreground font-medium text-sm transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => { haptic(30); onConfirm(); }}
              className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
});
DeleteConfirmModal.displayName = 'DeleteConfirmModal';

interface FavoriteCardProps {
  mail: TempMail;
  onDelete: (mail: TempMail) => void;
  onCopy: (url: string, id: string) => void;
  copiedId: string | null;
}

const FavoriteCard = memo(({ mail, onDelete, onCopy, copiedId }: FavoriteCardProps) => {
  const isCopied = copiedId === mail.id;

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Icon name="star" className="w-4 h-4 text-yellow-500 shrink-0" />
            <h3 className="text-base font-semibold text-foreground truncate">
              {mail.name}
            </h3>
          </div>
          <button
            onClick={() => { haptic(30); onDelete(mail); }}
            className="shrink-0 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            <Icon name="delete" className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
        </div>

        {mail.description && (
          <p className="text-xs text-muted-foreground">
            {mail.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <a
            href={mail.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => haptic(20)}
            className="flex-1 py-2 px-4 bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground font-medium text-sm text-center shadow-sm transition-colors truncate"
          >
            访问网站
          </a>
          <button
            onClick={() => { haptic(30); onCopy(mail.url, mail.id); }}
            className="shrink-0 p-2 bg-muted hover:bg-accent rounded-lg transition-colors"
          >
            {isCopied ? (
              <Icon name="check" className="w-5 h-5 text-primary" />
            ) : (
              <Icon name="copy" className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
FavoriteCard.displayName = 'FavoriteCard';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<TempMail[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; mail: TempMail | null }>({
    isOpen: false,
    mail: null
  });

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleDeleteClick = useCallback((mail: TempMail) => {
    setDeleteConfirm({ isOpen: true, mail });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirm.mail) {
      removeFavorite(deleteConfirm.mail.id);
      setFavorites(prev => prev.filter(item => item.id !== deleteConfirm.mail!.id));
    }
    setDeleteConfirm({ isOpen: false, mail: null });
  }, [deleteConfirm.mail]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ isOpen: false, mail: null });
  }, []);

  const handleCopy = useCallback(async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (error) {
      console.error('Copy failed:', error);
      haptic(50);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground">
            我的收藏
          </h1>
          <MenuButton onClick={() => { haptic(20); setShowMenu(true); }} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map((mail) => (
              <FavoriteCard
                key={mail.id}
                mail={mail}
                onDelete={handleDeleteClick}
                onCopy={handleCopy}
                copiedId={copiedId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-card px-8 py-8 rounded-lg border border-border shadow-sm text-center space-y-4">
              <div className="flex justify-center">
                <Icon name="inbox" className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-base font-semibold text-foreground">
                  暂无收藏
                </p>
                <p className="text-sm text-muted-foreground">
                  在临时邮箱页面点击星标添加收藏
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <NavigationMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        mailName={deleteConfirm.mail?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
