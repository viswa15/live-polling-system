import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { CheckCircle2 } from "lucide-react";

const PollResults = ({ results }) => {
  const total = results.totalSubmissions;
  const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Total Responses: {total}
      </div>

      {results.options.map((option, index) => {
        const count = results.results[option.id] || 0;
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        const isCorrect = option.id === results.correctOptionId;

        return (
          <Card key={option.id} className={`p-4 bg-muted/30 transition-all ${isCorrect ? 'ring-2 ring-green-500' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">{String.fromCharCode(65 + index)}.</span>
                <span className="font-medium text-foreground">{option.text}</span>
                {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {count} vote{count !== 1 ? 's' : ''}
                </span>
                <span className="text-sm font-bold text-primary">
                  {percentage}%
                </span>
              </div>
            </div>
            <Progress
              value={parseFloat(percentage)}
              className="h-3"
              indicatorClassName={colors[index % colors.length]}
            />
          </Card>
        );
      })}
    </div>
  );
};

export default PollResults;