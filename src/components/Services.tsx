
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const Services = () => {
  const services = [
    {
      icon: FileSpreadsheet,
      title: "Analyse automatique de fichiers",
      description: "Traitement intelligent de vos fichiers CSV et Excel avec détection automatique des anomalies et suggestions d'amélioration.",
      features: ["Format CSV/Excel", "Détection d'erreurs", "Validation automatique"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Extraction de données client",
      description: "Extraction et structuration automatisée des informations clients avec classification intelligente et enrichissement des données.",
      features: ["Classification IA", "Enrichissement", "Export sécurisé"],
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: Bot,
      title: "Traitement automatique",
      description: "Automatisation complète du workflow de traitement des données avec intelligence artificielle avancée et apprentissage continu.",
      features: ["IA avancée", "Apprentissage", "Workflow automatique"],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Star,
      title: "Recommandation de services",
      description: "Système de recommandation intelligent basé sur l'analyse prédictive pour optimiser vos processus métier.",
      features: ["Analyse prédictive", "Recommandations", "Optimisation"],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Database,
      title: "Comparaison avec base de données",
      description: "Synchronisation et comparaison en temps réel avec vos bases de données existantes pour garantir la cohérence des informations.",
      features: ["Sync temps réel", "Détection de doublons", "Intégration API"],
      color: "from-green-500 to-green-600"
    }
  ];

  const stats = [
    { icon: Zap, value: "99.9%", label: "Précision", color: "text-blue-600" },
    { icon: Shield, value: "100%", label: "Sécurisé", color: "text-green-600" },
    { icon: Clock, value: "< 5min", label: "Traitement", color: "text-purple-600" }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Nos <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Une suite complète d'outils IA pour automatiser et optimiser le traitement de vos données médicales
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl shadow-sm">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 overflow-hidden">
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 transition-all duration-200"
                >
                  En savoir plus
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl p-12 text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à transformer vos données ?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des centaines d'organisations qui font confiance à DataMed
          </p>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Démarrer maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
