
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, BarChart3, Database, Users, Plus } from "lucide-react";

interface QuickActionsProps {
  onFileAnalysis: () => void;
  onReportGeneration: () => void;
  isAnalyzing: boolean;
  isGeneratingReport: boolean;
}

const QuickActions = ({ onFileAnalysis, onReportGeneration, isAnalyzing, isGeneratingReport }: QuickActionsProps) => {
  const quickActions = [
    { 
      title: "Analyser un fichier", 
      description: "Uploadez et analysez vos données CSV/Excel",
      icon: Upload,
      color: "from-primary to-primary/80",
      action: onFileAnalysis,
      loading: isAnalyzing
    },
    { 
      title: "Générer un rapport", 
      description: "Créez un rapport détaillé de vos données",
      icon: BarChart3,
      color: "from-accent to-accent/80",
      action: onReportGeneration,
      loading: isGeneratingReport
    },
    { 
      title: "Synchroniser les données", 
      description: "Synchronisez avec vos bases existantes",
      icon: Database,
      color: "from-primary/80 to-primary/60",
      action: () => console.log("Sync data")
    },
    { 
      title: "Gestion des utilisateurs", 
      description: "Administrez les accès et permissions",
      icon: Users,
      color: "from-accent/80 to-accent/60",
      action: () => console.log("Manage users")
    }
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Plus className="h-5 w-5 mr-2 text-primary" />
          Actions rapides
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Lancez vos tâches les plus fréquentes en un clic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.loading ? undefined : action.action}
              className={`p-6 border border-border rounded-xl hover:shadow-md transition-all duration-200 ${
                action.loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              } group hover:border-primary/20`}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
              {action.loading && (
                <div className="mt-2 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  <span className="text-xs text-primary">En cours...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
