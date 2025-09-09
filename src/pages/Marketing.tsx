import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, TrendingUp, Shield, Smartphone, BarChart3, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Logo será adicionada via URL direta por enquanto

const Marketing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <PiggyBank className="h-8 w-8" />,
      title: "Controle Total das Finanças",
      description: "Monitore todos os seus gastos e receitas em tempo real com nossa interface intuitiva."
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Análise Inteligente",
      description: "Relatórios detalhados e insights que ajudam você a tomar decisões financeiras mais inteligentes."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Segurança Garantida",
      description: "Seus dados financeiros protegidos com criptografia de última geração."
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Acesso Multiplataforma",
      description: "Use o Cofrin em qualquer dispositivo, a qualquer hora, em qualquer lugar."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Dashboard Personalizado",
      description: "Visualize suas finanças com gráficos interativos e métricas personalizadas."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Gestão Colaborativa",
      description: "Compartilhe e gerencie finanças familiares ou empresariais com facilidade."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/5ceb627e-8d72-484e-a56a-dc50cbb91def.png" 
              alt="Cofrin Logo" 
              className="h-32 w-32 hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <Badge variant="secondary" className="mb-6 text-lg px-6 py-2">
            🚀 A Nova Era do Controle Financeiro
          </Badge>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent mb-6">
            Cofrin
          </h1>
          
          <p className="text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Transforme sua relação com o dinheiro. O <span className="text-primary font-semibold">Cofrin</span> é a 
            plataforma definitiva para quem quer ter controle total sobre suas finanças pessoais e empresariais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground px-8 py-4 text-lg font-semibold"
              onClick={() => navigate("/")}
            >
              Começar Agora - É Grátis!
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg"
            >
              Ver Demo
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card className="text-center border-primary/20 bg-gradient-to-t from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Gratuito para uso pessoal</p>
            </CardContent>
          </Card>
          <Card className="text-center border-secondary/20 bg-gradient-to-t from-secondary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-secondary mb-2">24/7</div>
              <p className="text-muted-foreground">Acesso aos seus dados</p>
            </CardContent>
          </Card>
          <Card className="text-center border-accent/20 bg-gradient-to-t from-accent/5 to-transparent">
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
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
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
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
          <CardContent className="text-center py-16">
            <h3 className="text-3xl font-bold mb-4">
              Pronto para transformar suas finanças?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que já descobriram o poder do controle financeiro inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground px-12 py-4 text-lg font-semibold"
                onClick={() => navigate("/")}
              >
                Criar Conta Gratuita
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-12 py-4 text-lg border-primary/30 hover:bg-primary/5"
              >
                Falar com Especialista
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50">
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
    </div>
  );
};

export default Marketing;