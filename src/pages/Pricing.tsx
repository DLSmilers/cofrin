import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const [loading, setLoading] = useState<{monthly: boolean, annual: boolean}>({
    monthly: false,
    annual: false
  });
  const navigate = useNavigate();
  const [userDashboardToken, setUserDashboardToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDashboardToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData } = await supabase
          .rpc('validate_dashboard_token', { token_input: session.user.id });
        
        if (userData && userData.length > 0) {
          setUserDashboardToken(session.user.id);
        }
      }
    };
    
    fetchUserDashboardToken();
  }, []);

  const handleSubscribe = async (priceType: "monthly" | "annual") => {
    setLoading(prev => ({ ...prev, [priceType]: true }));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para assinar um plano",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          priceType,
          amount: priceType === "monthly" ? 2000 : 18000, // 20 reais mensal, 180 reais anual
          interval: priceType === "monthly" ? "month" : "year"
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [priceType]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4">
        {userDashboardToken && (
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/dashboard/${userDashboardToken}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Dashboard</span>
            </Button>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Seu período de teste expirou
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Continue usando nosso dashboard escolhendo um dos planos abaixo
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Mensal */}
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Plano Mensal</CardTitle>
              <div className="flex items-center justify-center mt-4">
                <span className="text-4xl font-bold">R$ 20</span>
                <span className="text-muted-foreground ml-2">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Dashboard completo de gastos</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Relatórios detalhados</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Exportação de dados</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Suporte por email</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6" 
                onClick={() => handleSubscribe("monthly")}
                disabled={loading.monthly}
              >
                {loading.monthly ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Assinar Plano Mensal"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Plano Anual */}
          <Card className="relative border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Mais Popular
              </span>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Plano Anual</CardTitle>
              <div className="flex items-center justify-center mt-4">
                <span className="text-4xl font-bold">R$ 15</span>
                <span className="text-muted-foreground ml-2">/mês</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Pago anualmente (R$ 180/ano)
              </div>
              <div className="text-sm text-green-600 font-medium">
                Economize R$ 60 por ano!
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Dashboard completo de gastos</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Relatórios detalhados</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Exportação de dados</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Suporte prioritário</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="font-medium">2 meses grátis</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6" 
                onClick={() => handleSubscribe("annual")}
                disabled={loading.annual}
                variant="default"
              >
                {loading.annual ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Assinar Plano Anual"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Cancele quando quiser. Sem taxas ocultas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;