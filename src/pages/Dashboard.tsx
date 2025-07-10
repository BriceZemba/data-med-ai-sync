
import { useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Database,
  Users,
  Settings,
  LogOut,
  Plus,
  Filter,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    navigate("/");
    return null;
  }

  const handleFileAnalysis = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate file analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Analyse terminée",
        description: `Le fichier ${file.name} a été analysé avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'analyse",
        description: "Une erreur s'est produite lors de l'analyse du fichier.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReportGeneration = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rapport généré",
        description: "Votre rapport détaillé a été créé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Une erreur s'est produite lors de la génération du rapport.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const stats = [
    { label: "Fichiers traités", value: "247", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { label: "Données validées", value: "98.2%", icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
    { label: "Temps économisé", value: "156h", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
    { label: "Précision", value: "99.7%", icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" }
  ];

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

  const quickActions = [
    { 
      title: "Analyser un fichier", 
      description: "Uploadez et analysez vos données CSV/Excel",
      icon: Upload,
      color: "from-primary to-primary/80",
      action: handleFileAnalysis,
      loading: isAnalyzing
    },
    { 
      title: "Générer un rapport", 
      description: "Créez un rapport détaillé de vos données",
      icon: BarChart3,
      color: "from-accent to-accent/80",
      action: handleReportGeneration,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-5 w-5 text-accent" />;
      case "processing": return <Clock className="h-5 w-5 text-primary" />;
      case "error": return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <div className="text-sm text-muted-foreground">
                Bienvenue, {user.firstName || user.emailAddresses[0].emailAddress}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate("/")}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => signOut(() => navigate("/"))}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
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
          </div>

          {/* Recent Activity */}
          <div>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
