import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { ParceledPaymentsList } from "@/components/dashboard/ParceledPaymentsList";
import { WeeklyGoalsList } from "@/components/dashboard/WeeklyGoalsList";
import { WeeklyGoalDialog } from "@/components/dashboard/WeeklyGoalDialog";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { MetaChart } from "@/components/dashboard/MetaChart";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { SubscriptionStatus } from "@/components/dashboard/SubscriptionStatus";
import { WhatsAppNotice } from "@/components/dashboard/WhatsAppNotice";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

interface Meta {
  id: number;
  user_whatsapp: string;
  meta_mensal: number;
  gasto_total: number;
  mes_ano: string;
  created_at: string;
}

export type TimeFilterType = "day" | "week" | "month" | "custom" | "specific-month";

const Dashboard = () => {
  const { dashboard_token } = useParams<{ dashboard_token: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("month");
  const [customDateRange, setCustomDateRange] = useState<{start?: Date; end?: Date}>({});
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

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
        
        // Verificar se o usuário é admin primeiro
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userInfo.user_uuid)
          .single();

        const isUserAdmin = roleData?.role === "admin";

        // Se não for admin, verificar período de teste e assinatura
        if (!isUserAdmin) {
          // Verificar se o período de teste expirou
          const { data: trialExpired, error: trialError } = await supabase
            .rpc('check_trial_expired', { user_uuid: userInfo.user_uuid });

          if (trialError) {
            console.error("Erro ao verificar período de teste:", trialError);
          }

          if (trialExpired) {
            // Atualiza status de assinatura a partir da Stripe antes de decidir
            try {
              await supabase.functions.invoke("check-subscription");
            } catch (err) {
              console.error("Erro ao atualizar assinatura:", err);
            }

            // Verificar se tem assinatura ativa no banco após atualização
            const { data: subscription, error: subError } = await supabase
              .from('subscribers')
              .select('subscribed')
              .eq('user_id', userInfo.user_uuid)
              .maybeSingle();

            if (subError) {
              console.error("Erro ao buscar assinatura:", subError);
            }

            // Redireciona se NÃO houver registro OU se vier explicitamente como não assinante
            if (!subscription || !subscription.subscribed) {
              toast({
                title: "Período de teste expirado",
                description: "Seu período de teste de 30 dias expirou. Escolha um plano para continuar usando o dashboard.",
                variant: "destructive",
              });
              navigate("/pricing");
              return;
            }
          }
        } else {
          // Log para admins
          
          toast({
            title: "Acesso Administrativo",
            description: "Bem-vindo, administrador! Você tem acesso ilimitado.",
            variant: "default",
          });
        }

        setUser({
          uuid: userInfo.user_uuid,
          nome: userInfo.user_name,
          user_whatsapp: userInfo.user_whatsapp,
          dashboard_token: dashboard_token,
        });

        // Buscar transações do usuário usando função que bypassa RLS
        
        
        // Usar função get_dashboard_data que já existe e bypassa RLS
        const { data: dashboardData, error: transactionsError } = await supabase
          .rpc('get_dashboard_data', { token_input: dashboard_token });
        

        if (transactionsError) {
          console.error("❌❌❌ ERRO SUPABASE:", transactionsError);
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar as transações",
            variant: "destructive",
          });
          setTransactions([]); // Garantir que array vazio seja definido mesmo com erro
        } else {
          // Mapear os dados diretamente da função get_dashboard_data
          const mappedTransactions: Transaction[] = (dashboardData || [])
            .filter((item: any) => item.transaction_id !== null)
            .map((item: any) => ({
              id: item.transaction_id,
              valor: item.transaction_valor,
              user_whatsapp: item.transaction_user,
              estabelecimento: item.transaction_estabelecimento,
              detalhes: item.transaction_detalhes,
              tipo: item.transaction_tipo,
              categoria: item.transaction_categoria,
              created_at: item.transaction_created_at,
              quando: item.transaction_quando,
            }));
          
           setTransactions(mappedTransactions);
          if (!mappedTransactions || mappedTransactions.length === 0) {
            toast({
              title: "🎉 Dashboard carregado com sucesso!",
              description: "Para começar a registrar transações, entre em contato via WhatsApp: +55 71 8299-8471",
              variant: "default",
            });
          } else {
            toast({
              title: "✅ Transações carregadas!",
              description: `${mappedTransactions.length} transação(ões) encontrada(s)`,
              variant: "default",
            });
          }
        }

        // Buscar meta do mês atual
        await fetchMetaForCurrentPeriod();

        // Registrar log de acesso ao dashboard
        try {
          const { error: logError } = await supabase.rpc('log_user_action', {
            p_user_id: userInfo.user_uuid,
            p_action: 'dashboard_access',
            p_details: {
              source: 'dashboard_url',
              user_agent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          });
          
          if (logError) {
            console.error("Erro ao registrar log de acesso:", logError);
          }
        } catch (logError) {
          console.error("Erro ao registrar log de acesso:", logError);
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

  const fetchMetaForCurrentPeriod = async () => {
    
    if (!user) {
      console.log("❌ User não existe, saindo da função");
      return;
    }

    let targetMonth: string;
    
    if (timeFilter === "specific-month" && selectedMonth) {
      // Format selected month as YYYY-MM
      targetMonth = selectedMonth.toISOString().slice(0, 7);
    } else {
      // Default to current month
      targetMonth = new Date().toISOString().slice(0, 7);
    }

    try {

      const metaResponse = await fetch(
        `https://rliefaciadhxjjynuyod.supabase.co/rest/v1/metas?user_whatsapp=eq.${user.user_whatsapp}&mes_ano=eq.${targetMonth}`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsaWVmYWNpYWRoeGpqeW51eW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTgzOTYsImV4cCI6MjA3MDYzNDM5Nn0.DK2tzoLNRRwF0bG6qkHNrSye3xXGB-x-a0NIICHtZlo',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsaWVmYWNpYWRoeGpqeW51eW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTgzOTYsImV4cCI6MjA3MDYzNDM5Nn0.DK2tzoLNRRwF0bG6qkHNrSye3xXGB-x-a0NIICHtZlo',
            'Content-Type': 'application/json'
          }
        }
      );
      
      
      
      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        
        if (metaData && metaData.length > 0) {
          setMeta(metaData[0]);
        } else {
          
          setMeta(null);
        }
      } else {
        
      }
    } catch (error) {
      console.error("Erro ao buscar meta:", error);
      setMeta(null);
    }
  };

  useEffect(() => {
    
    fetchMetaForCurrentPeriod();
  }, [timeFilter, selectedMonth, user]);

  useEffect(() => {
    filterTransactionsByTime();
  }, [transactions, timeFilter, customDateRange, selectedMonth]);

  const filterTransactionsByTime = () => {
    
    // Se não há transações, não faz nada
    if (transactions.length === 0) {
      setFilteredTransactions([]);
      return;
    }
    
    // IMPORTANTE: Para evitar filtros agressivos, se o timeFilter for "specific-month" 
    // mas o selectedMonth for o mês atual, tratar como "month" normal
    const now = new Date();
    const isCurrentMonth = selectedMonth && 
      selectedMonth.getMonth() === now.getMonth() && 
      selectedMonth.getFullYear() === now.getFullYear();
    
    const effectiveFilter = (timeFilter === "specific-month" && isCurrentMonth) ? "month" : timeFilter;
    
    
    let startDate: Date;
    let endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Adiciona 1 dia para incluir hoje

    switch (effectiveFilter) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        // Para o filtro "month", mostrar o mês atual sempre
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case "specific-month":
        if (selectedMonth) {
          startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
          endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);
        } else {
          // Se não há selectedMonth, usar o mês atual
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }
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
         // Por padrão, mostrar TODAS as transações sem qualquer filtro
         
         setFilteredTransactions(transactions);
         return;
     }

     // PROTEÇÃO: Se não há período definido adequadamente, mostrar todas as transações
     if (!startDate) {
       
       setFilteredTransactions(transactions);
       return;
     }

    const filtered = transactions.filter((transaction) => {
      // Priorizar o campo 'quando' se existir, senão usar 'created_at'
      const dateStr = transaction.quando || transaction.created_at;
      
      // Lidar com diferentes formatos de data
      let transactionDate: Date;
      if (typeof dateStr === 'string') {
        // Se é string, converter para Date
        transactionDate = new Date(dateStr);
      } else {
        // Se já é Date ou timestamp
        transactionDate = new Date(dateStr);
      }
      
      // Verificar se a data é válida
      if (isNaN(transactionDate.getTime())) {
        console.error("⚠️ Data inválida encontrada:", dateStr);
        return false;
      }
      
      const inRange = transactionDate >= startDate && transactionDate <= endDate;
      
      if (!inRange) {
      }
      
      return inRange;
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
      <div className="container scrollable mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full">
        <DashboardHeader userName={user.nome} isAdmin={isAdmin} />
        
        <WhatsAppNotice />
        
        <SubscriptionStatus />
        
        <TimeFilter
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
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

        {/* Meta Chart */}
        <MetaChart 
          meta={meta} 
          actualSpending={
            // Calcular o gasto real do mês das transações
            // Usar todas as transações (não filtradas) para calcular o mês da meta
            meta ? transactions
              .filter(t => {
                if (t.tipo !== "despesa") return false;
                
                // Verificar se a transação é do mesmo mês da meta
                const transactionDate = new Date(t.quando || t.created_at);
                const [metaYear, metaMonth] = meta.mes_ano.split('-');
                
                return transactionDate.getFullYear() === parseInt(metaYear) &&
                       (transactionDate.getMonth() + 1) === parseInt(metaMonth);
              })
              .reduce((sum, t) => sum + t.valor, 0) : 0
          } 
        />

        {/* Pagamentos Parcelados */}
        <ParceledPaymentsList userWhatsapp={user.user_whatsapp} />

        <TransactionsList
          transactions={filteredTransactions} 
          userWhatsapp={user.user_whatsapp}
          onTransactionDeleted={() => {
            // Refresh transactions data
            if (user) {
              const fetchTransactions = async () => {
                try {
                  console.log("🔄 Refrescando transações para user_whatsapp:", user.user_whatsapp);
                  const { data: refreshedData, error: refreshError } = await supabase
                    .from('transacoes')
                    .select('*')
                    .eq('user_whatsapp', user.user_whatsapp)
                    .order('created_at', { ascending: false });
                  
                  if (refreshError) {
                    console.error("❌ Erro ao refrescar transações:", refreshError);
                  } else {
                    const mappedTransactions: Transaction[] = (refreshedData || []).map((item: any) => ({
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
                    
                  }
                } catch (error) {
                  console.error("Erro ao refrescar transações:", error);
                }
              };
              fetchTransactions();
            }
          }}
          onTransactionAdded={() => {
            // Refresh transactions data
            const fetchTransactions = async () => {
              try {
                const response = await fetch(
                  `https://rliefaciadhxjjynuyod.supabase.co/rest/v1/transacoes?user_whatsapp=eq.${user.user_whatsapp}&order=created_at.desc`,
                  {
                    headers: {
                      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsaWVmYWNpYWRoeGpqeW51eW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTgzOTYsImV4cCI6MjA3MDYzNDM5Nn0.DK2tzoLNRRwF0bG6qkHNrSye3xXGB-x-a0NIICHtZlo',
                      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsaWVmYWNpYWRoeGpqeW51eW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTgzOTYsImV4cCI6MjA3MDYzNDM5Nn0.DK2tzoLNRRwF0bG6qkHNrSye3xXGB-x-a0NIICHtZlo',
                      'Content-Type': 'application/json'
                    }
                  }
                );
                
                if (response.ok) {
                  const transactionsData = await response.json();
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
                }
              } catch (error) {
                console.error("Erro ao recarregar transações:", error);
              }
            };
            fetchTransactions();
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;