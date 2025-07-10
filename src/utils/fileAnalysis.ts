
export interface FileAnalysisResult {
  fileName: string;
  totalRows: number;
  validRows: number;
  errors: string[];
  structure: {
    columns: string[];
    dataTypes: Record<string, string>;
  };
  isWellStructured: boolean;
  data: any[];
}

export interface ClientData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  specialty?: string;
}

export const analyzeFile = async (file: File): Promise<FileAnalysisResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        let data: any[] = [];
        let columns: string[] = [];
        
        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = content.split('\n');
          if (lines.length < 2) {
            throw new Error('Fichier CSV vide ou invalide');
          }
          
          columns = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(val => val.trim().replace(/"/g, ''));
              const row: any = {};
              columns.forEach((col, index) => {
                row[col] = values[index] || '';
              });
              data.push(row);
            }
          }
        } else if (file.name.endsWith('.json')) {
          // Parse JSON
          const jsonData = JSON.parse(content);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            data = jsonData;
            columns = Object.keys(data[0]);
          } else {
            throw new Error('Format JSON invalide');
          }
        }
        
        // Analyser la structure
        const dataTypes: Record<string, string> = {};
        const errors: string[] = [];
        let validRows = 0;
        
        columns.forEach(col => {
          const values = data.map(row => row[col]).filter(val => val !== '' && val !== null && val !== undefined);
          if (values.length > 0) {
            const firstValue = values[0];
            if (!isNaN(Number(firstValue))) {
              dataTypes[col] = 'number';
            } else if (firstValue.includes('@')) {
              dataTypes[col] = 'email';
            } else if (/^\+?[\d\s\-\(\)]+$/.test(firstValue)) {
              dataTypes[col] = 'phone';
            } else {
              dataTypes[col] = 'text';
            }
          } else {
            dataTypes[col] = 'empty';
            errors.push(`Colonne "${col}" principalement vide`);
          }
        });
        
        // Vérifier la validité des lignes
        data.forEach((row, index) => {
          const hasValidData = Object.values(row).some(val => 
            val !== '' && val !== null && val !== undefined
          );
          if (hasValidData) {
            validRows++;
          } else {
            errors.push(`Ligne ${index + 2} vide ou invalide`);
          }
        });
        
        // Déterminer si le fichier est bien structuré
        const isWellStructured = 
          columns.length >= 2 && 
          validRows > 0 && 
          (validRows / data.length) > 0.8 && 
          errors.length < data.length * 0.1;
        
        resolve({
          fileName: file.name,
          totalRows: data.length,
          validRows,
          errors,
          structure: { columns, dataTypes },
          isWellStructured,
          data
        });
        
      } catch (error) {
        reject(new Error(`Erreur lors de l'analyse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsText(file);
  });
};

export const restructureFile = async (analysisResult: FileAnalysisResult): Promise<FileAnalysisResult> => {
  const { data, structure } = analysisResult;
  
  // Nettoyer les données
  const cleanedData = data.filter(row => {
    return Object.values(row).some(val => 
      val !== '' && val !== null && val !== undefined
    );
  });
  
  // Renommer les colonnes communes
  const columnMapping: Record<string, string> = {
    'nom': 'name',
    'prénom': 'firstName', 
    'prenom': 'firstName',
    'téléphone': 'phone',
    'telephone': 'phone',
    'tel': 'phone',
    'email': 'email',
    'mail': 'email',
    'adresse': 'address',
    'ville': 'city',
    'spécialité': 'specialty',
    'specialite': 'specialty'
  };
  
  const renamedColumns = structure.columns.map(col => {
    const lowerCol = col.toLowerCase();
    return columnMapping[lowerCol] || col;
  });
  
  // Restructurer les données
  const restructuredData = cleanedData.map(row => {
    const newRow: any = {};
    structure.columns.forEach((oldCol, index) => {
      const newCol = renamedColumns[index];
      newRow[newCol] = row[oldCol];
    });
    return newRow;
  });
  
  return {
    ...analysisResult,
    data: restructuredData,
    structure: {
      columns: renamedColumns,
      dataTypes: analysisResult.structure.dataTypes
    },
    validRows: restructuredData.length,
    isWellStructured: true,
    errors: [`Fichier restructuré automatiquement: ${cleanedData.length} lignes nettoyées`]
  };
};

export const extractClientData = async (analysisResult: FileAnalysisResult): Promise<ClientData[]> => {
  const clients: ClientData[] = [];
  
  for (const row of analysisResult.data) {
    const client: ClientData = {
      name: row.name || row.nom || `${row.firstName || row.prénom || ''} ${row.lastName || ''}`.trim(),
      phone: row.phone || row.téléphone || row.tel,
      email: row.email || row.mail,
      address: row.address || row.adresse,
      specialty: row.specialty || row.spécialité || row.specialite
    };
    
    if (client.name) {
      // Enrichir avec Google Maps API si une adresse est disponible
      if (client.address) {
        try {
          const coordinates = await getCoordinatesFromAddress(client.address);
          if (coordinates) {
            client.coordinates = coordinates;
          }
        } catch (error) {
          console.warn('Erreur lors de la géolocalisation:', error);
        }
      }
      
      clients.push(client);
    }
  }
  
  return clients;
};

const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  // Simulation de l'API Google Maps - remplacez par votre clé API réelle
  try {
    // Pour la démo, on retourne des coordonnées simulées
    // En production, utilisez l'API Google Maps Geocoding
    const mockCoordinates = {
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1
    };
    
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCoordinates;
  } catch (error) {
    console.error('Erreur géolocalisation:', error);
    return null;
  }
};
