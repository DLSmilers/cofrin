import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Check, Crown, Zap, ArrowLeft, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, session, subscription } = useAuth();

  const plans = [
    {
      id: 'monthly',
      name: 'Mensal',
      price: 'R$ 25',
      period: '/mês',
      description: 'Perfeito para começar',
      icon: Zap,
      color: 'border-primary/20',
      popular: false,
      features: [
        'Dashboard completo',
        'Análises inteligentes',
        'Categorização automática',
        'Relatórios em PDF',
        'Suporte via WhatsApp',
        'Metas e objetivos'
      ]
    },
    {
      id: 'semestral',
      name: 'Semestral',
      price: 'R$ 20',
      period: '/mês',
      originalPrice: 'R$ 25',
      savings: 'Economize R$ 30',
      description: 'Mais popular - 6 meses',
      icon: Star,
      color: 'border-warning/40',
      popular: true,
      features: [
        'Tudo do plano mensal',
        '20% de desconto',
        'Relatórios avançados',
        'Histórico completo',
        'Suporte prioritário',
        'Consultoria financeira'
      ]
    },
    {
      id: 'annual',
      name: 'Anual',
      price: 'R$ 15',
      period: '/mês',
      originalPrice: 'R$ 25',
      savings: 'Economize R$ 120',
      description: 'Melhor custo-benefício',
      icon: Crown,
      color: 'border-success/40',
      popular: false,
      features: [
        'Tudo dos outros planos',
        '40% de desconto',
        'Análises preditivas',
        'Relatórios personalizados',
        'Suporte VIP',
        'Consultoria mensal exclusiva'
      ]
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast.error(error.message || 'Erro ao abrir portal do cliente');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">cofrin</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            {user && (
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent">
            Comece Grátis por 1 Mês!
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Teste todas as funcionalidades do cofrin <strong className="text-primary">sem pagar nada</strong> nos primeiros 30 dias. 
            Depois escolha o plano que mais combina com você.
          </p>
          
          {subscription.subscribed && (
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="border-success/20 bg-gradient-to-r from-success/5 to-card">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Check className="h-6 w-6 text-success" />
                    <span className="text-lg font-semibold text-success">Você está assinando!</span>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Plano atual: <strong className="text-primary">{subscription.subscription_tier}</strong>
                    {subscription.subscription_end && (
                      <span className="block text-sm">
                        Próxima cobrança: {new Date(subscription.subscription_end).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </p>
                  <Button onClick={handleManageSubscription} variant="outline" size="sm">
                    Gerenciar Assinatura
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = subscription.subscription_tier === plan.name;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative text-center hover:shadow-xl transition-all ${plan.color} ${plan.popular ? 'scale-105 shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-success' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-warning text-warning-foreground px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-success text-success-foreground px-3 py-1">
                      Seu Plano
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    plan.popular ? 'bg-warning/10' : 'bg-primary/10'
                  }`}>
                    <Icon className={`h-8 w-8 ${plan.popular ? 'text-warning' : 'text-primary'}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground line-through">
                          De {plan.originalPrice}/mês
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {plan.savings}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <Button 
                        onClick={handleManageSubscription}
                        variant="outline" 
                        className="w-full"
                      >
                        Gerenciar Plano
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={loading === plan.id}
                        className={`w-full ${plan.popular ? 'bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {loading === plan.id ? 'Processando...' : 'Começar Grátis'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Como funciona o período gratuito?</h3>
                <p className="text-sm text-muted-foreground">
                  Você tem 30 dias para testar todas as funcionalidades sem pagar nada. 
                  Só será cobrado após esse período se não cancelar.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim! Não há fidelidade. Você pode cancelar a qualquer momento através 
                  do portal do cliente ou entrando em contato conosco.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Meus dados ficam salvos?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim, todos os seus dados financeiros ficam salvos e protegidos. 
                  Mesmo se cancelar, pode reativar depois sem perder nada.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Posso mudar de plano?</h3>
                <p className="text-sm text-muted-foreground">
                  Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer 
                  momento através do portal do cliente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;