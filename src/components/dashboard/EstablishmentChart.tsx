import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Building2 } from "lucide-react";

interface Transaction {
  id: number;
  valor: number;
  tipo: string;
  estabelecimento: string;
}

interface EstablishmentChartProps {
  transactions: Transaction[];
}

export const EstablishmentChart = ({ transactions }: EstablishmentChartProps) => {
  const processChartData = () => {
    const establishmentMap = new Map<string, { gastos: number; rendimentos: number }>();

    transactions.forEach((transaction) => {
      const establishment = transaction.estabelecimento || "Não informado";

      if (!establishmentMap.has(establishment)) {
        establishmentMap.set(establishment, { gastos: 0, rendimentos: 0 });
      }

      const data = establishmentMap.get(establishment)!;
      if (transaction.tipo === "gasto") {
        data.gastos += transaction.valor;
      } else if (transaction.tipo === "rendimento") {
        data.rendimentos += transaction.valor;
      }
    });

    return Array.from(establishmentMap.entries())
      .map(([establishment, values]) => ({
        estabelecimento: establishment,
        gastos: values.gastos,
        rendimentos: values.rendimentos,
        total: values.gastos + values.rendimentos,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Transações por Estabelecimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <XAxis
                  dataKey="estabelecimento"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
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
                <Bar
                  dataKey="gastos"
                  stackId="a"
                  fill="var(--color-gastos)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="rendimentos"
                  stackId="a"
                  fill="var(--color-rendimentos)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Nenhuma transação encontrada para o período selecionado
          </div>
        )}
      </CardContent>
    </Card>
  );
};