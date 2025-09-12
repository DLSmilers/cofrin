import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SubscribeButton } from "@/components/ui/SubscribeButton";

const Pricing = () => {
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
              <SubscribeButton
                priceType="monthly"
                amount={2000}
                interval="month"
                className="w-full mt-6"
              >
                Assinar Plano Mensal
              </SubscribeButton>
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
              <SubscribeButton
                priceType="annual"
                amount={18000}
                interval="year"
                className="w-full mt-6"
              >
                Assinar Plano Anual
              </SubscribeButton>
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