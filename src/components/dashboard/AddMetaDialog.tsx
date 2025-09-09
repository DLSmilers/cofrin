import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target } from "lucide-react";

interface AddMetaDialogProps {
  userWhatsapp: string;
  onMetaAdded: () => void;
}

export const AddMetaDialog = ({ userWhatsapp, onMetaAdded }: AddMetaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    metaMensal: "",
    mesAno: new Date().toISOString().slice(0, 7), // YYYY-MM format
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if meta already exists for this month
      const { data: existingMeta } = await supabase
        .from("metas")
        .select("id")
        .eq("user_whatsapp", userWhatsapp)
        .eq("mes_ano", formData.mesAno)
        .single();

      if (existingMeta) {
        toast({
          title: "Meta já existe",
          description: "Já existe uma meta para este mês. Edite a existente.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("metas")
        .insert({
          user_whatsapp: userWhatsapp,
          mes_ano: formData.mesAno,
          meta_mensal: parseFloat(formData.metaMensal),
          gasto_total: 0,
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Meta mensal adicionada com sucesso.",
      });

      setFormData({
        metaMensal: "",
        mesAno: new Date().toISOString().slice(0, 7),
      });
      
      setOpen(false);
      onMetaAdded();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar meta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Target className="h-4 w-4" />
          Nova Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Meta Mensal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="mesAno">Mês/Ano</Label>
            <Input
              id="mesAno"
              type="month"
              value={formData.mesAno}
              onChange={(e) => setFormData({ ...formData, mesAno: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="metaMensal">Meta Mensal (R$)</Label>
            <Input
              id="metaMensal"
              type="number"
              step="0.01"
              value={formData.metaMensal}
              onChange={(e) => setFormData({ ...formData, metaMensal: e.target.value })}
              placeholder="0,00"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};