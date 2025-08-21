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
  user_whatsapp: string;
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
        // Usar função segura para validar token
        const { data: userData, error: userError } = await supabase
          .rpc('validate_dashboard_token', { token_input: dashboard_token });

        if (userError || !userData || userData.length === 0) {
          toast({
            title: "Usuário não encontrado",
            description: "Token do dashboard inválido ou expirado",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const userInfo = userData[0];
        setUser({
          uuid: userInfo.user_uuid,
          nome: userInfo.user_name,
          user_whatsapp: userInfo.user_whatsapp,
          dashboard_token: dashboard_token,
        });

        // Buscar transações do usuário
        let transactionsData: any[] | null = null;
        let transactionsError: any = null;
        
        // Fazer fetch usando um approach mais simples para evitar problemas de tipos
        const response = await fetch(
          `https://rliefaciadhxjjynuyod.supabase.co/rest/v1/transacoes?user_whatsapp=eq.${userInfo.user_whatsapp}&order=created_at.desc`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsaWVmYWNpYWRoeGpqeW51eW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTgzOTYsImV4cCI6MjA3MDYzNDM5Nn0.DK2tzoLNRRwF0bG6qkHNrSye3xXGB-x-a0NIICHtZlo',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsaWVmYWNpYWRoeGpqeW51eW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTgzOTYsImV4cCI6MjA3MDYzNDM5Nn0.DK2tzoLNRRwF0bG6qkHNrSye3xXGB-x-a0NIICHtZlo',
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          transactionsData = await response.json();
        } else {
          transactionsError = { message: 'Erro ao buscar transações' };
        }

        if (transactionsError) {
          console.error("Erro ao buscar transações:", transactionsError);
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar as transações",
            variant: "destructive",
          });
          setTransactions([]); // Garantir que array vazio seja definido mesmo com erro
        } else {
          // Mapear os dados para a interface Transaction
          const mappedTransactions: Transaction[] = (transactionsData || []).map((item: any) => ({
            id: item.id,
            valor: item.valor,
            user_whatsapp: item.user_whatsapp,
            estabelecimento: item.estabelecimento,
            detalhes: item.detalhes,
            tipo: item.tipo,
            categoria: item.categoria,
            created_at: item.created_at,
            quando: item.quando,
          }));
          
          setTransactions(mappedTransactions);
          // Para novos usuários sem transações, mostrar uma mensagem informativa
          if (!transactionsData || transactionsData.length === 0) {
            toast({
              title: "Dashboard carregado com sucesso",
              description: "Usuário autenticado. Ainda não há transações registradas.",
              variant: "default",
            });
          }
        }
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
    let endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Adiciona 1 dia para incluir hoje

    switch (timeFilter) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
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
          endDate = new Date(customDateRange.end.getTime() + 24 * 60 * 60 * 1000);
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full">
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

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 w-full overflow-hidden">
          <div className="w-full min-w-0 overflow-hidden">
            <ExpenseChart transactions={filteredTransactions} />
          </div>
          <div className="w-full min-w-0 overflow-hidden">
            <CategoryChart transactions={filteredTransactions} />
          </div>
        </div>

        <TransactionsList transactions={filteredTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;