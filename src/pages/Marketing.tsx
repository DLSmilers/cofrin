import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, TrendingUp, Shield, Smartphone, BarChart3, User, LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
// Logo será adicionada via URL direta por enquanto

const Marketing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Check current auth status
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkAuth();

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  const handleDashboardAccess = async () => {
    if (user) {
      navigate(`/dashboard/${user.id}`);
    }
  };
  const features = [{
    icon: <PiggyBank className="h-8 w-8" />,
    title: "Controle Total das Finanças",
    description: "Monitore todos os seus gastos e receitas em tempo real com nossa interface intuitiva."
  }, {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Análise Inteligente",
    description: "Relatórios detalhados e insights que ajudam você a tomar decisões financeiras mais inteligentes."
  }, {
    icon: <Shield className="h-8 w-8" />,
    title: "Segurança Garantida",
    description: "Seus dados financeiros protegidos com criptografia de última geração."
  }, {
    icon: <Smartphone className="h-8 w-8" />,
    title: "Acesso Multiplataforma",
    description: "Use o Cofrin em qualquer dispositivo, a qualquer hora, em qualquer lugar."
  }, {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Dashboard Personalizado",
    description: "Visualize suas finanças com gráficos interativos e métricas personalizadas."
  }];
  return <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      {/* Header/Navigation */}
      <header className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/5ceb627e-8d72-484e-a56a-dc50cbb91def.png" alt="Cofrin Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold">Cofrin</span>
          </div>
          
          <div className="flex items-center gap-4">
            {loading ? <div className="h-9 w-20 bg-muted animate-pulse rounded-md"></div> : user ? <div className="flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Logado
                </Badge>
                <Button variant="outline" size="sm" onClick={handleDashboardAccess} className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Meu Relatório
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div> : <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Button>
                <Button size="sm" onClick={() => navigate("/signup")} className="">
                  Criar Conta
                </Button>
              </div>}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <img src="/lovable-uploads/5ceb627e-8d72-484e-a56a-dc50cbb91def.png" alt="Cofrin Logo" className="h-32 w-32 hover:scale-105 transition-transform duration-300" />
          </div>
          
          <h1 className="text-6xl font-bold">
            Cofrin
          </h1>
          
          <p className="text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Transforme sua relação com o dinheiro. O <span className="text-primary font-semibold">Cofrin</span> é a 
            plataforma definitiva para quem quer ter controle total sobre suas finanças pessoais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground px-8 py-4 text-lg font-semibold" onClick={handleDashboardAccess}>
                <BarChart3 className="mr-2 h-5 w-5" />
                Ver Meu Relatório
              </Button> : <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground px-8 py-4 text-lg font-semibold" onClick={() => navigate("/signup")}>
                Começar Agora - É Grátis!
              </Button>}
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg" onClick={() => navigate("/dashboard-access")}>
              {user ? "Acesso por Token" : "Ver Demo"}
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card className="text-center border-primary/20 bg-gradient-to-t from-primary/10 to-accent/5">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">1 mês</div>
              <p className="text-muted-foreground">Teste gratuito</p>
            </CardContent>
          </Card>
          <Card className="text-center border-secondary/20 bg-gradient-to-t from-secondary/15 to-accent/5">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-secondary mb-2">24/7</div>
              <p className="text-muted-foreground">Acesso aos seus dados</p>
            </CardContent>
          </Card>
          <Card className="text-center border-accent/30 bg-gradient-to-t from-accent/15 to-muted/10">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-accent-foreground mb-2">∞</div>
              <p className="text-muted-foreground">Transações ilimitadas</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Por que escolher o <span className="text-primary">Cofrin</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descobra como nossa plataforma pode revolucionar sua gestão financeira
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardHeader className="text-center">
                <div className="mx-auto p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full w-fit group-hover:scale-110 transition-transform duration-300 text-primary">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>)}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/15 via-secondary/20 to-accent/15 border-primary/30">
          <CardContent className="text-center py-16">
            <h3 className="text-3xl font-bold mb-4">
              Pronto para transformar suas finanças?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que já descobriram o poder do controle financeiro inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground px-12 py-4 text-lg font-semibold" onClick={handleDashboardAccess}>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Acessar Meu Relatório
                </Button> : <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground px-12 py-4 text-lg font-semibold" onClick={() => navigate("/signup")}>
                  Criar Conta Gratuita
                </Button>}
              <Button variant="outline" size="lg" className="px-12 py-4 text-lg border-primary/30 hover:bg-primary/5">
                Falar com Especialista
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border/70">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src="/lovable-uploads/5ceb627e-8d72-484e-a56a-dc50cbb91def.png" alt="Cofrin" className="h-8 w-8" />
              <span className="text-xl font-bold">Cofrin</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2024 Cofrin. Todos os direitos reservados. <br />
              Transformando vidas através da educação financeira.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Marketing;