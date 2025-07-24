import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Database, BarChart3, Eye, Upload, RefreshCw } from "lucide-react";

interface QuickActionsProps {
  onFileAnalysis: () => void;
  onSynchronization: () => void;
  onReportGeneration: () => void;
  onViewReport: () => void;
  isAnalyzing: boolean;
  isSynchronizing: boolean;
  isGeneratingReport: boolean;
  isReadyForSync: boolean;
  hasAnalysisResult: boolean;
}

const QuickActions = ({
  onFileAnalysis,
  onSynchronization,
  onReportGeneration,
  onViewReport,
  isAnalyzing,
  isSynchronizing,
  isGeneratingReport,
  isReadyForSync,
  hasAnalysisResult
}: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Actions Rapides
        </CardTitle>
        <CardDescription>
          Analysez vos fichiers et synchronisez vos données
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Étape 1: Analyse du fichier */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Étape 1: Analyse et Nettoyage</h4>
          <Button
            onClick={onFileAnalysis}
            disabled={isAnalyzing || isSynchronizing}
            className="w-full"
            variant={hasAnalysisResult ? "outline" : "default"}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyse en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {hasAnalysisResult ? "Analyser un nouveau fichier" : "Analyser un fichier"}
              </>
            )}
          </Button>
        </div>

        {/* Étape 2: Synchronisation */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Étape 2: Synchronisation</h4>
          <Button
            onClick={onSynchronization}
            disabled={!isReadyForSync || isSynchronizing || isAnalyzing}
            className="w-full"
            variant={isReadyForSync ? "default" : "outline"}
          >
            {isSynchronizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Synchronisation...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchroniser vers la base de données
              </>
            )}
          </Button>
          {!isReadyForSync && !hasAnalysisResult && (
            <p className="text-xs text-gray-500">
              Analysez d'abord un fichier pour activer la synchronisation
            </p>
          )}
        </div>

        <div className="border-t pt-4 space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Rapports</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onViewReport}
              disabled={!hasAnalysisResult}
              variant="outline"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
            <Button
              onClick={onReportGeneration}
              disabled={isGeneratingReport || !hasAnalysisResult}
              variant="outline"
              size="sm"
            >
              {isGeneratingReport ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
              ) : (
                <BarChart3 className="h-4 w-4 mr-1" />
              )}
              Télécharger
            </Button>
          </div>
        </div>

        {/* Indicateurs d'état */}
        {hasAnalysisResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-700 font-medium">
                Fichier analysé et prêt
              </span>
            </div>
            {isReadyForSync && (
              <p className="text-xs text-green-600 mt-1">
                Vous pouvez maintenant synchroniser les données
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActions;

