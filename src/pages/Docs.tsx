import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustedBy from "@/components/TrustedBy";
import { FileText, Download, Code, Settings, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Docs = () => {
  const navigate = useNavigate();

  const documentationSections = [
    {
      icon: FileText,
      title: "Guide d'utilisation",
      description: "Apprenez à utiliser notre plateforme IA pour analyser vos données médicales",
      items: ["Premiers pas", "Interface utilisateur", "Analyse de fichiers", "Génération de rapports"]
    },
    {
      icon: Code,
      title: "API Documentation",
      description: "Intégrez notre API dans vos systèmes existants",
      items: ["Authentification", "Endpoints", "Exemples de code", "SDK disponibles"]
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Configurez votre environnement pour une utilisation optimale",
      items: ["Paramètres système", "Sécurité", "Permissions", "Intégrations"]
    },
    {
      icon: Download,
      title: "Ressources",
      description: "Téléchargez nos guides et modèles",
      items: ["Templates CSV", "Guides PDF", "Exemples", "Manuels techniques"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Documentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Trouvez toutes les informations nécessaires pour utiliser notre plateforme IA
            </p>
          </div>

          {/* Documentation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {documentationSections.map((section, index) => (
              <Card key={index} className="bg-card border border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-gradient-from to-gradient-to rounded-xl flex items-center justify-center mb-4">
                    <section.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-gradient-from to-gradient-to rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full mt-6 hover:bg-primary/10 hover:border-primary hover:text-primary"
                  >
                    Consulter
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Start */}
          <div className="text-center bg-gradient-to-r from-gradient-from to-gradient-to rounded-3xl p-12 text-primary-foreground">
            <h3 className="text-3xl font-bold mb-4">
              Besoin d'aide ?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Notre équipe support est là pour vous accompagner
            </p>
            <Button 
              size="lg"
              className="bg-background text-foreground hover:bg-muted px-8 py-4 text-lg font-semibold rounded-xl"
            >
              Contacter le support
            </Button>
          </div>
        </div>
      </main>

      <TrustedBy />
      <Footer />
    </div>
  );
};

export default Docs;