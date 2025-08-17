import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type TimeFilterType = "day" | "week" | "month" | "custom";

interface TimeFilterProps {
  timeFilter: TimeFilterType;
  onTimeFilterChange: (filter: TimeFilterType) => void;
  customDateRange: { start?: Date; end?: Date };
  onCustomDateRangeChange: (range: { start?: Date; end?: Date }) => void;
}

export const TimeFilter = ({
  timeFilter,
  onTimeFilterChange,
  customDateRange,
  onCustomDateRangeChange,
}: TimeFilterProps) => {
  const filterOptions = [
    { value: "day" as const, label: "Hoje" },
    { value: "week" as const, label: "7 dias" },
    { value: "month" as const, label: "Mês" },
    { value: "custom" as const, label: "Personalizado" },
  ];

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