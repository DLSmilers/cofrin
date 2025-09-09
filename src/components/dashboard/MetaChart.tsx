import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, Target, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Meta {
  id: number;
  user_whatsapp: string;
  meta_mensal: number;
  gasto_total: number;
  mes_ano: string;
  created_at: string;
}

interface MetaChartProps {
  metas: Meta[];
  onMetaDeleted?: () => void;
}

export const MetaChart = ({ metas, onMetaDeleted }: MetaChartProps) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteMeta = async (metaId: number) => {
    setDeletingId(metaId);
    
    try {
      const { error } = await supabase
        .from("metas")
        .delete()
        .eq("id", metaId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Meta deletada com sucesso.",
      });

      onMetaDeleted?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar meta.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const processChartData = () => {
    return metas
      .sort((a, b) => a.mes_ano.localeCompare(b.mes_ano))
      .map((meta) => ({
        mes: meta.mes_ano,
        meta: meta.meta_mensal,
        gasto: meta.gasto_total,
      }));
  };

  const chartData = processChartData();

  const chartConfig = {
    meta: {
      label: "Meta",
      color: "hsl(var(--chart-2))",
    },
    gasto: {
      label: "Gasto",
      color: "hsl(var(--chart-1))",
    },
  };

  if (metas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Mensais vs Gastos Reais
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden p-3 sm:p-6">
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhuma meta encontrada</p>
              <p className="text-sm text-muted-foreground">
                Adicione metas mensais para acompanhar seu progresso
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Metas Mensais vs Gastos Reais
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden p-3 sm:p-6">
        <div className="w-full overflow-hidden">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year.slice(2)}`;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value as number),
                        name === "meta" ? "Meta" : "Gasto Real",
                      ]}
                    />
                  }
                />
                <Bar
                  dataKey="meta"
                  fill="var(--color-meta)"
                  radius={[4, 4, 0, 0]}
                  opacity={0.7}
                />
                <Bar
                  dataKey="gasto"
                  fill="var(--color-gasto)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium">Detalhes das Metas:</h4>
            {chartData.map((item, index) => {
              const meta = metas.find(m => m.mes_ano === item.mes);
              if (!meta) return null;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {new Date(item.mes + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Meta: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.meta)} | 
                      Gasto: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.gasto)}
                    </p>
                    <p className={`text-xs font-medium ${item.gasto <= item.meta ? "text-emerald-600" : "text-red-600"}`}>
                      {item.gasto <= item.meta ? "✅ Meta atingida" : "❌ Meta ultrapassada"}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingId === meta.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar esta meta? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteMeta(meta.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};