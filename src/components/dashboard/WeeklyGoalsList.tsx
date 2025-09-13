import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Target, Calendar, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WeeklyGoalDialog } from "./WeeklyGoalDialog";

interface WeeklyGoal {
  id: number;
  semana_ano: string;
  meta_mensal: number;
  gasto_total: number;
  created_at: string;
}

interface WeeklyGoalsListProps {
  showCreateButton?: boolean;
}

export const WeeklyGoalsList = ({ showCreateButton = true }: WeeklyGoalsListProps) => {
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWeeklyGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("user_whatsapp")
        .eq("uuid", user.id)
        .single();

      if (!userData) return;

      const { data, error } = await supabase
        .from("metas")
        .select("*")
        .eq("user_whatsapp", userData.user_whatsapp)
        .eq("tipo_meta", "semanal")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching weekly goals:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar metas semanais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoal = async (goalId: number) => {
    try {
      const { error } = await supabase
        .from("metas")
        .delete()
        .eq("id", goalId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Meta excluída com sucesso",
      });

      fetchWeeklyGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir meta",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWeeklyGoals();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatWeekYear = (semanaAno: string) => {
    // Formato esperado: "Semana XX - YYYY" ou similar
    return `${semanaAno}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">Carregando metas...</div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="space-y-4">
        {showCreateButton && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Metas Semanais</h3>
            <WeeklyGoalDialog onGoalCreated={fetchWeeklyGoals} />
          </div>
        )}
        <div className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma meta semanal criada ainda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showCreateButton && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Metas Semanais</h3>
          <WeeklyGoalDialog onGoalCreated={fetchWeeklyGoals} />
        </div>
      )}
      <div className="space-y-4">
        {goals.map((goal) => {
          const currentSpending = goal.gasto_total;
          const progressPercentage = Math.min((currentSpending / goal.meta_mensal) * 100, 100);
          const remaining = goal.meta_mensal - currentSpending;
          const isOverBudget = currentSpending > goal.meta_mensal;
          const excess = isOverBudget ? currentSpending - goal.meta_mensal : 0;

          const chartData = [
            {
              name: "Progresso",
              gasto: currentSpending,
              meta: goal.meta_mensal,
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
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {formatWeekYear(goal.semana_ano)}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-hidden p-3 sm:p-6">
                <div className="space-y-4">
                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Meta</p>
                      <p className="text-lg font-semibold">{formatCurrency(goal.meta_mensal)}</p>
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

                  {/* Data de criação */}
                  <div className="text-xs text-muted-foreground">
                    Criada em {format(parseISO(goal.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};