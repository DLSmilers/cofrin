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

      // Check trial status
      const { data: profileData } = await supabase
        .from('profiles')
        .select('trial_end_date')
        .eq('user_id', session.user.id)
        .single();

      // Fallback via RPC in case profile row doesn't have trial_end_date yet
      const { data: trialExpiredRpc } = await supabase
        .rpc('check_trial_expired', { user_uuid: session.user.id });

      const isTrialActive = profileData?.trial_end_date
        ? new Date(profileData.trial_end_date) > new Date()
        : (typeof trialExpiredRpc === 'boolean' ? !trialExpiredRpc : false);

      setStatus({
        subscribed: subscriptionData?.subscribed || false,
        subscription_tier: subscriptionData?.subscription_tier || null,
        subscription_end: subscriptionData?.subscription_end || null,
        isTrialActive,
        isLoading: false,
      });

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