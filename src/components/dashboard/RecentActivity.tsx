
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Filter, CheckCircle2, AlertCircle, FileText, Download } from "lucide-react";

const RecentActivity = () => {
  const recentActivities = [
    { 
      id: 1, 
      type: "upload", 
      title: "patient_data_2024.csv", 
      status: "completed", 
      time: "Il y a 2 minutes",
      size: "2.3 MB"
    },
    { 
      id: 2, 
      type: "analysis", 
      title: "Analyse des données de consultation", 
      status: "processing", 
      time: "Il y a 15 minutes",
      progress: 75
    },
    { 
      id: 3, 
      type: "export", 
      title: "Rapport de validation des données", 
      status: "completed", 
      time: "Il y a 1 heure",
      size: "854 KB"
    },
    { 
      id: 4, 
      type: "sync", 
      title: "Synchronisation base de données", 
      status: "error", 
      time: "Il y a 2 heures",
      error: "Erreur de connexion"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-5 w-5 text-accent" />;
      case "processing": return <Clock className="h-5 w-5 text-primary" />;
      case "error": return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center text-foreground">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Activité récente
          </div>
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
            {getStatusIcon(activity.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
              {activity.status === "processing" && activity.progress && (
                <div className="mt-2">
                  <Progress value={activity.progress} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-1">{activity.progress}% terminé</p>
                </div>
              )}
              {activity.status === "error" && activity.error && (
                <p className="text-xs text-destructive mt-1">{activity.error}</p>
              )}
              {activity.size && (
                <p className="text-xs text-muted-foreground mt-1">{activity.size}</p>
              )}
            </div>
            {activity.status === "completed" && (
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
