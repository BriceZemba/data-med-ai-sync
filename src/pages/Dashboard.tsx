import { useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { 
  analyzeFile, 
  cleanData, 
  extractClientData, 
  generateDetailedReport, 
  downloadReport,
  FileAnalysisResult,
  DetailedReport 
} from "@/utils/fileAnalysis";
import { saveMedecinDataWithUpsert, saveFile, UpsertConfig } from "@/integrations/supabase/db";

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // États pour le workflow séparé
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // États pour les données
  const [analysisResult, setAnalysisResult] = useState<FileAnalysisResult | null>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedReport | null>(null);
  const [isReadyForSync, setIsReadyForSync] = useState(false);
  
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
    setIsReadyForSync(false);
    setAnalysisResult(null);
    setDetailedReport(null);
    
    try {
      toast({
        title: "Analyse du fichier",
        description: `Analyse du fichier ${file.name} en cours...`,
      });

      // Étape 1: Analyser le fichier
      let result = await analyzeFile(file);
      
      toast({
        title: "Nettoyage des données",
        description: "Nettoyage automatique des données en cours...",
      });

      // Étape 2: Nettoyer les données si nécessaire
      if (!result.isWellStructured || !result.isCleaned) {
        result = await cleanData(result);
      }

      // Étape 3: Générer le rapport détaillé
      const report = generateDetailedReport(result);
      
      // Sauvegarder les résultats
      setAnalysisResult(result);
      setDetailedReport(report);
      setIsReadyForSync(true);
      
      // Sauvegarder pour la génération de rapport
      localStorage.setItem('analysisResult', JSON.stringify(result));
      localStorage.setItem('detailedReport', JSON.stringify(report));

      toast({
        title: "Analyse terminée",
        description: `Fichier analysé avec succès. ${report.summary.fixesApplied} corrections appliquées. Prêt pour la synchronisation.`,
      });
      
    } catch (error) {
      toast({
        title: "Erreur d'analyse",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de l'analyse du fichier.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSynchronization = async () => {
    if (!analysisResult || !isReadyForSync) {
      toast({
        title: "Analyse requise",
        description: "Veuillez d'abord analyser un fichier avant la synchronisation.",
        variant: "destructive",
      });
      return;
    }

    setIsSynchronizing(true);
    
    try {
      toast({
        title: "Synchronisation",
        description: "Synchronisation des données vers la base de données...",
      });

      // Extraire les données client nettoyées
      const clientData = await extractClientData(analysisResult);

      // Sauvegarder le fichier dans Supabase Storage
      const cleanedDataBlob = new Blob([JSON.stringify(analysisResult.data, null, 2)], {
        type: 'application/json'
      });
      const cleanedFile = new File([cleanedDataBlob], `cleaned_${analysisResult.fileName}`, {
        type: 'application/json'
      });
      
      const fileId = await saveFile(user.id, cleanedFile);

      // Configuration d'upsert
      const upsertConfig: UpsertConfig = {
        uniqueKeys: ['Nom', 'Prénom', 'VILLE'],
        conflictStrategy: 'update',
        updateColumns: ['SECT ACT', 'Semaine', 'STRUCTURE', 'Nom du compte', 'SPECIALITE', 'POTENTIEL', 'ADRESSE'],
        shouldUpdate: (existing: any, incoming: any) => {
          // Logique pour déterminer si une mise à jour est nécessaire
          const existingCompleteness = calculateDataCompleteness(existing);
          const incomingCompleteness = calculateDataCompleteness(incoming);
          return incomingCompleteness >= existingCompleteness;
        }
      };

      // Synchroniser avec la base de données
      const upsertResult = await saveMedecinDataWithUpsert(fileId, analysisResult.data, upsertConfig);

      toast({
        title: "Synchronisation réussie",
        description: `${upsertResult.inserted + upsertResult.updated} enregistrement(s) synchronisé(s). ${upsertResult.inserted} nouveaux, ${upsertResult.updated} mis à jour, ${upsertResult.skipped} ignorés.`,
      });

      // Réinitialiser l'état après synchronisation réussie
      setIsReadyForSync(false);
      
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de la synchronisation.",
        variant: "destructive",
      });
    } finally {
      setIsSynchronizing(false);
    }
  };

  const calculateDataCompleteness = (record: any): number => {
    const fields = ['Nom', 'Prénom', 'SECT ACT', 'Semaine', 'STRUCTURE', 'Nom du compte', 'SPECIALITE', 'POTENTIEL', 'VILLE', 'ADRESSE'];
    let completedFields = 0;
    
    fields.forEach(field => {
      const value = record[field];
      if (value && value !== '' && value !== 'Non renseigné' && value !== null) {
        completedFields++;
      }
    });
    
    return completedFields / fields.length;
  };

  const handleReportGeneration = async () => {
    if (!detailedReport) {
      toast({
        title: "Aucun rapport trouvé",
        description: "Veuillez d'abord analyser un fichier avant de générer un rapport.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingReport(true);
    
    try {
      toast({
        title: "Génération du rapport",
        description: "Préparation du rapport détaillé...",
      });

      // Simuler un délai de génération
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Télécharger le rapport
      downloadReport(detailedReport, 'html');
      
      toast({
        title: "Rapport généré",
        description: "Le rapport détaillé a été téléchargé avec succès.",
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

  const handleViewReport = () => {
    if (!detailedReport) {
      toast({
        title: "Aucun rapport trouvé",
        description: "Veuillez d'abord analyser un fichier.",
        variant: "destructive",
      });
      return;
    }

    navigate("/report", { 
      state: { 
        reportData: analysisResult,
        detailedReport: detailedReport 
      } 
    });
  };
  
  const userName = user.firstName || user.emailAddresses[0].emailAddress;

  return (
    <div className="min-h-screen bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <DashboardHeader userName={userName} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats />
        
        {/* Section d'état du workflow */}
        {(analysisResult || isAnalyzing) && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">État du Workflow</h3>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${isAnalyzing ? 'text-blue-600' : analysisResult ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-blue-600 animate-pulse' : analysisResult ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                <span>Analyse</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center space-x-2 ${isSynchronizing ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${isSynchronizing ? 'bg-blue-600 animate-pulse' : isReadyForSync ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                <span>Synchronisation</span>
              </div>
            </div>
            
            {analysisResult && detailedReport && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Résumé de l'analyse:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Lignes totales:</span>
                    <span className="ml-2 font-medium">{detailedReport.summary.totalRows}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Lignes nettoyées:</span>
                    <span className="ml-2 font-medium">{detailedReport.summary.cleanedRows}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Problèmes trouvés:</span>
                    <span className="ml-2 font-medium">{detailedReport.summary.issuesFound}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Corrections appliquées:</span>
                    <span className="ml-2 font-medium">{detailedReport.summary.fixesApplied}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <QuickActions
              onFileAnalysis={handleFileAnalysis}
              onSynchronization={handleSynchronization}
              onReportGeneration={handleReportGeneration}
              onViewReport={handleViewReport}
              isAnalyzing={isAnalyzing}
              isSynchronizing={isSynchronizing}
              isGeneratingReport={isGeneratingReport}
              isReadyForSync={isReadyForSync}
              hasAnalysisResult={!!analysisResult}
            />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

