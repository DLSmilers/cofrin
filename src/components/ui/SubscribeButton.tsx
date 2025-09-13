import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface SubscribeButtonProps {
  priceType: "monthly" | "annual";
  amount: number;
  interval: "month" | "year";
  children: React.ReactNode;
  className?: string;
}

export const SubscribeButton = ({ priceType, amount, interval, children, className = "" }: SubscribeButtonProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Escuta mensagens da aba de pagamento
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'PAYMENT_SUCCESS') {
        toast({
          title: "Pagamento aprovado!",
          description: "Sua assinatura foi ativada com sucesso.",
        });
        
        // Pega o token do usuário e redireciona para o dashboard específico
        const { data: { session } } = await supabase.auth.getSession();
        const userToken = session?.user?.id;
        
        setTimeout(() => {
          if (userToken) {
            navigate(`/dashboard/${userToken}`);
          } else {
            navigate("/dashboard-access");
          }
        }, 1000);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceType, amount, interval },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Abre em nova aba para não perder o contexto atual
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Erro ao criar checkout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a assinatura",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className={className}
    >
      {loading ? "Carregando..." : children}
    </Button>
  );
};