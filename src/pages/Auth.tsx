import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PiggyBank } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [isPasswordUpdateMode, setIsPasswordUpdateMode] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);

  useEffect(() => {
    // Check for password reset token in URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (accessToken && refreshToken && type === 'recovery') {
      setIsPasswordUpdateMode(true);
      return;
    }

    // Only check auth if not in password update mode
    if (!isPasswordUpdateMode) {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/");
        }
      };
      checkAuth();
    }
  }, [navigate, searchParams, isPasswordUpdateMode]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Preencha email e senha",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Erro de login",
            description: "Email ou senha incorretos",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao fazer login",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao Cofrin"
        });
        // Get current user and redirect to dashboard
        const { data: { user } } = await supabase.auth.getUser();
        navigate(`/dashboard/${user?.id}`);
      }
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Digite seu email para redefinir a senha",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique seu email para redefinir sua senha"
        });
        setIsResetMode(false);
      }
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha ambos os campos de senha",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Senha atualizada!",
          description: "Sua senha foi alterada com sucesso"
        });
        navigate("/");
      }
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Digite seu email para reenviar a confirmação",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email reenviado!",
          description: "Verifique seu email para confirmar sua conta"
        });
        setShowResendConfirmation(false);
      }
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 flex items-center justify-center py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full">
                <PiggyBank className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Entrar no <span className="text-primary">Cofrin</span>
            </h1>
            <p className="text-muted-foreground">
              Acesse sua conta e continue gerenciando suas finanças
            </p>
          </div>

          {/* Login Form */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {isPasswordUpdateMode ? "Nova Senha" : isResetMode ? "Redefinir Senha" : "Fazer Login"}
              </CardTitle>
              <CardDescription className="text-center">
                {isPasswordUpdateMode 
                  ? "Digite sua nova senha"
                  : isResetMode 
                  ? "Digite seu email para receber o link de redefinição"
                  : "Digite suas credenciais para acessar sua conta"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPasswordUpdateMode ? (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground py-3 text-lg font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Atualizando..." : "Atualizar Senha"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={isResetMode ? handlePasswordReset : handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  {!isResetMode && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                        required
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground py-3 text-lg font-semibold"
                    disabled={loading}
                  >
                    {loading 
                      ? (isResetMode ? "Enviando..." : "Entrando...") 
                      : (isResetMode ? "Enviar Link" : "Entrar")
                    }
                  </Button>

                  {/* Action Links */}
                  <div className="space-y-3 pt-4">
                    {!isResetMode && (
                      <div className="flex justify-between text-sm">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => setIsResetMode(true)}
                          type="button"
                        >
                          Esqueceu a senha?
                        </Button>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => setShowResendConfirmation(true)}
                          type="button"
                        >
                          Reenviar confirmação
                        </Button>
                      </div>
                    )}

                    {isResetMode && (
                      <div className="text-center">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => setIsResetMode(false)}
                          type="button"
                        >
                          Voltar ao login
                        </Button>
                      </div>
                    )}

                    {showResendConfirmation && (
                      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Não recebeu o email de confirmação?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResendConfirmation}
                            disabled={loading}
                          >
                            {loading ? "Enviando..." : "Reenviar"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowResendConfirmation(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sign Up Link */}
                  {!isResetMode && !showResendConfirmation && (
                    <div className="text-center pt-4 border-t border-border/50">
                      <p className="text-muted-foreground">
                        Não tem uma conta?{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => navigate("/signup")}
                        >
                          Criar conta gratuita
                        </Button>
                      </p>
                    </div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          {/* Back to Marketing */}
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              Voltar à página inicial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;