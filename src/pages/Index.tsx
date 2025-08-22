import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Shield, Bot, Zap, MessageSquare, DollarSign, Target, ArrowRight, CheckCircle, Smartphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const marketingQuestions = [
    {
      question: "Quanto você gasta por mês sem nem perceber?",
      options: ["Menos de R$ 200", "R$ 200 - R$ 500", "R$ 500 - R$ 1.000", "Mais de R$ 1.000", "Não faço ideia! 😱"]
    },
    {
      question: "Qual é o seu maior pesadelo financeiro?",
      options: ["Não conseguir pagar as contas", "Não ter dinheiro para emergências", "Não saber para onde vai o dinheiro", "Não conseguir guardar nada", "Todos os acima! 😰"]
    },
    {
      question: "O que você faria com R$ 10.000 extras por ano?",
      options: ["Viagem dos sonhos", "Reserva de emergência", "Investir no futuro", "Quitar dívidas", "Gastaria tudo rapidinho 😅"]
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
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent px-2">
            Pare de Sangrar Dinheiro!
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
            Descubra para onde seu dinheiro está indo e <strong className="text-primary">recupere milhares por ano</strong> que você nem sabia que estava perdendo
          </p>

          {/* Interactive Quiz */}
          {answers.length < marketingQuestions.length ? (
            <Card className="max-w-2xl mx-auto mb-8 sm:mb-12 shadow-xl border-primary/20 bg-gradient-to-r from-card to-primary/5 mx-4">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-primary">
                  🎯 Pergunta {currentQuestion + 1} de {marketingQuestions.length}
                </CardTitle>
                <p className="text-base sm:text-lg font-semibold mt-4">
                  {marketingQuestions[currentQuestion].question}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                {marketingQuestions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    variant="outline"
                    className="w-full p-4 sm:p-6 text-left justify-start hover:bg-primary/10 hover:border-primary transition-all text-sm sm:text-base"
                  >
                    {option}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto mb-8 sm:mb-12 shadow-xl border-success/20 bg-gradient-to-r from-success/5 to-card mx-4">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-success flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                  Hora de Agir!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 text-center p-4 sm:p-6">
                <div className="bg-warning/10 p-4 sm:p-6 rounded-lg border border-warning/20">
                  <h3 className="text-lg sm:text-xl font-bold text-warning mb-3 sm:mb-4">🚨 PARE O VAZAMENTO</h3>
                  <p className="text-base sm:text-lg leading-relaxed">
                    Você pode estar perdendo <strong className="text-destructive">milhares por ano</strong> sem nem perceber!
                  </p>
                </div>
                
                <div className="bg-primary/10 p-4 sm:p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">✅ VEJA COMO O DASHBOARD FUNCIONA</h3>
                  <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed border-primary/30 mb-4">
                    <Smartphone className="h-12 w-12 mx-auto text-primary/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Imagem do dashboard será exibida aqui
                    </p>
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed">
                    Veja exatamente para onde vai cada centavo e tome decisões inteligentes sobre seu dinheiro!
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                  <Button 
                    onClick={() => navigate('/pricing')}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg shadow-lg"
                  >
                    <Target className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                    Ver Planos - 1 Mês Grátis!
                  </Button>
                  
                  <Button onClick={resetQuiz} variant="outline" size="lg" className="py-3 sm:py-4">
                    Refazer o teste
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Product Demo */}
        <div className="mb-8 sm:mb-16 px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-primary">
              Controle Total das Suas Finanças
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Veja como o cofrin organiza e analisa seus gastos de forma inteligente
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-16 px-4">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-chart-2/5">
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Como o cofrin funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4 sm:space-y-6 p-4 sm:p-6">
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                A <strong className="text-primary">cofrin</strong> é um bot financeiro inteligente. 
                Registre suas transações conversando naturalmente no WhatsApp e tenha acesso a análises que vão 
                <strong className="text-success"> transformar sua vida financeira</strong>.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h4 className="font-bold mb-2 text-base sm:text-lg">1. Converse Natural</h4>
                  <p className="text-sm text-muted-foreground">
                    "Gastei R$ 45 no almoço" e pronto! O bot entende e categoriza automaticamente
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-chart-2" />
                  </div>
                  <h4 className="font-bold mb-2 text-base sm:text-lg">2. IA Analisa Tudo</h4>
                  <p className="text-sm text-muted-foreground">
                    Inteligência artificial identifica padrões e vazamentos de dinheiro
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
                  </div>
                  <h4 className="font-bold mb-2 text-base sm:text-lg">3. Dashboard Poderoso</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualize exatamente para onde vai seu dinheiro e como economizar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-16 px-4">
          <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow border-success/20 hover:border-success/40">
            <CardHeader className="p-2 sm:p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <DollarSign className="h-6 w-6 sm:h-10 sm:w-10 text-success" />
              </div>
              <CardTitle className="text-base sm:text-lg">Economize Mais</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <p className="text-muted-foreground text-xs sm:text-sm">
                Identifique gastos desnecessários e economize milhares por ano com insights inteligentes
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow border-primary/20 hover:border-primary/40">
            <CardHeader className="p-2 sm:p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Target className="h-6 w-6 sm:h-10 sm:w-10 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Atinja suas Metas</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <p className="text-muted-foreground text-xs sm:text-sm">
                Defina objetivos financeiros e acompanhe seu progresso com alertas e dicas personalizadas
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow border-chart-2/20 hover:border-chart-2/40 sm:col-span-2 lg:col-span-1">
            <CardHeader className="p-2 sm:p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-6 w-6 sm:h-10 sm:w-10 text-chart-2" />
              </div>
              <CardTitle className="text-base sm:text-lg">100% Seguro</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <p className="text-muted-foreground text-xs sm:text-sm">
                Seus dados são criptografados e protegidos. Nunca compartilhamos suas informações financeiras
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="text-center px-4">
          <Card className="max-w-4xl mx-auto shadow-2xl border-primary/20 bg-gradient-to-r from-primary/10 via-card to-success/10">
            <CardContent className="p-6 sm:p-8 lg:p-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Pare de Perder Dinheiro Hoje!
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                Descubra onde está o vazamento do seu dinheiro e tome o controle das suas finanças
              </p>
              <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center">
                <Button 
                  onClick={() => navigate('/pricing')}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg lg:text-xl shadow-xl w-full sm:w-auto"
                >
                  <ArrowRight className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  Ver Planos - 1 Mês Grátis!
                </Button>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  ✅ 1 mês grátis | ✅ Sem cartão de crédito | ✅ Cancele quando quiser
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
