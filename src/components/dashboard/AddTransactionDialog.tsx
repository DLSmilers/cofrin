import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface AddTransactionDialogProps {
  userWhatsapp: string;
  onTransactionAdded: () => void;
}

export const AddTransactionDialog = ({ userWhatsapp, onTransactionAdded }: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    valor: "",
    estabelecimento: "",
    detalhes: "",
    tipo: "despesa" as "receita" | "despesa",
    categoria: "",
  });

  const categorias = [
    "Alimentação",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Moradia",
    "Vestuário",
    "Outros"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("transacoes")
        .insert({
          valor: parseFloat(formData.valor),
          user_whatsapp: userWhatsapp,
          estabelecimento: formData.estabelecimento,
          detalhes: formData.detalhes,
          tipo: formData.tipo,
          categoria: formData.categoria,
          quando: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Transação adicionada com sucesso.",
      });

      setFormData({
        valor: "",
        estabelecimento: "",
        detalhes: "",
        tipo: "despesa",
        categoria: "",
      });
      
      setOpen(false);
      onTransactionAdded();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar transação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              placeholder="0,00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select 
              value={formData.tipo} 
              onValueChange={(value: "receita" | "despesa") => 
                setFormData({ ...formData, tipo: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estabelecimento">Estabelecimento</Label>
            <Input
              id="estabelecimento"
              value={formData.estabelecimento}
              onChange={(e) => setFormData({ ...formData, estabelecimento: e.target.value })}
              placeholder="Nome do estabelecimento"
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={(value) => setFormData({ ...formData, categoria: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="detalhes">Detalhes</Label>
            <Textarea
              id="detalhes"
              value={formData.detalhes}
              onChange={(e) => setFormData({ ...formData, detalhes: e.target.value })}
              placeholder="Descrição da transação..."
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