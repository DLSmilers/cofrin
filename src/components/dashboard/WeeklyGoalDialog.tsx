import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Target, Plus } from "lucide-react";

export const WeeklyGoalDialog = ({ onGoalCreated }: { onGoalCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [metaMensal, setMetaMensal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentDate = new Date();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const semanaAno = `${format(weekStart, "dd/MM", { locale: ptBR })}-${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metaMensal || parseFloat(metaMensal) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido para a meta",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get current user's whatsapp
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: userData } = await supabase
        .from("users")
        .select("user_whatsapp")
        .eq("uuid", user.id)
        .single();

      if (!userData) throw new Error("Dados do usuário não encontrados");

      // Check if weekly goal already exists
      const { data: existingGoal } = await supabase
        .from("metas")
        .select("id")
        .eq("user_whatsapp", userData.user_whatsapp)
        .eq("semana_ano", semanaAno)
        .eq("tipo_meta", "semanal")
        .maybeSingle();

      if (existingGoal) {
        toast({
          title: "Meta já existe",
          description: "Já existe uma meta para esta semana. Edite a meta existente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from("metas")
        .insert({
          semana_ano: semanaAno,
          tipo_meta: "semanal",
          user_whatsapp: userData.user_whatsapp,
          meta_mensal: parseFloat(metaMensal),
          gasto_total: 0,
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Meta semanal criada com sucesso",
      });

      setOpen(false);
      setMetaMensal("");
      onGoalCreated();
    } catch (error) {
      console.error("Error creating weekly goal:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar meta semanal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Meta Semanal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Nova Meta Semanal
          </DialogTitle>
          <DialogDescription>
            Criar meta para a semana de {semanaAno}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta">Valor da Meta Semanal (R$)</Label>
            <Input
              id="meta"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={metaMensal}
              onChange={(e) => setMetaMensal(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Meta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};