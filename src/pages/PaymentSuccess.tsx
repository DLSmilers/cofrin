import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Atualizar status da assinatura quando a página carregar
    const updateSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.functions.invoke("check-subscription");
        }
      } catch (error) {
        console.error("Erro ao atualizar assinatura:", error);
      }
    };

    updateSubscription();
  }, []);

  const handleBackToDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate(`/dashboard/${session.user.id}`);
      } else {
        navigate("/auth");
      }
    } catch (error) {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Pagamento Realizado com Sucesso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Sua assinatura foi ativada com sucesso. Agora você tem acesso completo ao dashboard.
          </p>
          <Button 
            onClick={handleBackToDashboard}
            className="w-full"
          >
            Voltar ao Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;