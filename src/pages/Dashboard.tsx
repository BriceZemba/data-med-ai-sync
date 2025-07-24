// src/pages/Dashboard.tsx
import { useState, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';

import { createSupabaseClient } from '@/integrations/supabase/clerk-client';
import {
  analyzeFile,
  cleanData,
  extractClientData,
  generateDetailedReport,
  downloadReport,
  type FileAnalysisResult,
  type DetailedReport,
} from '@/utils/fileAnalysis';

import {
  saveMedecinDataWithUpsert,
  saveFile,
  type UpsertConfig,
} from '@/integrations/supabase/db';

const Dashboard = () => {
  /* ------------------------------------------------------------------ */
  /* 1️⃣  Clerk hooks (safe — inside component)                           */
  /* ------------------------------------------------------------------ */
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  /* ------------------------------------------------------------------ */
  /* 2️⃣  Local state                                                    */
  /* ------------------------------------------------------------------ */
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<FileAnalysisResult | null>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedReport | null>(null);
  const [isReadyForSync, setIsReadyForSync] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------------ */
  /* 3️⃣  Guard clauses                                                  */
  /* ------------------------------------------------------------------ */
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* 4️⃣  Helper functions                                               */
  /* ------------------------------------------------------------------ */
  const calculateDataCompleteness = (record: any): number => {
    const fields = [
      'Nom',
      'Prénom',
      'SECT ACT',
      'Semaine',
      'STRUCTURE',
      'Nom du compte',
      'SPECIALITE',
      'POTENTIEL',
      'VILLE',
      'ADRESSE',
    ];
    let completedFields = 0;

    fields.forEach((field) => {
      const value = record[field];
      if (value && value !== '' && value !== 'Non renseigné' && value !== null) {
        completedFields++;
      }
    });

    return completedFields / fields.length;
  };

  /* ------------------------------------------------------------------ */
  /* 5️⃣  Event handlers                                                 */
  /* ------------------------------------------------------------------ */
  const handleFileAnalysis = () => fileInputRef.current?.click();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setIsReadyForSync(false);
    setAnalysisResult(null);
    setDetailedReport(null);

    try {
      toast({ title: 'Analyse du fichier', description: `Analyse de ${file.name}…` });

      let result = await analyzeFile(file);
      if (!result.isWellStructured || !result.isCleaned) result = await cleanData(result);

      const report = generateDetailedReport(result);

      setAnalysisResult(result);
      setDetailedReport(report);
      setIsReadyForSync(true);

      localStorage.setItem('analysisResult', JSON.stringify(result));
      localStorage.setItem('detailedReport', JSON.stringify(report));

      toast({
        title: 'Analyse terminée',
        description: `${report.summary.fixesApplied} corrections appliquées. Prêt pour la synchronisation.`,
      });
    } catch (err) {
      toast({
        title: 'Erreur d’analyse',
        description: err instanceof Error ? err.message : 'Erreur inconnue.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSynchronization = async () => {
    if (!analysisResult || !isReadyForSync) {
      toast({
        title: 'Analyse requise',
        description: 'Analyser un fichier avant la synchronisation.',
        variant: 'destructive',
      });
      return;
    }

    setIsSynchronizing(true);

    try {
      toast({ title: 'Synchronisation', description: 'Envoi vers la base…' });

      const clientData = await extractClientData(analysisResult);

      const blob = new Blob([JSON.stringify(analysisResult.data, null, 2)], {
        type: 'application/json',
      });
      const cleanedFile = new File([blob], `cleaned_${analysisResult.fileName}`, {
        type: 'application/json',
      });

      const token = await getToken({ template: 'supabase' });
      const supabase = createSupabaseClient(token);

      const fileId = await saveFile(user.id, cleanedFile, supabase);

      const upsertConfig: UpsertConfig = {
        uniqueKeys: ['Nom', 'Prénom', 'VILLE'],
        conflictStrategy: 'update',
        updateColumns: [
          'SECT ACT',
          'Semaine',
          'STRUCTURE',
          'Nom du compte',
          'SPECIALITE',
          'POTENTIEL',
          'ADRESSE',
        ],
        shouldUpdate: (existing, incoming) =>
          calculateDataCompleteness(incoming) >= calculateDataCompleteness(existing),
      };

      const res = await saveMedecinDataWithUpsert(fileId, analysisResult.data, upsertConfig, supabase);

      toast({
        title: 'Synchronisation réussie',
        description: `${res.inserted} nouveaux, ${res.updated} mis à jour, ${res.skipped} ignorés.`,
      });

      setIsReadyForSync(false);
    } catch (err) {
      toast({
        title: 'Erreur de synchronisation',
        description: err instanceof Error ? err.message : 'Erreur inconnue.',
        variant: 'destructive',
      });
    } finally {
      setIsSynchronizing(false);
    }
  };

  const handleReportGeneration = async () => {
    if (!detailedReport) {
      toast({ title: 'Aucun rapport', description: 'Analyser un fichier d’abord.', variant: 'destructive' });
      return;
    }

    setIsGeneratingReport(true);
    try {
      toast({ title: 'Génération du rapport', description: 'Préparation…' });
      await new Promise((r) => setTimeout(r, 1000));
      downloadReport(detailedReport, 'html');
      toast({ title: 'Rapport généré', description: 'Téléchargement terminé.' });
    } catch {
      toast({ title: 'Erreur', description: 'Génération impossible.', variant: 'destructive' });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleViewReport = () => {
    if (!detailedReport) {
      toast({ title: 'Aucun rapport', description: 'Analyser un fichier d’abord.', variant: 'destructive' });
      return;
    }
    navigate('/report', { state: { reportData: analysisResult, detailedReport } });
  };

  /* ------------------------------------------------------------------ */
  /* 6️⃣  Render                                                         */
  /* ------------------------------------------------------------------ */
  const userName = user.firstName || user.emailAddresses[0]?.emailAddress;

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

        {(analysisResult || isAnalyzing) && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">État du Workflow</h3>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${isAnalyzing ? 'text-blue-600' : analysisResult ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-blue-600 animate-pulse' : analysisResult ? 'bg-green-600' : 'bg-gray-400'}`} />
                <span>Analyse</span>
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex items-center space-x-2 ${isSynchronizing ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${isSynchronizing ? 'bg-blue-600 animate-pulse' : isReadyForSync ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                <span>Synchronisation</span>
              </div>
            </div>

            {analysisResult && detailedReport && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Résumé de l’analyse :</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Lignes totales :</span>
                    <span className="ml-2 font-medium">{detailedReport.summary.totalRows}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Lignes nettoyées :</span>
                    <span className="ml-2 font-medium">{detailedReport.summary.cleanedRows}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Problèmes trouvés :</span>
                    <span className="ml-2 font-medium">{detailedReport.summary.issuesFound}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Corrections appliquées :</span>
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