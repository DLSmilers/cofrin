import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const categories = [
  "Alimentação",
  "Transporte", 
  "Saúde",
  "Educação",
  "Lazer",
  "Moradia",
  "Vestuário",
  "Tecnologia",
  "Outros"
];

interface AddParceledPaymentDialogProps {
  userWhatsapp: string;
  onPaymentAdded?: () => void;
}

interface FormData {
  descricao: string;
  categoria: string;
  estabelecimento: string;
  valorTotal: string;
  totalParcelas: string;
  primeiroVencimento: Date | undefined;
}

export const AddParceledPaymentDialog: React.FC<AddParceledPaymentDialogProps> = ({
  userWhatsapp,
  onPaymentAdded
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    descricao: '',
    categoria: '',
    estabelecimento: '',
    valorTotal: '',
    totalParcelas: '',
    primeiroVencimento: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.categoria || !formData.valorTotal || 
        !formData.totalParcelas || !formData.primeiroVencimento) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const valorTotal = parseFloat(formData.valorTotal);
      const totalParcelas = parseInt(formData.totalParcelas);
      const valorParcela = valorTotal / totalParcelas;

      // Criar todas as parcelas
      const parcelas = [];
      for (let i = 0; i < totalParcelas; i++) {
        const dataVencimento = addMonths(formData.primeiroVencimento, i);
        parcelas.push({
          user_whatsapp: userWhatsapp,
          descricao: formData.descricao,
          categoria: formData.categoria,
          estabelecimento: formData.estabelecimento,
          valor_total: valorTotal,
          valor_parcela: valorParcela,
          total_parcelas: totalParcelas,
          parcela_atual: i + 1,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status: 'pendente'
        });
      }

      const { error } = await supabase
        .from('pagamentos_parcelados')
        .insert(parcelas);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Pagamento parcelado criado com ${totalParcelas} parcelas`,
      });

      // Reset form
      setFormData({
        descricao: '',
        categoria: '',
        estabelecimento: '',
        valorTotal: '',
        totalParcelas: '',
        primeiroVencimento: undefined,
      });

      setOpen(false);
      onPaymentAdded?.();

    } catch (error) {
      console.error('Erro ao criar pagamento parcelado:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o pagamento parcelado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Parcelamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Pagamento Parcelado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              placeholder="Ex: Notebook Dell"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estabelecimento">Estabelecimento</Label>
            <Input
              id="estabelecimento"
              placeholder="Ex: Loja de Informática"
              value={formData.estabelecimento}
              onChange={(e) => setFormData(prev => ({ ...prev, estabelecimento: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorTotal">Valor Total *</Label>
              <Input
                id="valorTotal"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.valorTotal}
                onChange={(e) => setFormData(prev => ({ ...prev, valorTotal: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalParcelas">Nº Parcelas *</Label>
              <Input
                id="totalParcelas"
                type="number"
                min="2"
                max="48"
                placeholder="12"
                value={formData.totalParcelas}
                onChange={(e) => setFormData(prev => ({ ...prev, totalParcelas: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Primeiro Vencimento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.primeiroVencimento && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.primeiroVencimento ? (
                    format(formData.primeiroVencimento, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    "Selecionar data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.primeiroVencimento}
                  onSelect={(date) => setFormData(prev => ({ ...prev, primeiroVencimento: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {formData.valorTotal && formData.totalParcelas && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Valor de cada parcela: <span className="font-semibold text-foreground">
                  R$ {(parseFloat(formData.valorTotal || "0") / parseInt(formData.totalParcelas || "1")).toFixed(2)}
                </span>
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Parcelamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};