import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Shield, Bot, Zap, MessageSquare, DollarSign, Target, ArrowRight, CheckCircle, Users, Star } from "lucide-react";
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
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
            Pare de Sangrar Dinheiro!
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Descubra para onde seu dinheiro está indo e <strong className="text-primary">recupere até R$ 10.000 por ano</strong> que você nem sabia que estava perdendo
          </p>

          {/* Interactive Quiz */}
          {answers.length < marketingQuestions.length ? (
            <Card className="max-w-2xl mx-auto mb-12 shadow-xl border-primary/20 bg-gradient-to-r from-card to-primary/5">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary">
                  🎯 Pergunta {currentQuestion + 1} de {marketingQuestions.length}
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
                <div className="bg-warning/10 p-6 rounded-lg border border-warning/20">
                  <h3 className="text-xl font-bold text-warning mb-4">🚨 ALERTA FINANCEIRO</h3>
                  <p className="text-lg leading-relaxed">
                    Baseado nas suas respostas, você pode estar perdendo entre <strong className="text-destructive">R$ 3.000 a R$ 15.000 por ano</strong> sem nem perceber!
                  </p>
                </div>
                
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-xl font-bold text-primary mb-4">✅ A SOLUÇÃO ESTÁ AQUI</h3>
                  <p className="text-lg leading-relaxed mb-4">
                    A cofrin já ajudou mais de <strong>1.000+ pessoas</strong> a recuperarem o controle das suas finanças e economizaram em média <strong className="text-success">R$ 8.500 por ano</strong>!
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <Button 
                    onClick={() => navigate('/pricing')}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white font-bold py-4 px-8 text-lg shadow-lg"
                  >
                    <Target className="mr-2 h-6 w-6" />
                    Ver Planos - 1 Mês Grátis!
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
              Mais de 1.000 pessoas já transformaram suas finanças
            </h2>
            <div className="flex items-center justify-center gap-8 text-2xl font-bold">
              <div className="text-center">
                <div className="text-4xl text-success">R$ 8,5M+</div>
                <div className="text-sm text-muted-foreground">Economizados pelos usuários</div>
              </div>
              <div className="text-center">
                <div className="text-4xl text-primary">1.000+</div>
                <div className="text-sm text-muted-foreground">Vidas transformadas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl text-warning">4.9⭐</div>
                <div className="text-sm text-muted-foreground">Avaliação média</div>
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
                  "Descobri que estava gastando R$ 1.200 por mês em coisas desnecessárias. Em 6 meses já economizei R$ 7.200!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Marina S.</div>
                    <div className="text-sm text-muted-foreground">Empresária</div>
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
                  "Nunca pensei que controlar finanças fosse tão fácil! O bot é como ter um consultor financeiro no WhatsApp."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-chart-2/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <div className="font-semibold">Carlos R.</div>
                    <div className="text-sm text-muted-foreground">Advogado</div>
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
                  "Em 3 meses criei uma reserva de emergência de R$ 15.000. O cofrin mudou minha relação com o dinheiro!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="font-semibold">Ana P.</div>
                    <div className="text-sm text-muted-foreground">Médica</div>
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
                Como o cofrin funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground leading-relaxed text-lg">
                A <strong className="text-primary">cofrin</strong> é o primeiro bot financeiro inteligente do Brasil. 
                Registre suas transações conversando naturalmente no WhatsApp e tenha acesso a análises que vão 
                <strong className="text-success"> transformar sua vida financeira</strong>.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-bold mb-2 text-lg">1. Converse Natural</h4>
                  <p className="text-sm text-muted-foreground">
                    "Gastei R$ 45 no almoço" e pronto! O bot entende e categoriza automaticamente
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-chart-2" />
                  </div>
                  <h4 className="font-bold mb-2 text-lg">2. IA Analisa Tudo</h4>
                  <p className="text-sm text-muted-foreground">
                    Inteligência artificial identifica padrões e vazamentos de dinheiro
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-success" />
                  </div>
                  <h4 className="font-bold mb-2 text-lg">3. Dashboard Poderoso</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualize exatamente para onde vai seu dinheiro e como economizar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-success/20 hover:border-success/40">
            <CardHeader>
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-10 w-10 text-success" />
              </div>
              <CardTitle className="text-lg">Economize Mais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Identifique gastos desnecessários e economize até R$ 10.000 por ano com insights inteligentes
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-lg">Atinja suas Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Defina objetivos financeiros e acompanhe seu progresso com alertas e dicas personalizadas
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Pare de Perder Dinheiro Hoje!
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se aos milhares de brasileiros que já descobriram onde estava o vazamento do seu dinheiro
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => navigate('/pricing')}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white font-bold py-4 px-8 text-xl shadow-xl"
                >
                  <ArrowRight className="mr-2 h-6 w-6" />
                  Ver Planos - 1 Mês Grátis!
                </Button>
                <p className="text-sm text-muted-foreground">
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
