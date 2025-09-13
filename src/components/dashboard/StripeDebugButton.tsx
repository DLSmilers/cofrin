import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bug } from "lucide-react";
import { useState } from "react";

export const StripeDebugButton = () => {
  const [loading, setLoading] = useState(false);

  const handleDebug = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({ title: "Erro", description: "Faça login para diagnosticar", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase.functions.invoke("stripe-account-info", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      const acct = data?.account?.id ?? "desconhecida";
      const cust = data?.customer?.id ?? "nenhum";
      toast({
        title: "Stripe conectado",
        description: `Conta: ${acct} • Cliente: ${cust}`,
      });
      
    } catch (e) {
      console.error(e);
      toast({ title: "Falha no diagnóstico", description: "Verifique os logs da função", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDebug} disabled={loading} className="flex items-center gap-2">
      <Bug className="h-4 w-4" />
      {loading ? "Verificando..." : "Diagnóstico Stripe"}
    </Button>
  );
};