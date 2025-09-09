import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type TimeFilterType = "day" | "week" | "month" | "custom" | "specific-month";

interface TimeFilterProps {
  timeFilter: TimeFilterType;
  onTimeFilterChange: (filter: TimeFilterType) => void;
  customDateRange: { start?: Date; end?: Date };
  onCustomDateRangeChange: (range: { start?: Date; end?: Date }) => void;
  selectedMonth?: Date;
  onMonthChange?: (month: Date) => void;
}

export const TimeFilter = ({
  timeFilter,
  onTimeFilterChange,
  customDateRange,
  onCustomDateRangeChange,
  selectedMonth,
  onMonthChange,
}: TimeFilterProps) => {
  const filterOptions = [
    { value: "day" as const, label: "Hoje" },
    { value: "week" as const, label: "7 dias" },
    { value: "month" as const, label: "Mês" },
    { value: "custom" as const, label: "Personalizado" },
  ];

  const generateMonthOptions = () => {
    const currentDate = new Date();
    const months = [];
    
    // Add 2 previous months
    for (let i = 2; i >= 1; i--) {
      months.push(subMonths(currentDate, i));
    }
    
    // Add current month
    months.push(currentDate);
    
    // Add 2 next months
    for (let i = 1; i <= 2; i++) {
      months.push(addMonths(currentDate, i));
    }
    
    return months;
  };

  const monthOptions = generateMonthOptions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Filtro de Período
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeFilterChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {timeFilter === "month" && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Selecionar mês:</p>
            <div className="flex flex-wrap gap-2">
              {monthOptions.map((month, index) => {
                const isCurrentMonth = index === 2; // Current month is at index 2
                const isSelected = selectedMonth && 
                  month.getMonth() === selectedMonth.getMonth() && 
                  month.getFullYear() === selectedMonth.getFullYear();
                
                return (
                  <Button
                    key={month.toISOString()}
                    variant={isSelected ? "default" : isCurrentMonth ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      onMonthChange?.(month);
                      onTimeFilterChange("specific-month");
                    }}
                    className={cn(
                      isCurrentMonth && !isSelected && "ring-2 ring-primary/20"
                    )}
                  >
                    {format(month, "MMM/yyyy", { locale: ptBR })}
                    {isCurrentMonth && " (atual)"}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {timeFilter === "custom" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !customDateRange.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange.start ? (
                    format(customDateRange.start, "PPP", { locale: ptBR })
                  ) : (
                    "Data inicial"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customDateRange.start}
                  onSelect={(date) =>
                    onCustomDateRangeChange({ ...customDateRange, start: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !customDateRange.end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange.end ? (
                    format(customDateRange.end, "PPP", { locale: ptBR })
                  ) : (
                    "Data final"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customDateRange.end}
                  onSelect={(date) =>
                    onCustomDateRangeChange({ ...customDateRange, end: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardContent>
    </Card>
  );
};