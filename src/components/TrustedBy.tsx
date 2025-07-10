import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, User, Settings, FileText, ArrowRight } from "lucide-react";

const TrustedBy = () => {
  const navigate = useNavigate();

  const trustedOrganizations = [
    "Hôpitaux",
    "Cliniques privées", 
    "Cliniques publiques",
    "Professionnels de santé"
  ];

  const navigationItems = [
    { label: "Accueil", path: "/", icon: Home },
    { label: "Dashboard", path: "/dashboard", icon: User },
    { label: "Services", path: "/#services", icon: Settings },
    { label: "Documentation", path: "/docs", icon: FileText }
  ];

  const handleNavigation = (path: string) => {
    if (path.startsWith("/#")) {
      // Pour les ancres, on va à l'accueil puis on scroll
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(path.substring(1));
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      navigate(path);
    }
  };

  return (
    <section className="py-16 bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted By Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Fait confiance par:
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {trustedOrganizations.map((org, index) => (
              <div 
                key={index}
                className="bg-card px-6 py-3 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-muted-foreground font-medium">{org}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="border-t border-border pt-12">
          <h4 className="text-xl font-semibold text-foreground text-center mb-8">
            Navigation rapide
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {navigationItems.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleNavigation(item.path)}
                className="flex items-center justify-center gap-2 p-4 h-auto hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
                <ArrowRight className="h-3 w-3 opacity-60" />
              </Button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2024 DataMed. Tous droits réservés. | Technologie IA avancée pour la santé.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;