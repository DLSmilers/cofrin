import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

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
              <CardTitle className="text-2xl text-center">Fazer Login</CardTitle>
              <CardDescription className="text-center">
                Digite suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
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

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground py-3 text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>

                {/* Sign Up Link */}
                <div className="text-center pt-4">
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
              </form>
            </CardContent>
          </Card>

          {/* Back to Marketing */}
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/marketing")}
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