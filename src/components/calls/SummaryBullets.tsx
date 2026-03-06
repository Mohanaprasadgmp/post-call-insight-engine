import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, MessageSquare } from "lucide-react";

interface Props {
  summary: [string, string, string];
}

const bullets = [
  { icon: MessageSquare, label: "Issue / Intent", color: "text-blue-500" },
  { icon: CheckCircle, label: "Outcome / Resolution", color: "text-green-500" },
  { icon: AlertTriangle, label: "Flag / Opportunity", color: "text-amber-500" },
];

export function SummaryBullets({ summary }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Call Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bullets.map(({ icon: Icon, label, color }, i) => (
          <div key={i} className="flex gap-3">
            <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${color}`} />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
              <p className="text-sm">{summary[i]}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
