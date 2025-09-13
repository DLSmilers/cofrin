import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Share } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';

export const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp, shareApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if app is installed, not installable, or user dismissed
  if (isInstalled || !isInstallable || dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm bg-primary text-primary-foreground shadow-lg md:left-auto md:right-4 md:max-w-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Instalar Cofrin
            </h3>
            <p className="text-xs text-primary-foreground/80 mb-3">
              Instale o app para acesso rápido e experiência melhorada
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={installApp}
                className="flex items-center gap-1 text-xs"
              >
                <Download className="h-3 w-3" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={shareApp}
                className="flex items-center gap-1 text-xs bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Share className="h-3 w-3" />
                Compartilhar
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};