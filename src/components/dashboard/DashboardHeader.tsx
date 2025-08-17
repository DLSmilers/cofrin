import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  userName: string;
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
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
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0">
            Financeiro
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};