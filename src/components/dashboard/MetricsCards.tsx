import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

interface Transaction {
  id: number;
  valor: number;
  tipo: string;
  user_whatsapp: string;
}

interface MetricsCardsProps {
  transactions: Transaction[];
}

export const MetricsCards = ({ transactions }: MetricsCardsProps) => {
  const totalRendimentos = transactions
    .filter((t) => t.tipo === "receita")
    .reduce((sum, t) => sum + t.valor, 0);

  const totalGastos = transactions
    .filter((t) => t.tipo === "despesa")
    .reduce((sum, t) => sum + t.valor, 0);

  const saldo = totalRendimentos - totalGastos;
  const totalTransacoes = transactions.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 sm:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Rendimentos</CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-success">
            {formatCurrency(totalRendimentos)}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">Entradas no período</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Gastos</CardTitle>
          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-destructive">
            {formatCurrency(totalGastos)}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">Saídas no período</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Saldo</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-chart-2" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className={`text-lg sm:text-2xl font-bold ${saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(saldo)}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">Rendimentos - Gastos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Transações</CardTitle>
          <PieChart className="h-3 w-3 sm:h-4 sm:w-4 text-chart-3" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-chart-3">
            {totalTransacoes}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">Total no período</p>
        </CardContent>
      </Card>
    </div>
  );
};