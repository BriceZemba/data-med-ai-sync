
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <div className="text-sm text-muted-foreground">
              Bienvenue, {userName}
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
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
