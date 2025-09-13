import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Target, TrendingUp, TrendingDown, Calendar, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Meta {
  id: number;
  user_whatsapp: string;
  meta_mensal: number;
  gasto_total: number;
  mes_ano: string;
  created_at: string;
}

interface MetaChartProps {
  meta: Meta | null;
}

export const MetaChart = ({ meta }: MetaChartProps) => {
  const [viewType, setViewType] = useState<'mensal' | 'semanal'>('mensal');
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calcular meta semanal baseada na meta mensal (aproximadamente 4.33 semanas por mês)
  const metaSemanal = meta ? meta.meta_mensal / 4.33 : 0;
  
  // Para gasto semanal, vamos usar uma aproximação baseada no gasto total do mês
  const gastoSemanal = meta ? meta.gasto_total / 4.33 : 0;

  if (!meta) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {viewType === 'mensal' ? 'Meta Mensal' : 'Meta Semanal'}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewType === 'mensal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('mensal')}
                className="h-8"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Mensal
              </Button>
              <Button
                variant={viewType === 'semanal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('semanal')}
                className="h-8"
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                Semanal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden p-3 sm:p-6">
          <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhuma meta encontrada</p>
              <p className="text-sm text-muted-foreground">Defina uma meta para acompanhar seu progresso</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Valores dinâmicos baseados no tipo de visualização
  const currentMeta = viewType === 'mensal' ? meta.meta_mensal : metaSemanal;
  const currentGasto = viewType === 'mensal' ? meta.gasto_total : gastoSemanal;
  
  const progressPercentage = Math.min((currentGasto / currentMeta) * 100, 100);
  const remaining = currentMeta - currentGasto;
  const isOverBudget = currentGasto > currentMeta;
  const excess = isOverBudget ? currentGasto - currentMeta : 0;

  const chartData = [
    {
      name: "Progresso",
      gasto: currentGasto,
      meta: currentMeta,
      remaining: Math.max(0, remaining),
    }
  ];

  const chartConfig = {
    gasto: {
      label: "Gasto Atual",
      color: isOverBudget ? "hsl(var(--destructive))" : "hsl(var(--chart-1))",
    },
    meta: {
      label: "Meta",
      color: "hsl(var(--muted))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {viewType === 'mensal' ? 'Meta Mensal' : 'Meta Semanal'} - {meta.mes_ano}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewType === 'mensal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('mensal')}
              className="h-8"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Mensal
            </Button>
            <Button
              variant={viewType === 'semanal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('semanal')}
              className="h-8"
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              Semanal
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden p-3 sm:p-6">
        <div className="space-y-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Meta {viewType === 'mensal' ? 'Mensal' : 'Semanal'}</p>
              <p className="text-lg font-semibold">{formatCurrency(currentMeta)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gasto Atual</p>
              <p className="text-lg font-semibold">{formatCurrency(currentGasto)}</p>
              {viewType === 'semanal' && (
                <p className="text-xs text-muted-foreground">Estimativa baseada no mês</p>
              )}
            </div>
          </div>

          {/* Progresso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <Badge variant={isOverBudget ? "destructive" : progressPercentage >= 80 ? "secondary" : "default"}>
                {progressPercentage.toFixed(1)}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  isOverBudget 
                    ? "bg-destructive" 
                    : progressPercentage >= 80 
                      ? "bg-orange-500" 
                      : "bg-primary"
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            {isOverBudget ? (
              <>
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm">
                  <span className="text-destructive font-semibold">
                    Excedeu {formatCurrency(excess)}
                  </span>
                  {" "}da meta
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm">
                  Restam <span className="font-semibold text-success">
                    {formatCurrency(remaining)}
                  </span> para atingir a meta
                </span>
              </>
            )}
          </div>

          {/* Gráfico */}
          <div className="w-full overflow-hidden">
            <ChartContainer config={chartConfig} className="h-[120px] sm:h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
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
                          formatCurrency(value as number),
                          name === "gasto" ? "Gasto Atual" : "Meta",
                        ]}
                      />
                    }
                  />
                  <Bar
                    dataKey="meta"
                    fill="var(--color-meta)"
                    radius={[4, 4, 4, 4]}
                    opacity={0.3}
                  />
                  <Bar
                    dataKey="gasto"
                    fill="var(--color-gasto)"
                    radius={[4, 4, 4, 4]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};