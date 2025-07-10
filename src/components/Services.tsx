
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  FileSpreadsheet, 
  Users, 
  Bot, 
  Star, 
  Database,
  ArrowRight,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import { analyzeFile, restructureFile, extractClientData } from "@/utils/fileAnalysis";

const Services = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>("");

  const services = [
    {
      icon: FileSpreadsheet,
      title: "Analyse automatique de fichiers",
      description: "Traitement intelligent de vos fichiers CSV et Excel avec détection automatique des anomalies et suggestions d'amélioration.",
      features: ["Format CSV/Excel", "Détection d'erreurs", "Validation automatique"],
      color: "from-blue-500 to-blue-600",
      action: "analyze"
    },
    {
      icon: Users,
      title: "Extraction de données client",
      description: "Extraction et structuration automatisée des informations clients avec classification intelligente et enrichissement des données.",
      features: ["Classification IA", "Enrichissement", "Export sécurisé"],
      color: "from-teal-500 to-teal-600",
      action: "extract"
    },
    {
      icon: Bot,
      title: "Traitement automatique",
      description: "Automatisation complète du workflow de traitement des données avec intelligence artificielle avancée et apprentissage continu.",
      features: ["IA avancée", "Apprentissage", "Workflow automatique"],
      color: "from-purple-500 to-purple-600",
      action: "process"
    },
    {
      icon: Star,
      title: "Recommandation de services",
      description: "Système de recommandation intelligent basé sur l'analyse prédictive pour optimiser vos processus métier.",
      features: ["Analyse prédictive", "Recommandations", "Optimisation"],
      color: "from-orange-500 to-orange-600",
      action: "recommend"
    },
    {
      icon: Database,
      title: "Comparaison avec base de données",
      description: "Synchronisation et comparaison en temps réel avec vos bases de données existantes pour garantir la cohérence des informations.",
      features: ["Sync temps réel", "Détection de doublons", "Intégration API"],
      color: "from-green-500 to-green-600",
      action: "sync"
    }
  ];

  const stats = [
    { icon: Zap, value: "99.9%", label: "Précision", color: "text-blue-600" },
    { icon: Shield, value: "100%", label: "Sécurisé", color: "text-green-600" },
    { icon: Clock, value: "< 5min", label: "Traitement", color: "text-purple-600" }
  ];

  const handleServiceAction = (actionType: string) => {
    if (actionType === "analyze" || actionType === "extract") {
      setCurrentAction(actionType);
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      toast({
        title: "Fonctionnalité en développement",
        description: `${actionType === "process" ? "Traitement automatique" : 
                     actionType === "recommend" ? "Recommandation de services" : 
                     "Comparaison avec base de données"} sera bientôt disponible.`,
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Étape 1: Analyser le fichier
      toast({
        title: "Analyse en cours",
        description: `Analyse du fichier ${file.name}...`,
      });

      let analysisResult = await analyzeFile(file);
      
      // Étape 2: Restructurer si nécessaire
      if (!analysisResult.isWellStructured) {
        toast({
          title: "Restructuration automatique",
          description: "Le fichier n'est pas bien structuré. Tentative de restructuration...",
        });
        
        analysisResult = await restructureFile(analysisResult);
      }

      // Étape 3: Extraction de données client si demandée
      let clientData = null;
      if (currentAction === "extract") {
        toast({
          title: "Extraction des données client",
          description: "Extraction et enrichissement des informations client...",
        });
        
        clientData = await extractClientData(analysisResult);
      }

      // Préparer les données du rapport
      const reportData = {
        ...analysisResult,
        clientData: clientData || undefined
      };

      // Sauvegarder dans localStorage pour le rapport
      localStorage.setItem('reportData', JSON.stringify(reportData));

      toast({
        title: currentAction === "extract" ? "Extraction terminée" : "Analyse terminée",
        description: `${currentAction === "extract" ? 
          `${clientData?.length || 0} client(s) identifié(s) et enrichi(s)` : 
          "Fichier analysé avec succès"}. Redirection vers le rapport...`,
      });

      // Rediriger vers la page de rapport
      setTimeout(() => {
        navigate("/report", { state: { reportData } });
      }, 1500);

    } catch (error) {
      toast({
        title: "Erreur lors du traitement",
        description: error instanceof Error ? error.message : "Une erreur inconnue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCurrentAction("");
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <section id="services" className="py-20 bg-muted/30">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Nos <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Une suite complète d'outils IA pour automatiser et optimiser le traitement de vos données médicales
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-3 bg-card px-6 py-4 rounded-2xl shadow-sm border border-border">
                <stat.icon className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 bg-card hover:bg-card/80 overflow-hidden border border-border">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-gradient-from to-gradient-to rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-gradient-from to-gradient-to rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  onClick={() => handleServiceAction(service.action)}
                  disabled={isProcessing}
                  className="w-full group-hover:bg-primary/10 group-hover:border-primary group-hover:text-primary transition-all duration-200"
                >
                  {isProcessing && currentAction === service.action ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      {service.title.includes("Analyse") ? "Analyser un fichier" :
                       service.title.includes("Extraction") ? "Extraire les données" :
                       service.title.includes("Traitement") ? "Traitement auto" :
                       service.title.includes("Recommandation") ? "Recommandations" :
                       "Synchroniser"}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-gradient-from to-gradient-to rounded-3xl p-12 text-primary-foreground">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à transformer vos données ?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des centaines d'organisations qui font confiance à DataMed
          </p>
          <Button 
            size="lg"
            className="bg-background text-foreground hover:bg-muted px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => navigate("/dashboard")}
          >
            Accéder au Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
