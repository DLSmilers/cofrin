import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { CancelSubscriptionButton } from "./CancelSubscriptionButton";

export const SubscriptionStatus = () => {
  const { subscribed, subscription_tier, subscription_end, isTrialActive, isLoading, hasAccess } = useSubscription();
  const navigate = useNavigate();
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrialDate = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('trial_end_date')
          .eq('user_id', session.user.id)
          .single();
        
        if (data?.trial_end_date) {
          setTrialEndDate(data.trial_end_date);
        }
      }
    };
    
    fetchTrialDate();
  }, []);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess()) {
    return (
      <Card className="mb-6 border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-orange-600" />
            <span>Período de teste expirado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Seu período de teste de 30 dias expirou. Assine um plano para continuar acessando todos os recursos.
          </p>
          <Button 
            onClick={() => navigate("/pricing")}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Ver Planos de Assinatura
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (subscribed) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-green-600" />
              <span>Assinatura Ativa</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {subscription_tier || "Premium"}
              </Badge>
            </div>
            <CancelSubscriptionButton />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Válida até: {subscription_end 
                ? new Date(subscription_end).toLocaleDateString("pt-BR")
                : "Indefinida"}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isTrialActive) {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Período de Teste</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Ativo
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Você está no período de teste gratuito. Assine um plano para continuar após o vencimento.
            </p>
            {trialEndDate && (
              <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-100 rounded-lg p-2">
                <Calendar className="h-4 w-4" />
                <span>
                  <strong>Teste expira em:</strong> {new Date(trialEndDate).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit", 
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            )}
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate("/pricing")}
            className="w-full mt-4 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Ver Planos de Assinatura
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};