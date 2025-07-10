
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, MapPin, Phone, Mail, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileData {
  fileName: string;
  totalRows: number;
  validRows: number;
  errors: string[];
  structure: {
    columns: string[];
    dataTypes: Record<string, string>;
  };
  clientData?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
    specialty?: string;
  }[];
}

const Report = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [reportData, setReportData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer les données du rapport depuis le state de navigation ou localStorage
    const data = location.state?.reportData || localStorage.getItem('reportData');
    if (data) {
      setReportData(typeof data === 'string' ? JSON.parse(data) : data);
    } else {
      toast({
        title: "Aucune donnée trouvée",
        description: "Veuillez d'abord analyser un fichier.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
    setIsLoading(false);
  }, [location.state, navigate, toast]);

  const handleDownloadReport = () => {
    if (!reportData) return;
    
    const reportContent = {
      fileName: reportData.fileName,
      analysisDate: new Date().toISOString(),
      summary: {
        totalRows: reportData.totalRows,
        validRows: reportData.validRows,
        errorCount: reportData.errors.length,
        successRate: `${((reportData.validRows / reportData.totalRows) * 100).toFixed(2)}%`
      },
      structure: reportData.structure,
      errors: reportData.errors,
      clientData: reportData.clientData
    };
    
    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${reportData.fileName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Rapport téléchargé",
      description: "Le rapport a été téléchargé avec succès.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Rapport introuvable</h2>
          <Button onClick={() => navigate("/dashboard")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/dashboard")}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Rapport d'analyse</h1>
            </div>
            <Button onClick={handleDownloadReport} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Résumé */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Résumé de l'analyse</CardTitle>
            <CardDescription>Fichier: {reportData.fileName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{reportData.totalRows}</div>
                <div className="text-sm text-muted-foreground">Lignes totales</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-accent">{reportData.validRows}</div>
                <div className="text-sm text-muted-foreground">Lignes valides</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-destructive">{reportData.errors.length}</div>
                <div className="text-sm text-muted-foreground">Erreurs</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {((reportData.validRows / reportData.totalRows) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Taux de réussite</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Structure du fichier */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Structure du fichier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Colonnes détectées:</h4>
                <div className="flex flex-wrap gap-2">
                  {reportData.structure.columns.map((column, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {column} ({reportData.structure.dataTypes[column] || 'inconnu'})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Données client extraites */}
        {reportData.clientData && reportData.clientData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Données client extraites</CardTitle>
              <CardDescription>
                {reportData.clientData.length} client(s) identifié(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Localisation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.clientData.map((client, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.specialty || 'Non spécifié'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {client.phone}
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1" />
                              {client.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.address ? (
                          <div className="flex items-start text-sm">
                            <Building className="h-3 w-3 mr-1 mt-0.5" />
                            {client.address}
                          </div>
                        ) : (
                          'Non disponible'
                        )}
                      </TableCell>
                      <TableCell>
                        {client.coordinates ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            {client.coordinates.lat.toFixed(4)}, {client.coordinates.lng.toFixed(4)}
                          </div>
                        ) : (
                          'Non localisé'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Erreurs détectées */}
        {reportData.errors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Erreurs détectées</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {reportData.errors.map((error, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {error}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Report;
