import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, X, User, CreditCard } from "lucide-react";
import { useCep } from "@/hooks/use-cep";
import { useSubscription } from "@/hooks/use-subscription";
import { CancelSubscriptionButton } from "@/components/dashboard/CancelSubscriptionButton";

interface UserProfile {
  first_name: string;
  last_name: string;
  whatsapp: string;
  phone_whatsapp: string;
  birth_date: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const { searchCep, loading: cepLoading } = useCep();
  const { subscribed, subscription_tier, subscription_end } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    whatsapp: "",
    phone_whatsapp: "",
    birth_date: "",
    address: "",
    cep: "",
    city: "",
    state: "",
    neighborhood: "",
    street: "",
    number: "",
    complement: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        // Separar endereço em componentes se estiver em formato único
        const addressParts = data.address?.split(", ") || [];
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          whatsapp: data.whatsapp || "",
          phone_whatsapp: data.phone_whatsapp || "",
          birth_date: data.birth_date || "",
          address: data.address || "",
          cep: "",
          city: addressParts[1] || "",
          state: addressParts[2] || "",
          neighborhood: "",
          street: addressParts[0] || "",
          number: "",
          complement: "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as informações do perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCepChange = async (cep: string) => {
    setProfile(prev => ({ ...prev, cep }));
    
    if (cep.length === 8) {
      const cepData = await searchCep(cep);
      if (cepData) {
        setProfile(prev => ({
          ...prev,
          street: cepData.logradouro,
          neighborhood: cepData.bairro,
          city: cepData.localidade,
          state: cepData.uf,
        }));
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Montar endereço completo
      const fullAddress = [
        profile.street && profile.number ? `${profile.street}, ${profile.number}` : profile.street,
        profile.complement,
        profile.neighborhood,
        profile.city,
        profile.state
      ].filter(Boolean).join(", ");

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          whatsapp: profile.whatsapp,
          phone_whatsapp: profile.phone_whatsapp,
          birth_date: profile.birth_date || null,
          address: fullAddress,
        })
        .eq("user_id", session.user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Informações atualizadas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Informações Pessoais */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Nome</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Sobrenome</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Seu sobrenome"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={profile.whatsapp}
                    onChange={(e) => setProfile(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="phone_whatsapp">Telefone/WhatsApp</Label>
                  <Input
                    id="phone_whatsapp"
                    value={profile.phone_whatsapp}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone_whatsapp: e.target.value }))}
                    placeholder="00000000000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={profile.birth_date}
                  onChange={(e) => setProfile(prev => ({ ...prev, birth_date: e.target.value }))}
                />
              </div>

              <Separator />

              <h3 className="text-lg font-semibold">Endereço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={profile.cep}
                    onChange={(e) => handleCepChange(e.target.value.replace(/\D/g, ""))}
                    placeholder="00000-000"
                    maxLength={8}
                    disabled={cepLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="street">Logradouro</Label>
                  <Input
                    id="street"
                    value={profile.street}
                    onChange={(e) => setProfile(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="Rua, avenida, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={profile.number}
                    onChange={(e) => setProfile(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="123"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={profile.complement}
                    onChange={(e) => setProfile(prev => ({ ...prev, complement: e.target.value }))}
                    placeholder="Apartamento, bloco, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={profile.neighborhood}
                    onChange={(e) => setProfile(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={profile.state}
                    onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assinatura */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscribed ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Plano Atual</p>
                    <p className="font-semibold">{subscription_tier}</p>
                  </div>
                  
                  {subscription_end && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Válida até</p>
                      <p className="font-semibold">
                        {new Date(subscription_end).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}

                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Cancelar Assinatura
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Você manterá acesso até o final do período vigente
                    </p>
                    <CancelSubscriptionButton />
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Você não possui uma assinatura ativa
                  </p>
                  <Button 
                    onClick={() => navigate("/pricing")}
                    className="w-full"
                  >
                    Ver Planos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}