import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        console.log("🔍 Verificando pagamento...");
        
        // Wait a bit before checking to allow Stripe to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get current session for authorization
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.error("❌ Sem token de acesso");
          toast({
            title: "Erro de autenticação",
            description: "Faça login novamente para verificar sua assinatura.",
            variant: "destructive",
          });
          setTimeout(() => navigate("/auth"), 2000);
          return;
        }

        // Verify subscription status after payment with proper auth
        const { data, error } = await supabase.functions.invoke("check-subscription", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        console.log("📊 Resultado da verificação:", { data, error });
        
        if (error) {
          console.error("Erro ao verificar assinatura:", error);
          toast({
            title: "Verificando assinatura...",
            description: "Aguarde, estamos confirmando seu pagamento.",
            variant: "default",
          });
          
          // Try again after a delay
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          if (data?.subscribed) {
            toast({
              title: "Pagamento confirmado!",
              description: "Sua assinatura foi ativada com sucesso.",
              variant: "default",
            });
          } else {
            toast({
              title: "Processando pagamento...",
              description: "Seu pagamento está sendo processado. A página será atualizada automaticamente.",
              variant: "default",
            });
            
            // Retry verification after a delay
            setTimeout(() => {
              window.location.reload();
            }, 5000);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
        toast({
          title: "Verificando pagamento...",
          description: "Processando sua assinatura, aguarde...",
          variant: "default",
        });
        
        // Retry after error
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Loader2 className="mx-auto mb-4 w-16 h-16 animate-spin text-primary" />
            <h2 className="text-xl font-semibold mb-2">Verificando pagamento...</h2>
            <p className="text-muted-foreground">
              Aguarde enquanto confirmamos sua assinatura.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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