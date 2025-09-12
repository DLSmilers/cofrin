import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PiggyBank, User, Calendar, MapPin, Phone } from "lucide-react";
import { EmailConfirmationDialog } from "@/components/auth/EmailConfirmationDialog";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    address: "",
    phoneWhatsapp: ""
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return false;
    }
    if (!formData.lastName.trim()) {
      toast({ title: "Erro", description: "Sobrenome é obrigatório", variant: "destructive" });
      return false;
    }
    if (!formData.email.trim()) {
      toast({ title: "Erro", description: "Email é obrigatório", variant: "destructive" });
      return false;
    }
    if (!formData.password) {
      toast({ title: "Erro", description: "Senha é obrigatória", variant: "destructive" });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Erro", description: "Senhas não coincidem", variant: "destructive" });
      return false;
    }
    if (formData.password.length < 6) {
      toast({ title: "Erro", description: "Senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return false;
    }
    if (!formData.phoneWhatsapp.trim()) {
      toast({ title: "Erro", description: "WhatsApp é obrigatório", variant: "destructive" });
      return false;
    }
    if (!formData.birthDate) {
      toast({ title: "Erro", description: "Data de nascimento é obrigatória", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            birth_date: formData.birthDate,
            address: formData.address,
            phone_whatsapp: formData.phoneWhatsapp,
            whatsapp: formData.phoneWhatsapp
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Conta já existe",
            description: "Este email já está cadastrado. Tente fazer login.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao criar conta",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        // Sucesso - mostrar tela de confirmação
        setUserEmail(formData.email);
        setShowEmailConfirmation(true);
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

  const handleBackToLogin = () => {
    navigate("/auth");
  };

  // Se deve mostrar a tela de confirmação de email
  if (showEmailConfirmation) {
    return <EmailConfirmationDialog email={userEmail} onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full">
                <PiggyBank className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Crie sua conta no <span className="text-primary">Cofrin</span>
            </h1>
            <p className="text-muted-foreground">
              Comece seu teste gratuito de 30 dias e transforme suas finanças
            </p>
          </div>

          {/* Sign Up Form */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Dados Pessoais</CardTitle>
              <CardDescription className="text-center">
                Preencha as informações abaixo para criar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Seu sobrenome"
                      required
                    />
                  </div>
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Nascimento *
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="phoneWhatsapp" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    WhatsApp *
                  </Label>
                  <Input
                    id="phoneWhatsapp"
                    type="tel"
                    value={formData.phoneWhatsapp}
                    onChange={(e) => handleInputChange("phoneWhatsapp", e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Este número será usado para validar o uso do bot no WhatsApp
                  </p>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Rua, número, bairro, cidade - CEP"
                    rows={3}
                  />
                </div>

                {/* Login Credentials */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Dados de Acesso</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          placeholder="Confirme sua senha"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground py-3 text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? "Criando conta..." : "Criar Conta e Começar Teste Gratuito"}
                </Button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-muted-foreground">
                    Já tem uma conta?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={() => navigate("/auth")}
                    >
                      Fazer login
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

export default SignUp;