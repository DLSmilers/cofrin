import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, parseISO, startOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: number;
  valor: number;
  tipo: string;
  created_at: string;
  quando: string;
}

interface ExpenseChartProps {
  transactions: Transaction[];
}

export const ExpenseChart = ({ transactions }: ExpenseChartProps) => {
  const processChartData = () => {
    const dataMap = new Map<string, { gastos: number; rendimentos: number }>();

    transactions.forEach((transaction) => {
      const date = startOfDay(new Date(transaction.quando || transaction.created_at));
      const dateKey = format(date, "yyyy-MM-dd");

      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { gastos: 0, rendimentos: 0 });
      }

      const data = dataMap.get(dateKey)!;
      if (transaction.tipo === "gasto") {
        data.gastos += transaction.valor;
      } else if (transaction.tipo === "rendimento") {
        data.rendimentos += transaction.valor;
      }
    });

    return Array.from(dataMap.entries())
      .map(([date, values]) => ({
        date,
        displayDate: format(parseISO(date), "dd/MM", { locale: ptBR }),
        gastos: values.gastos,
        rendimentos: values.rendimentos,
        saldo: values.rendimentos - values.gastos,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Últimos 30 dias
  };

  const chartData = processChartData();

  const chartConfig = {
    gastos: {
      label: "Gastos",
      color: "hsl(var(--destructive))",
    },
    rendimentos: {
      label: "Rendimentos",
      color: "hsl(var(--success))",
    },
    saldo: {
      label: "Saldo",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução Temporal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                  }).format(value)
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(value as number),
                      name,
                    ]}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="gastos"
                stroke="var(--color-gastos)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="rendimentos"
                stroke="var(--color-rendimentos)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="var(--color-saldo)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};