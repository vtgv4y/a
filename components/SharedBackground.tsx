'use client';

import { memo } from 'react';

export const SharedBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950" />
    </div>
  );
});

SharedBackground.displayName = 'SharedBackground';
