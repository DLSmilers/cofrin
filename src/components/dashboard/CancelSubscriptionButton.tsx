import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { X } from "lucide-react";

export const CancelSubscriptionButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para cancelar a assinatura",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Assinatura cancelada",
          description: data.message,
        });
        // Refresh the page to show the paywall
        window.location.reload();
      } else {
        toast({
          title: "Erro ao cancelar",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a assinatura",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleCancel}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <X className="h-4 w-4" />
      {isLoading ? "Cancelando..." : "Cancelar Assinatura (Teste)"}
    </Button>
  );
};