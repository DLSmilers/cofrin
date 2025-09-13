import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";

interface EmailConfirmationDialogProps {
  email: string;
  onBackToLogin: () => void;
}

export const EmailConfirmationDialog = ({ email, onBackToLogin }: EmailConfirmationDialogProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 flex items-center justify-center py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-800">Conta Criada com Sucesso!</CardTitle>
              <CardDescription className="text-center">
                Falta apenas um passo para começar seu teste gratuito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Mail className="h-16 w-16 text-blue-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Confirme seu email</h3>
                  <p className="text-muted-foreground">
                    Enviamos um link de confirmação para:
                  </p>
                  <p className="font-semibold text-primary">{email}</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Clique no link do email</strong> para ativar sua conta e começar seu teste gratuito de 30 dias.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={onBackToLogin}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Login
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Não recebeu o email? Verifique sua pasta de spam ou tente novamente em alguns minutos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};