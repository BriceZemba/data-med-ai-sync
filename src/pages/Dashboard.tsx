
import { useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const userName = user.firstName || user.emailAddresses[0].emailAddress;

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

      <DashboardHeader userName={userName} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <QuickActions
              onFileAnalysis={handleFileAnalysis}
              onReportGeneration={handleReportGeneration}
              isAnalyzing={isAnalyzing}
              isGeneratingReport={isGeneratingReport}
            />
          </div>

          {/* Recent Activity */}
          <div>
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
