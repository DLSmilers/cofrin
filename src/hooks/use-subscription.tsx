import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  isTrialActive: boolean;
  isLoading: boolean;
}

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    isTrialActive: false,
    isLoading: true,
  });

  const checkSubscription = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setStatus({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          isTrialActive: false,
          isLoading: false,
        });
        return;
      }

      console.log("🔍 Verificando assinatura para usuário:", session.user.id);

      // Check subscription status via edge function
      const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke("check-subscription");
      
      if (subscriptionError) {
        console.error("Erro ao verificar assinatura:", subscriptionError);
        toast({
          title: "Erro ao verificar assinatura",
          description: "Não foi possível verificar o status da assinatura",
          variant: "destructive",
        });
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      console.log("💳 Dados da assinatura:", subscriptionData);

      // Check trial status from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('trial_end_date')
        .eq('user_id', session.user.id)
        .single();

      console.log("👤 Dados do perfil:", profileData);

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
      }

      // Fallback via RPC in case profile row doesn't have trial_end_date yet
      const { data: trialExpiredRpc, error: rpcError } = await supabase
        .rpc('check_trial_expired', { user_uuid: session.user.id });

      console.log("🕐 RPC trial expirado:", trialExpiredRpc, "erro:", rpcError);

      let isTrialActive = false;
      
      if (profileData?.trial_end_date) {
        const trialEndDate = new Date(profileData.trial_end_date);
        const now = new Date();
        isTrialActive = trialEndDate > now;
        console.log("📅 Trial end date:", trialEndDate, "Agora:", now, "Trial ativo:", isTrialActive);
      } else {
        // Usar RPC como fallback
        isTrialActive = typeof trialExpiredRpc === 'boolean' ? !trialExpiredRpc : false;
        console.log("🔄 Usando fallback RPC - Trial ativo:", isTrialActive);
      }

      const finalStatus = {
        subscribed: subscriptionData?.subscribed || false,
        subscription_tier: subscriptionData?.subscription_tier || null,
        subscription_end: subscriptionData?.subscription_end || null,
        isTrialActive,
        isLoading: false,
      };

      console.log("✅ Status final:", finalStatus);

      setStatus(finalStatus);

    } catch (error) {
      console.error("Erro ao verificar status da assinatura:", error);
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const hasAccess = () => {
    return status.subscribed || status.isTrialActive;
  };

  return {
    ...status,
    hasAccess,
    refreshSubscription: checkSubscription,
  };
};