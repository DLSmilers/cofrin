import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddTransactionDialogProps {
  userWhatsapp: string;
  onTransactionAdded?: () => void;
}

const categories = [
  "Alimentação",
  "Transporte", 
  "Compras",
  "Casa",
  "Lazer",
  "Saúde",
  "Educação",
  "Outros"
];

export const AddTransactionDialog = ({ userWhatsapp, onTransactionAdded }: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "",
    categoria: "",
    estabelecimento: "",
    detalhes: "",
    valor: "",
    quando: undefined as Date | undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo || !formData.categoria || !formData.detalhes || !formData.valor || !formData.quando) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('transacoes')
        .insert({
          user_whatsapp: userWhatsapp,
          tipo: formData.tipo,
          categoria: formData.categoria,
          estabelecimento: formData.estabelecimento || "Não especificado",
          detalhes: formData.detalhes,
          valor: parseFloat(formData.valor),
          quando: formData.quando.toISOString()
        });

      if (error) {
        toast({
          title: "Erro ao adicionar",
          description: "Não foi possível adicionar a transação",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Transação adicionada",
        description: `${formData.tipo === "receita" ? "Receita" : "Despesa"} adicionada com sucesso`,
      });

      setFormData({
        tipo: "",
        categoria: "",
        estabelecimento: "",
        detalhes: "",
        valor: "",
        quando: undefined
      });
      
      setOpen(false);
      onTransactionAdded?.();
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao adicionar a transação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estabelecimento">Local</Label>
            <Input
              id="estabelecimento"
              placeholder="Digite o local (opcional)"
              value={formData.estabelecimento}
              onChange={(e) => setFormData({...formData, estabelecimento: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detalhes">Descrição *</Label>
            <Input
              id="detalhes"
              placeholder="Digite uma descrição"
              value={formData.detalhes}
              onChange={(e) => setFormData({...formData, detalhes: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.quando && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.quando ? format(formData.quando, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.quando}
                  onSelect={(date) => setFormData({...formData, quando: date})}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};