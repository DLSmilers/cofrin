import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { toast } from "@/hooks/use-toast";

interface User {
  uuid: string;
  nome: string;
  user_whatsapp: string;
  dashboard_token: string;
}

interface Transaction {
  id: number;
  valor: number;
  user: string;
  estabelecimento: string;
  detalhes: string;
  tipo: string;
  categoria: string;
  created_at: string;
  quando: string;
}

export type TimeFilterType = "day" | "week" | "month" | "custom";

const Dashboard = () => {
  const { dashboard_token } = useParams<{ dashboard_token: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("month");
  const [customDateRange, setCustomDateRange] = useState<{start?: Date; end?: Date}>({});

  useEffect(() => {
    if (!dashboard_token) {
      toast({
        title: "Token inválido",
        description: "Token do dashboard não encontrado na URL",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const fetchUserAndTransactions = async () => {
      try {
        // Usar função segura que valida token E retorna transações
        const { data: dashboardData, error: dashboardError } = await supabase
          .rpc('get_dashboard_data', { token_input: dashboard_token });

        if (dashboardError || !dashboardData || dashboardData.length === 0) {
          toast({
            title: "Usuário não encontrado",
            description: "Token do dashboard inválido ou expirado",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Extrair informações do usuário (primeira linha)
        const firstRow = dashboardData[0];
        const userInfo = {
          uuid: firstRow.user_uuid,
          nome: firstRow.user_name,
          user_whatsapp: firstRow.user_whatsapp,
          dashboard_token: dashboard_token,
        };
        setUser(userInfo);

        // Extrair transações (filtrar linhas que têm transações)
        const transactionsData = dashboardData
          .filter(row => row.transaction_id !== null)
          .map(row => ({
            id: row.transaction_id,
            valor: row.transaction_valor,
            user: row.transaction_user,
            estabelecimento: row.transaction_estabelecimento,
            detalhes: row.transaction_detalhes,
            tipo: row.transaction_tipo,
            categoria: row.transaction_categoria,
            created_at: row.transaction_created_at,
            quando: row.transaction_quando,
          }));

        setTransactions(transactionsData || []);
      } catch (error) {
        console.error("Erro geral:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar os dados",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTransactions();
  }, [dashboard_token]);

  useEffect(() => {
    filterTransactionsByTime();
  }, [transactions, timeFilter, customDateRange]);

  const filterTransactionsByTime = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (timeFilter) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "custom":
        if (customDateRange.start && customDateRange.end) {
          startDate = customDateRange.start;
          endDate = customDateRange.end;
        } else {
          setFilteredTransactions(transactions);
          return;
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.quando || transaction.created_at);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    setFilteredTransactions(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Token do dashboard inválido ou expirado. Verifique a URL e tente novamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <DashboardHeader userName={user.nome} />
        
        <TimeFilter
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
        />

        <ExportButton 
          transactions={filteredTransactions} 
          userName={user.nome}
          timeFilter={timeFilter}
        />

        <MetricsCards transactions={filteredTransactions} />

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <ExpenseChart transactions={filteredTransactions} />
          <CategoryChart transactions={filteredTransactions} />
        </div>

        <TransactionsList transactions={filteredTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;