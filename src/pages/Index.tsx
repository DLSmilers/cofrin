import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, PieChart, TrendingUp, Shield } from "lucide-react";

const Index = () => {
  const [dashboardToken, setDashboardToken] = useState("");
  const navigate = useNavigate();

  const handleAccessDashboard = () => {
    if (dashboardToken.trim()) {
      navigate(`/dashboard/${dashboardToken.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gerencie suas finanças de forma inteligente com visualizações interativas, 
            relatórios detalhados e análises em tempo real.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Gráficos Interativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visualize seus dados financeiros com gráficos de linha, barras e pizza
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardHeader>
              <TrendingUp className="h-12 w-12 mx-auto text-success mb-4" />
              <CardTitle>Análise Temporal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Acompanhe a evolução de gastos e rendimentos ao longo do tempo
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-chart-2 mb-4" />
              <CardTitle>Acesso Seguro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cada usuário possui um token único para acessar seu dashboard personalizado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Access Dashboard Card */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Acessar Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token do Dashboard</Label>
              <Input
                id="token"
                placeholder="Digite seu token único"
                value={dashboardToken}
                onChange={(e) => setDashboardToken(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAccessDashboard()}
              />
            </div>
            <Button 
              onClick={handleAccessDashboard} 
              className="w-full"
              disabled={!dashboardToken.trim()}
            >
              Acessar Meu Dashboard
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Não tem um token? Entre em contato com o administrador do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
