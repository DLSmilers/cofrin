import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format, isAfter, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AddParceledPaymentDialog } from './AddParceledPaymentDialog';

interface ParceledPayment {
  id: string;
  user_whatsapp: string;
  descricao: string;
  categoria: string;
  estabelecimento: string;
  valor_total: number;
  valor_parcela: number;
  total_parcelas: number;
  parcela_atual: number;
  data_vencimento: string;
  status: 'pendente' | 'paga' | 'atrasada';
  transacao_id?: number;
  created_at: string;
}

interface ParceledPaymentsListProps {
  userWhatsapp: string;
}

export const ParceledPaymentsList: React.FC<ParceledPaymentsListProps> = ({ userWhatsapp }) => {
  const [payments, setPayments] = useState<ParceledPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParceledPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('pagamentos_parcelados')
        .select('*')
        .eq('user_whatsapp', userWhatsapp)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      setPayments((data || []) as ParceledPayment[]);
    } catch (error) {
      console.error('Erro ao buscar pagamentos parcelados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos parcelados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParceledPayments();
  }, [userWhatsapp]);

  const markAsPaid = async (paymentId: string, valorParcela: number, descricao: string, categoria: string, estabelecimento: string) => {
    try {
      // Criar transação correspondente
      const { data: transactionData, error: transactionError } = await supabase
        .from('transacoes')
        .insert({
          user_whatsapp: userWhatsapp,
          valor: valorParcela,
          estabelecimento,
          detalhes: `Pagamento de parcela - ${descricao}`,
          tipo: 'despesa',
          categoria,
          quando: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Atualizar status da parcela
      const { error: updateError } = await supabase
        .from('pagamentos_parcelados')
        .update({ 
          status: 'paga',
          transacao_id: transactionData.id
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Parcela marcada como paga e transação criada",
      });

      fetchParceledPayments();
    } catch (error) {
      console.error('Erro ao marcar parcela como paga:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a parcela como paga",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (payment: ParceledPayment) => {
    const vencimento = new Date(payment.data_vencimento);
    const hoje = new Date();
    
    if (payment.status === 'paga') {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Paga</Badge>;
    }
    
    if (isAfter(hoje, vencimento)) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Atrasada</Badge>;
    }
    
    if (isToday(vencimento)) {
      return <Badge variant="secondary" className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Vence Hoje</Badge>;
    }
    
    return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
  };

  const groupedPayments = payments.reduce((acc, payment) => {
    const key = `${payment.descricao}-${payment.valor_total}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(payment);
    return acc;
  }, {} as Record<string, ParceledPayment[]>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagamentos Parcelados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagamentos Parcelados
        </CardTitle>
        <AddParceledPaymentDialog 
          userWhatsapp={userWhatsapp} 
          onPaymentAdded={fetchParceledPayments}
        />
      </CardHeader>
      <CardContent>
        {Object.keys(groupedPayments).length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhum pagamento parcelado encontrado
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPayments).map(([key, paymentGroup]) => {
              const firstPayment = paymentGroup[0];
              const parcelas = paymentGroup.sort((a, b) => a.parcela_atual - b.parcela_atual);
              
              return (
                <div key={key} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{firstPayment.descricao}</h3>
                      <p className="text-muted-foreground">{firstPayment.estabelecimento}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Total: R$ {firstPayment.valor_total.toFixed(2)}
                        </span>
                        <Badge variant="outline">{firstPayment.categoria}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    {parcelas.map((parcela) => (
                      <div key={parcela.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {parcela.parcela_atual}ª/{parcela.total_parcelas}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(parcela.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <span className="font-semibold">
                            R$ {parcela.valor_parcela.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(parcela)}
                          {parcela.status === 'pendente' && (
                            <Button
                              size="sm"
                              onClick={() => markAsPaid(
                                parcela.id, 
                                parcela.valor_parcela, 
                                parcela.descricao,
                                parcela.categoria,
                                parcela.estabelecimento
                              )}
                            >
                              Marcar como Paga
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};