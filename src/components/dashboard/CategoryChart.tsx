import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface Transaction {
  id: number;
  valor: number;
  tipo: string;
  categoria: string;
}

interface CategoryChartProps {
  transactions: Transaction[];
}

export const CategoryChart = ({ transactions }: CategoryChartProps) => {
  const processChartData = () => {
    const categoryMap = new Map<string, number>();

    transactions
      .filter((t) => t.tipo === "despesa")
      .forEach((transaction) => {
        const category = transaction.categoria || "Sem categoria";
        categoryMap.set(category, (categoryMap.get(category) || 0) + transaction.valor);
      });

    return Array.from(categoryMap.entries())
      .map(([category, value]) => ({
        name: category,
        value,
        percentage: 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const chartData = processChartData();
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Calcular percentuais
  chartData.forEach((item) => {
    item.percentage = total > 0 ? (item.value / total) * 100 : 0;
  });

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--destructive))",
    "hsl(var(--warning))",
    "hsl(var(--info))",
  ];

  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.name] = {
      label: item.name,
      color: colors[index % colors.length],
    };
    return config;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Gastos por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden p-3 sm:p-6">
        {chartData.length > 0 ? (
          <div className="w-full overflow-hidden">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={30}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        `${new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value as number)} (${(
                          ((value as number) / total) *
                          100
                        ).toFixed(1)}%)`,
                        name,
                      ]}
                    />
                  }
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value} ({((entry.payload?.value / total) * 100).toFixed(1)}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          </div>
        ) : (
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <PieChartIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhum gasto encontrado</p>
              <p className="text-sm text-muted-foreground">O gráfico por categoria aparecerá quando houver despesas</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};