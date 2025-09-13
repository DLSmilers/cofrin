import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

export const WhatsAppNotice = () => {
  const [showNotice, setShowNotice] = useState(true);

  // Verifica se o aviso já foi mostrado para o usuário (usando localStorage)
  useEffect(() => {
    const hasSeenNotice = localStorage.getItem('whatsapp-notice-seen');
    if (hasSeenNotice) {
      setShowNotice(false);
    }
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = "5571829998471";
    const message = "Olá! Vim do dashboard financeiro e gostaria de obter ajuda para preencher os dados.";
    
    // Tentar múltiplas abordagens para WhatsApp
    const whatsappUrls = [
      `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
    ];
    
    // Tentar abrir cada URL até uma funcionar
    let opened = false;
    whatsappUrls.forEach((url, index) => {
      if (!opened) {
        try {
          window.open(url, '_blank');
          opened = true;
        } catch (error) {
          console.log(`Tentativa ${index + 1} falhou:`, error);
        }
      }
    });
    
    // Fallback: copiar número para clipboard
    if (!opened) {
      navigator.clipboard.writeText("+55 71 8299-8471").then(() => {
        alert("Número copiado para a área de transferência: +55 71 8299-8471");
      });
    }
  };

  const handleDismiss = () => {
    setShowNotice(false);
    localStorage.setItem('whatsapp-notice-seen', 'true');
  };

  if (!showNotice) return null;

  return (
    <Alert className="border-primary bg-primary/5 relative">
      <MessageCircle className="h-4 w-4" />
      <AlertDescription className="pr-8">
        <div className="space-y-3">
          <p className="font-medium">
            📱 <strong>IMPORTANTE:</strong> Para preencher os dados do seu dashboard financeiro, 
            você precisa adicionar o número do WhatsApp: <span className="font-bold text-primary">+55 71 8299-8471</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato conosco pelo WhatsApp para receber instruções detalhadas sobre como 
            registrar suas transações e aproveitar ao máximo o seu dashboard.
          </p>
          <Button 
            onClick={handleWhatsAppClick}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Falar no WhatsApp
          </Button>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 h-6 w-6 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
};