import { Badge } from '@/components/ui/badge';
import { Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';

export const PWABadge = () => {
  const { isInstalled } = usePWA();

  if (!isInstalled) return null;

  return (
    <Badge variant="outline" className="flex items-center gap-1 text-xs">
      <Smartphone className="h-3 w-3" />
      App Instalado
    </Badge>
  );
};