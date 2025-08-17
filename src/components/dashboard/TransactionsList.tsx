import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: number;
  valor: number;
  user: string;
  estabelecimento: string;
  detalhes: string;
  tipo: string;
  categoria: string;
  created_at: string;
  quando: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
}

export const TransactionsList = ({ transactions }: TransactionsListProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="h-80 sm:h-96">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Todas as Transações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 sm:h-80">
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação encontrada no período selecionado
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium leading-none text-sm sm:text-base">
                        {transaction.estabelecimento}
                      </p>
                      <Badge
                        variant={transaction.tipo === "receita" ? "default" : "secondary"}
                        className={`text-xs ${
                          transaction.tipo === "receita"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        }`}
                      >
                        {transaction.tipo === "receita" ? "Receita" : "Despesa"}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {transaction.detalhes}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                      <span>{transaction.categoria}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.quando || transaction.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold text-sm sm:text-base ${
                        transaction.tipo === "receita"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.tipo === "receita" ? "+" : "-"}
                      {formatCurrency(transaction.valor)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};