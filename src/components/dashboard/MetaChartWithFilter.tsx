import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Target, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Meta {
  id: number;
  user_whatsapp: string;
  meta_mensal: number;
  gasto_total: number;
  mes_ano?: string;
  semana_ano?: string;
  tipo_meta?: "mensal" | "semanal";
  created_at: string;
}

interface MetaChartWithFilterProps {
  meta: Meta | null;
  userWhatsapp: string;
}

export const MetaChartWithFilter = ({ meta, userWhatsapp }: MetaChartWithFilterProps) => {
  const [viewType, setViewType] = useState<"mensal" | "semanal">("mensal");
  const [weeklyMeta, setWeeklyMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const fetchWeeklyMeta = async () => {
    if (!userWhatsapp) return;
    
    setIsLoading(true);
    try {
      const currentDate = new Date();
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      const semanaAno = `${format(weekStart, "dd/MM", { locale: ptBR })}-${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;

      const { data, error } = await supabase
        .from("metas")
        .select("*")
        .eq("user_whatsapp", userWhatsapp)
        .eq("tipo_meta", "semanal")
        .eq("semana_ano", semanaAno)
        .maybeSingle();

      if (error) {
        console.error("Error fetching weekly meta:", error);
        return;
      }

      setWeeklyMeta(data as Meta);
    } catch (error) {
      console.error("Error fetching weekly meta:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar meta semanal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewType === "semanal") {
      fetchWeeklyMeta();
    }
  }, [viewType, userWhatsapp]);

  const currentMeta = viewType === "mensal" ? meta : weeklyMeta;
  const isMonthly = viewType === "mensal";

  if (!currentMeta && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {isMonthly ? "Meta Mensal" : "Meta Semanal"}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewType === "mensal" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("mensal")}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Mensal
              </Button>
              <Button
                variant={viewType === "semanal" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("semanal")}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Semanal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden p-3 sm:p-6">
          <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Nenhuma meta {isMonthly ? "mensal" : "semanal"} encontrada
              </p>
              <p className="text-sm text-muted-foreground">
                Defina uma meta para acompanhar seu progresso
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meta Semanal
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewType === "mensal" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("mensal")}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Mensal
              </Button>
              <Button
                variant={viewType === "semanal" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("semanal")}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Semanal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (!currentMeta) return null;

  const progressPercentage = Math.min((currentMeta.gasto_total / currentMeta.meta_mensal) * 100, 100);
  const remaining = currentMeta.meta_mensal - currentMeta.gasto_total;
  const isOverBudget = currentMeta.gasto_total > currentMeta.meta_mensal;
  const excess = isOverBudget ? currentMeta.gasto_total - currentMeta.meta_mensal : 0;

  const chartData = [
    {
      name: "Progresso",
      gasto: currentMeta.gasto_total,
      meta: currentMeta.meta_mensal,
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

  const getMetaTitle = () => {
    if (isMonthly) {
      return `Meta Mensal - ${currentMeta.mes_ano}`;
    } else {
      return `Meta Semanal - ${currentMeta.semana_ano}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {getMetaTitle()}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewType === "mensal" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("mensal")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Mensal
            </Button>
            <Button
              variant={viewType === "semanal" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("semanal")}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
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
              <p className="text-sm text-muted-foreground">Meta</p>
              <p className="text-lg font-semibold">{formatCurrency(currentMeta.meta_mensal)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gasto Atual</p>
              <p className="text-lg font-semibold">{formatCurrency(currentMeta.gasto_total)}</p>
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