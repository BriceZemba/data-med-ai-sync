
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignUpButton, useUser } from "@clerk/clerk-react";
import { Brain, Database, FileText, TrendingUp, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [email, setEmail] = useState("");
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const features = [
    "Analyse automatique en temps réel",
    "Sécurité des données garantie",
    "Intégration API simplifiée"
  ];

  const animatedIcons = [
    { icon: Brain, delay: "0s", position: "top-20 left-20" },
    { icon: Database, delay: "0.5s", position: "top-32 right-32" },
    { icon: FileText, delay: "1s", position: "bottom-40 left-16" },
    { icon: TrendingUp, delay: "1.5s", position: "bottom-20 right-20" },
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-teal-50 min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated Background Icons */}
      <div className="absolute inset-0 opacity-10">
        {animatedIcons.map(({ icon: Icon, delay, position }, index) => (
          <div
            key={index}
            className={`absolute ${position} animate-pulse`}
            style={{ animationDelay: delay }}
          >
            <Icon className="h-12 w-12 text-blue-600" />
          </div>
        ))}
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-8 animate-fade-in">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            Technologie IA avancée
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in">
            L'intelligence au service de{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              vos données
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Automatisez la vérification, restructuration et synchronisation de vos données médicales 
            avec notre plateforme IA de nouvelle génération.
          </p>

          {/* Features List */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center text-gray-700">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          {isSignedIn ? (
            <div className="space-y-6 animate-fade-in">
              <Button 
                onClick={() => navigate("/dashboard")}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                Accéder au Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <SignUpButton mode="modal">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group h-14"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SignUpButton>
              </div>
              <p className="text-sm text-gray-500">
                Commencez gratuitement. Aucune carte de crédit requise.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
    </section>
  );
};

export default Hero;
