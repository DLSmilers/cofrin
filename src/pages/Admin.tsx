import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SystemLogs } from "@/components/admin/SystemLogs";
import { 
  Users, 
  Trash2, 
  Eye, 
  Activity, 
  Shield, 
  Database,
  Calendar,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface User {
  user_id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  profile_data: any;
  role: string;
  total_transactions: number;
  total_amount: number;
}

interface AccessLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface UserTransaction {
  id: number;
  valor: number;
  estabelecimento: string;
  tipo: string;
  categoria: string;
  created_at: string;
  detalhes: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [selectedUserTransactions, setSelectedUserTransactions] = useState<UserTransaction[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (roleData?.role !== "admin") {
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para acessar esta área.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setIsAdmin(true);
        await loadData();
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const loadData = async () => {
    try {
      // Carregar usuários
      const { data: usersData, error: usersError } = await supabase
        .rpc("admin_get_all_users");

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Carregar logs de acesso
      const { data: logsData, error: logsError } = await supabase
        .from("access_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setAccessLogs((logsData || []) as AccessLog[]);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do painel administrativo.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc("admin_delete_user", {
        target_user_id: userId
      });

      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído permanentemente do sistema.",
      });

      await loadData();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const viewUserTransactions = async (userId: string) => {
    try {
      // Primeiro pegar o user_whatsapp do usuário
      const { data: userData } = await supabase
        .from("users")
        .select("user_whatsapp")
        .eq("uuid", userId)
        .single();

      if (!userData) return;

      // Buscar transações do usuário
      const { data: transactions, error } = await supabase
        .from("transacoes")
        .select("*")
        .eq("user_whatsapp", userData.user_whatsapp)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSelectedUserTransactions(transactions || []);
      setSelectedUserId(userId);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar transações do usuário.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p>Verificando permissões de administrador...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Controle total do sistema - Usuários, transações e logs de acesso
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="system-logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs do Sistema
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Logs de Acesso
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Transações
            </TabsTrigger>
          </TabsList>

          {/* Tab de Usuários */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciamento de Usuários ({users.length})
                </CardTitle>
                <CardDescription>
                  Visualize, gerencie e exclua usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{user.email}</h3>
                          <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>
                            {user.role}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Nome: {user.profile_data?.first_name} {user.profile_data?.last_name}</p>
                          <p>Cadastro: {format(new Date(user.created_at), "dd/MM/yyyy")}</p>
                          <p>Último acesso: {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "dd/MM/yyyy HH:mm") : "Nunca"}</p>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Database className="h-4 w-4" />
                              {user.total_transactions} transações
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              R$ {Number(user.total_amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewUserTransactions(user.user_id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Transações
                        </Button>
                        {user.role !== "admin" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-destructive" />
                                  Excluir Usuário Permanentemente
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação irá excluir permanentemente o usuário <strong>{user.email}</strong> e todos os seus dados:
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Perfil e informações pessoais</li>
                                    <li>Todas as transações ({user.total_transactions})</li>
                                    <li>Logs de acesso</li>
                                    <li>Metas financeiras</li>
                                  </ul>
                                  <br />
                                  <strong>Esta ação não pode ser desfeita!</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.user_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir Permanentemente
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Logs do Sistema */}
          <TabsContent value="system-logs">
            <SystemLogs />
          </TabsContent>

          {/* Tab de Logs de Acesso */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Logs de Acesso ({accessLogs.length})
                </CardTitle>
                <CardDescription>
                  Monitore as atividades dos usuários no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accessLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg text-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{log.action}</Badge>
                          <span className="text-muted-foreground">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-muted-foreground">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>IP: {log.ip_address || "N/A"}</p>
                        <p>User ID: {log.user_id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Transações do Usuário Selecionado */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Transações do Usuário
                </CardTitle>
                <CardDescription>
                  {selectedUserId 
                    ? `Visualizando transações do usuário selecionado (${selectedUserTransactions.length} transações)`
                    : "Selecione um usuário na aba 'Usuários' para ver suas transações"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedUserId ? (
                  <div className="space-y-3">
                    {selectedUserTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{transaction.estabelecimento}</h4>
                            <Badge variant={transaction.tipo === "receita" ? "default" : "secondary"}>
                              {transaction.tipo}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>Categoria: {transaction.categoria}</p>
                            <p>Data: {format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm")}</p>
                            {transaction.detalhes && <p>Detalhes: {transaction.detalhes}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.tipo === "receita" ? "text-green-600" : "text-red-600"
                          }`}>
                            {transaction.tipo === "receita" ? "+" : "-"}R$ {Number(transaction.valor).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {selectedUserTransactions.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Este usuário ainda não possui transações registradas.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Selecione um usuário na aba "Usuários" para visualizar suas transações
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;