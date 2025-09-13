import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Settings, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PWABadge } from "@/components/pwa/PWABadge";

interface DashboardHeaderProps {
  userName: string;
  isAdmin: boolean;
}

export const DashboardHeader = ({ userName, isAdmin }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  return (
    <Card className="bg-gradient-to-r from-primary to-chart-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">
              Dashboard Financeiro
            </h1>
            <p className="text-primary-foreground/80 mt-2">
              Bem-vindo(a), {userName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white/20 text-primary-foreground border-0 hover:bg-white/30"
            >
              <Home className="h-4 w-4" />
              Início
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 bg-white/20 text-primary-foreground border-0 hover:bg-white/30"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
            {isAdmin && (
              <Button 
                variant="secondary" 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-white/20 text-primary-foreground border-0 hover:bg-white/30"
              >
                <Shield className="h-4 w-4" />
                Painel Admin
              </Button>
            )}
            <PWABadge />
            <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0">
              Financeiro
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};