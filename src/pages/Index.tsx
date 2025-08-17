import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, PieChart, TrendingUp, Shield, Bot, Zap, MessageSquare } from "lucide-react";

const Index = () => {
  const [dashboardToken, setDashboardToken] = useState("");
  const navigate = useNavigate();

  const handleAccessDashboard = () => {
    if (dashboardToken.trim()) {
      navigate(`/dashboard/${dashboardToken.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section with Token Access */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold text-primary">automatizaí</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
            Dashboard Financeiro Inteligente
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Conecte-se ao seu bot automatizaí e visualize suas finanças com análises
            inteligentes em tempo real
          </p>

          {/* Access Dashboard Card - Moved up */}
          <Card className="max-w-lg mx-auto mb-12 shadow-lg border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Acesse Seu Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm font-medium">Token do Dashboard</Label>
                <Input
                  id="token"
                  placeholder="Cole aqui o token fornecido pelo bot automatizaí"
                  value={dashboardToken}
                  onChange={(e) => setDashboardToken(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAccessDashboard()}
                  className="h-12 text-center border-2 focus:border-primary transition-colors"
                />
              </div>
              <Button 
                onClick={handleAccessDashboard} 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 transition-all shadow-md"
                disabled={!dashboardToken.trim()}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Ver Meu Dashboard
              </Button>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Não tem um token? Converse com o bot automatizaí no WhatsApp
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-primary">
                  <MessageSquare className="h-3 w-3" />
                  <span>Bot inteligente para controle financeiro</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* About automatizaí */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-chart-2/5">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Bot className="h-6 w-6 text-primary" />
                Sobre a automatizaí
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                A <strong className="text-primary">automatizaí</strong> é uma empresa especializada em automação financeira através de bots inteligentes. 
                Nosso bot WhatsApp permite que você registre suas transações de forma simples e natural, 
                apenas conversando como faria com um amigo.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h4 className="font-semibold mb-1">Chat Inteligente</h4>
                  <p className="text-sm text-muted-foreground">
                    Registre gastos e receitas conversando naturalmente
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="h-8 w-8 mx-auto text-chart-2 mb-2" />
                  <h4 className="font-semibold mb-1">Automação Total</h4>
                  <p className="text-sm text-muted-foreground">
                    Categorização automática e organização inteligente
                  </p>
                </div>
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto text-success mb-2" />
                  <h4 className="font-semibold mb-1">Análises Visuais</h4>
                  <p className="text-sm text-muted-foreground">
                    Dashboard completo com gráficos e relatórios
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-primary/10">
            <CardHeader>
              <BarChart3 className="h-10 w-10 mx-auto text-primary mb-3" />
              <CardTitle className="text-lg">Gráficos Interativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Visualize seus dados com gráficos de evolução temporal, distribuição por categoria e métricas detalhadas
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-primary/10">
            <CardHeader>
              <TrendingUp className="h-10 w-10 mx-auto text-success mb-3" />
              <CardTitle className="text-lg">Análise Temporal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Acompanhe tendências, filtre por períodos e entenda padrões nos seus gastos e receitas
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-primary/10">
            <CardHeader>
              <Shield className="h-10 w-10 mx-auto text-chart-2 mb-3" />
              <CardTitle className="text-lg">Segurança Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Acesso seguro com token único, proteção de dados e privacidade garantida para suas informações
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
