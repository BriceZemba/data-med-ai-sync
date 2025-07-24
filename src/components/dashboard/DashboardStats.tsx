
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock, TrendingUp } from "lucide-react";


const DashboardStats = () => {
  const stats = [
    { label: "Fichiers traités", value: "247", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { label: "Données validées", value: "98.2%", icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
    { label: "Temps économisé", value: "156h", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
    { label: "Précision", value: "99.7%", icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
