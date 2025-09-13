import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Target, Calendar, TrendingUp, Trash2 } from "lucide-react";
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

  const getProgressColor = (percentage: number) => {
    if (percentage <= 50) return "bg-green-500";
    if (percentage <= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (spent: number, goal: number) => {
    const percentage = (spent / goal) * 100;
    
    if (percentage <= 50) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Excelente</Badge>;
    } else if (percentage <= 80) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
    } else if (percentage <= 100) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Quase no limite</Badge>;
    } else {
      return <Badge variant="destructive">Meta excedida</Badge>;
    }
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
            const percentage = goal.meta_mensal > 0 ? (goal.gasto_total / goal.meta_mensal) * 100 : 0;
            
            return (
              <div
                key={goal.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{goal.semana_ano}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(goal.gasto_total, goal.meta_mensal)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da semana</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Gasto:</span>
                    <span className="font-medium">
                      R$ {goal.gasto_total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Meta:</span>
                    <span className="font-medium">
                      R$ {goal.meta_mensal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Criada em {format(parseISO(goal.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
};