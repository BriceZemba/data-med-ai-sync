
import { useState } from "react";
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

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user) {
    navigate("/");
    return null;
  }

  const stats = [
    { label: "Fichiers traités", value: "247", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Données validées", value: "98.2%", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Temps économisé", value: "156h", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Précision", value: "99.7%", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" }
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
      color: "from-blue-500 to-blue-600",
      action: () => console.log("Upload file")
    },
    { 
      title: "Générer un rapport", 
      description: "Créez un rapport détaillé de vos données",
      icon: BarChart3,
      color: "from-green-500 to-green-600",
      action: () => console.log("Generate report")
    },
    { 
      title: "Synchroniser les données", 
      description: "Synchronisez avec vos bases existantes",
      icon: Database,
      color: "from-purple-500 to-purple-600",
      action: () => console.log("Sync data")
    },
    { 
      title: "Gestion des utilisateurs", 
      description: "Administrez les accès et permissions",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      action: () => console.log("Manage users")
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "processing": return <Clock className="h-5 w-5 text-blue-500" />;
      case "error": return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="text-sm text-gray-500">
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
                className="text-gray-600 hover:text-red-600"
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
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
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
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-blue-600" />
                  Actions rapides
                </CardTitle>
                <CardDescription>
                  Lancez vos tâches les plus fréquentes en un clic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      onClick={action.action}
                      className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-blue-200"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Activité récente
                  </div>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.status === "processing" && activity.progress && (
                        <div className="mt-2">
                          <Progress value={activity.progress} className="h-1" />
                          <p className="text-xs text-gray-500 mt-1">{activity.progress}% terminé</p>
                        </div>
                      )}
                      {activity.status === "error" && activity.error && (
                        <p className="text-xs text-red-600 mt-1">{activity.error}</p>
                      )}
                      {activity.size && (
                        <p className="text-xs text-gray-500 mt-1">{activity.size}</p>
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
