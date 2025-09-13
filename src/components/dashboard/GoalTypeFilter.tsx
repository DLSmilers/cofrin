import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Calendar } from "lucide-react";

export type GoalType = "mensal" | "semanal";

interface GoalTypeFilterProps {
  selectedType: GoalType;
  onTypeChange: (type: GoalType) => void;
}

export const GoalTypeFilter = ({ selectedType, onTypeChange }: GoalTypeFilterProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tipo de Meta
          </h3>
          <div className="flex gap-2">
            <Button
              variant={selectedType === "mensal" ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange("mensal")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Mensal
            </Button>
            <Button
              variant={selectedType === "semanal" ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange("semanal")}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Semanal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};