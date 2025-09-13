import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Target, TrendingUp, TrendingDown, Calendar, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { WeeklyGoalsList } from "./WeeklyGoalsList";
import { WeeklyGoalDialog } from "./WeeklyGoalDialog";

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
  actualSpending?: number; // Gasto real calculado das transações
}

export const MetaChart = ({ meta, actualSpending }: MetaChartProps) => {
  const [showWeeklyGoals, setShowWeeklyGoals] = useState(false);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatMonthYear = (mesAno: string) => {
    const [year, month] = mesAno.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthName = monthNames[parseInt(month) - 1];
    return `Meta de ${monthName} de ${year}`;
  };

  if (!meta && !showWeeklyGoals) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {showWeeklyGoals ? "Metas Semanais" : "Meta Mensal"}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="meta-switch" className="text-sm">
                <Calendar className="h-4 w-4 inline mr-1" />
                Mensal
              </Label>
              <Switch 
                id="meta-switch" 
                checked={showWeeklyGoals} 
                onCheckedChange={setShowWeeklyGoals}
              />
              <Label htmlFor="meta-switch" className="text-sm">
                <CalendarDays className="h-4 w-4 inline mr-1" />
                Semanal
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden p-3 sm:p-6">
          {showWeeklyGoals ? (
            <WeeklyGoalsList showCreateButton={false} />
          ) : (
            <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
              <div className="text-center space-y-2">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhuma meta encontrada</p>
                <p className="text-sm text-muted-foreground">Defina uma meta para acompanhar seu progresso</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Se estiver mostrando metas semanais, renderiza apenas a lista
  if (showWeeklyGoals) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Metas Semanais
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="meta-switch" className="text-sm">
                <Calendar className="h-4 w-4 inline mr-1" />
                Mensal
              </Label>
              <Switch 
                id="meta-switch" 
                checked={showWeeklyGoals} 
                onCheckedChange={setShowWeeklyGoals}
              />
              <Label htmlFor="meta-switch" className="text-sm">
                <CalendarDays className="h-4 w-4 inline mr-1" />
                Semanal
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Metas Semanais</h3>
            <WeeklyGoalDialog onGoalCreated={() => window.location.reload()} />
          </div>
          <WeeklyGoalsList showCreateButton={false} />
        </CardContent>
      </Card>
    );
  }

  // Se meta é null, não é possível renderizar o gráfico mensal
  if (!meta) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meta Mensal
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="meta-switch" className="text-sm">
                <Calendar className="h-4 w-4 inline mr-1" />
                Mensal
              </Label>
              <Switch 
                id="meta-switch" 
                checked={showWeeklyGoals} 
                onCheckedChange={setShowWeeklyGoals}
              />
              <Label htmlFor="meta-switch" className="text-sm">
                <CalendarDays className="h-4 w-4 inline mr-1" />
                Semanal
              </Label>
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

  // Usar o gasto real calculado das transações se disponível, senão usar o da meta
  const currentSpending = actualSpending ?? meta.gasto_total;
  
  // Agora podemos calcular com segurança, pois sabemos que meta não é null
  const progressPercentage = Math.min((currentSpending / meta.meta_mensal) * 100, 100);
  const remaining = meta.meta_mensal - currentSpending;
  const isOverBudget = currentSpending > meta.meta_mensal;
  const excess = isOverBudget ? currentSpending - meta.meta_mensal : 0;

  const chartData = [
    {
      name: "Progresso",
      gasto: currentSpending,
      meta: meta.meta_mensal,
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
            {formatMonthYear(meta.mes_ano)}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="meta-switch" className="text-sm">
              <Calendar className="h-4 w-4 inline mr-1" />
              Mensal
            </Label>
            <Switch 
              id="meta-switch" 
              checked={showWeeklyGoals} 
              onCheckedChange={setShowWeeklyGoals}
            />
            <Label htmlFor="meta-switch" className="text-sm">
              <CalendarDays className="h-4 w-4 inline mr-1" />
              Semanal
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden p-3 sm:p-6">
        <div className="space-y-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Meta</p>
              <p className="text-lg font-semibold">{formatCurrency(meta.meta_mensal)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gasto Atual</p>
              <p className="text-lg font-semibold">{formatCurrency(currentSpending)}</p>
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