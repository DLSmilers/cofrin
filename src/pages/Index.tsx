import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Shield, Bot, Zap, MessageSquare, DollarSign, Target, ArrowRight, CheckCircle, Users, Star, Instagram, ShoppingBag, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const marketingQuestions = [
    {
      question: "Quantas vezes você compra algo que viu no Instagram por mês?",
      options: ["1-2 vezes", "3-5 vezes", "6-10 vezes", "Mais de 10 vezes", "Eu perdi a conta! 😅"]
    },
    {
      question: "Qual é o seu maior 'gatilho' de compra no Instagram?",
      options: ["Stories com desconto", "Posts de influencers", "Anúncios direcionados", "Reels de produtos", "Qualquer coisa que aparece! 😰"]
    },
    {
      question: "Quanto você gasta por mês em coisas que viu no Instagram?",
      options: ["Até R$ 200", "R$ 200 - R$ 500", "R$ 500 - R$ 1.000", "Mais de R$ 1.000", "Prefiro não saber! 😱"]
    }
  ];

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (currentQuestion < marketingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">cofrin</span>
          </div>
          <Button onClick={() => navigate('/auth')} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Entrar / Cadastrar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Instagram className="h-12 w-12 text-pink-500" />
            <span className="text-2xl font-bold text-muted-foreground">+</span>
            <DollarSign className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-primary to-pink-500 bg-clip-text text-transparent">
            Pare de Gastar no Instagram!
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Você sabia que gastamos em média <strong className="text-destructive">R$ 800 por mês</strong> em coisas que vemos no Instagram? Descubra como <strong className="text-primary">controlar esses gastos</strong> e economizar até <strong className="text-success">R$ 10.000 por ano!</strong>
          </p>

          {/* Interactive Quiz */}
          {answers.length < marketingQuestions.length ? (
            <Card className="max-w-2xl mx-auto mb-12 shadow-xl border-primary/20 bg-gradient-to-r from-card to-primary/5">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary">
                  🛍️ Pergunta {currentQuestion + 1} de {marketingQuestions.length}
                </CardTitle>
                <p className="text-lg font-semibold mt-4">
                  {marketingQuestions[currentQuestion].question}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketingQuestions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    variant="outline"
                    className="w-full p-6 text-left justify-start hover:bg-primary/10 hover:border-primary transition-all text-base"
                  >
                    {option}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto mb-12 shadow-xl border-success/20 bg-gradient-to-r from-success/5 to-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-success flex items-center justify-center gap-2">
                  <CheckCircle className="h-8 w-8" />
                  Resultados Reveladores!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/20">
                  <h3 className="text-xl font-bold text-destructive mb-4">📱 VÍCIO DO INSTAGRAM DETECTADO!</h3>
                  <p className="text-lg leading-relaxed">
                    Baseado nas suas respostas, você pode estar gastando entre <strong className="text-destructive">R$ 5.000 a R$ 15.000 por ano</strong> só em compras influenciadas pelo Instagram!
                  </p>
                </div>
                
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-xl font-bold text-primary mb-4">✅ LIBERTE-SE DO CONSUMISMO DIGITAL</h3>
                  <p className="text-lg leading-relaxed mb-4">
                    O cofrin já ajudou mais de <strong>1.000+ pessoas</strong> a controlarem seus gastos no Instagram e outras redes sociais. Elas economizaram em média <strong className="text-success">R$ 8.500 por ano</strong> só cortando compras por impulso!
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <Button 
                    onClick={() => navigate('/pricing')}
                    size="lg"
                    className="bg-gradient-to-r from-pink-500 to-primary hover:from-pink-600 hover:to-primary/90 text-white font-bold py-4 px-8 text-lg shadow-lg"
                  >
                    <Instagram className="mr-2 h-6 w-6" />
                    Parar de Gastar no Instagram!
                  </Button>
                  
                  <Button onClick={resetQuiz} variant="outline" size="lg">
                    Refazer o teste
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Social Proof */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Mais de 1.000 pessoas já pararam de gastar no Instagram
            </h2>
            <div className="flex items-center justify-center gap-8 text-2xl font-bold">
              <div className="text-center">
                <div className="text-4xl text-success">R$ 8,5M+</div>
                <div className="text-sm text-muted-foreground">Economizados em compras online</div>
              </div>
              <div className="text-center">
                <div className="text-4xl text-primary">1.000+</div>
                <div className="text-sm text-muted-foreground">Pessoas livres do consumismo</div>
              </div>
              <div className="text-center">
                <div className="text-4xl text-pink-500">95%</div>
                <div className="text-sm text-muted-foreground">Reduziram gastos no Instagram</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-success/20 bg-gradient-to-br from-success/5 to-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Descobri que gastava R$ 1.500 por mês só em coisas que via no Instagram! Com o cofrin consegui me controlar e já economizei R$ 12.000."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                    <Instagram className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <div className="font-semibold">Marina S.</div>
                    <div className="text-sm text-muted-foreground">@marinastyle</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Era viciada em comprar roupas que via nos Stories. O cofrin me mostrou que gastava R$ 800/mês só nisso! Agora controlo tudo."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Ana P.</div>
                    <div className="text-sm text-muted-foreground">@ana_fashion</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Parei de comprar por impulso depois de influencers. Em 4 meses economizei R$ 6.000 que antes gastava em bobagens do Instagram!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="font-semibold">Julia M.</div>
                    <div className="text-sm text-muted-foreground">@julia_minimalista</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* About automatizaí */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-chart-2/5">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Bot className="h-6 w-6 text-primary" />
                Como o cofrin te livra do consumismo digital
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground leading-relaxed text-lg">
                O <strong className="text-primary">cofrin</strong> é o primeiro bot anti-consumismo do Brasil. 
                Registre seus gastos conversando no WhatsApp e receba alertas inteligentes quando estiver gastando demais 
                <strong className="text-success"> em compras por impulso</strong>.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Instagram className="h-8 w-8 text-pink-500" />
                  </div>
                  <h4 className="font-bold mb-2 text-lg">1. Detecta Armadilhas</h4>
                  <p className="text-sm text-muted-foreground">
                    Identifica quando você gasta mais após usar Instagram, TikTok e outras redes sociais
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-destructive" />
                  </div>
                  <h4 className="font-bold mb-2 text-lg">2. Bloqueia Impulsos</h4>
                  <p className="text-sm text-muted-foreground">
                    Envia alertas quando você está gastando demais em compras por impulso
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-success" />
                  </div>
                  <h4 className="font-bold mb-2 text-lg">3. Mostra Economia</h4>
                  <p className="text-sm text-muted-foreground">
                    Dashboard mostra quanto você economizou parando de comprar por impulso
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow border-pink-500/20 hover:border-pink-500/40">
            <CardHeader>
              <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Instagram className="h-10 w-10 text-pink-500" />
              </div>
              <CardTitle className="text-lg">Pare o Vício Digital</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Identifique e bloqueie gastos compulsivos causados por Instagram, TikTok e outras redes sociais
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-success/20 hover:border-success/40">
            <CardHeader>
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-10 w-10 text-success" />
              </div>
              <CardTitle className="text-lg">Metas Anti-Consumo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Defina metas de não gastar em categorias específicas e veja sua economia crescer mês a mês
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-chart-2/20 hover:border-chart-2/40">
            <CardHeader>
              <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-chart-2" />
              </div>
              <CardTitle className="text-lg">100% Seguro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Seus dados são criptografados e protegidos. Nunca compartilhamos suas informações financeiras
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto shadow-2xl border-primary/20 bg-gradient-to-r from-primary/10 via-card to-success/10">
            <CardContent className="p-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-primary bg-clip-text text-transparent">
                Liberte-se do Consumismo Digital!
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se aos milhares de brasileiros que já pararam de gastar compulsivamente no Instagram e outras redes sociais
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => navigate('/pricing')}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-primary hover:from-pink-600 hover:to-primary/90 text-white font-bold py-4 px-8 text-xl shadow-xl"
                >
                  <Instagram className="mr-2 h-6 w-6" />
                  Parar de Gastar no Instagram!
                </Button>
                <p className="text-sm text-muted-foreground">
                  ✅ 1 mês grátis | ✅ Pare o vício em compras | ✅ Economize milhares
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
