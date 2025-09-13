import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, RefreshCw, Calendar, User, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LogEntry {
  id: string;
  user_name: string;
  user_whatsapp: string;
  action: string;
  details: any;
  transaction_type: string;
  transaction_amount: number;
  affected_table: string;
  record_id: string;
  ip_address: string | null;
  created_at: string;
}

const actionTranslations: Record<string, string> = {
  'user_login': 'Login do Usuário',
  'user_logout': 'Logout do Usuário',
  'user_registration': 'Registro de Usuário',
  'transaction_created': 'Transação Criada',
  'transaction_updated': 'Transação Atualizada',
  'transaction_deleted': 'Transação Excluída',
  'goal_created': 'Meta Criada',
  'goal_updated': 'Meta Atualizada',
  'goal_deleted': 'Meta Excluída',
  'parceled_payment_created': 'Pagamento Parcelado Criado',
  'parceled_payment_updated': 'Pagamento Parcelado Atualizado',
  'parceled_payment_deleted': 'Pagamento Parcelado Excluído',
  'dashboard_access': 'Acesso ao Dashboard'
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'user_login':
    case 'user_registration':
    case 'dashboard_access':
      return 'bg-green-500/10 text-green-700 border-green-500/20';
    case 'user_logout':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    case 'transaction_created':
    case 'goal_created':
    case 'parceled_payment_created':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    case 'transaction_updated':
    case 'goal_updated':
    case 'parceled_payment_updated':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    case 'transaction_deleted':
    case 'goal_deleted':
    case 'parceled_payment_deleted':
      return 'bg-red-500/10 text-red-700 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
};

export const SystemLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (searchTerm) {
        query = query.or(`user_name.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%,user_whatsapp.ilike.%${searchTerm}%`);
      }

      if (actionFilter !== "all") {
        query = query.eq('action', actionFilter);
      }

      if (tableFilter !== "all") {
        query = query.eq('affected_table', tableFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar logs:", error);
        toast({
          title: "Erro ao carregar logs",
          description: "Não foi possível carregar os logs do sistema",
          variant: "destructive",
        });
        return;
      }

      setLogs((data || []).map(log => ({
        ...log,
        ip_address: log.ip_address as string | null
      })));
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchTerm, actionFilter, tableFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderLogDetails = (log: LogEntry) => {
    if (!log.details) return null;

    const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
    
    return (
      <div className="mt-2 text-xs text-muted-foreground">
        {Object.entries(details).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span className="font-medium capitalize">{key}:</span>
            <span>{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Logs do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Logs do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuário, ação ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="user_login">Login</SelectItem>
              <SelectItem value="user_registration">Registro</SelectItem>
              <SelectItem value="transaction_created">Transação Criada</SelectItem>
              <SelectItem value="goal_created">Meta Criada</SelectItem>
              <SelectItem value="parceled_payment_created">Pagamento Parcelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por tabela" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as tabelas</SelectItem>
              <SelectItem value="transacoes">Transações</SelectItem>
              <SelectItem value="metas">Metas</SelectItem>
              <SelectItem value="pagamentos_parcelados">Pagamentos Parcelados</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchLogs}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista de Logs */}
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={getActionColor(log.action)}
                      >
                        {actionTranslations[log.action] || log.action}
                      </Badge>
                      
                      {log.transaction_amount && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(log.transaction_amount)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{log.user_name || 'Usuário Desconhecido'}</span>
                      {log.user_whatsapp && (
                        <span className="text-sm text-muted-foreground">
                          ({log.user_whatsapp})
                        </span>
                      )}
                    </div>

                    {renderLogDetails(log)}

                    {log.affected_table && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Tabela:</span> {log.affected_table}
                        {log.record_id && (
                          <>
                            <span className="ml-2 font-medium">ID:</span> {log.record_id}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    <div>{format(new Date(log.created_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
                    <div>{format(new Date(log.created_at), 'HH:mm:ss', { locale: ptBR })}</div>
                    {log.ip_address && (
                      <div className="text-xs mt-1">IP: {log.ip_address}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {logs.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Exibindo {logs.length} registro(s) mais recentes
          </div>
        )}
      </CardContent>
    </Card>
  );
};