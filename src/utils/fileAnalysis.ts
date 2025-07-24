export interface DataIssue {
  type: 'missing_value' | 'wrong_format' | 'duplicate' | 'invalid_character' | 'inconsistent_type';
  column: string;
  row: number;
  value: any;
  description: string;
}

export interface DataCleaningReport {
  issuesFound: DataIssue[];
  fixesApplied: {
    type: string;
    count: number;
    description: string;
  }[];
  dataQualitySummary: {
    totalRows: number;
    validRows: number;
    cleanedRows: number;
    duplicatesRemoved: number;
    missingValuesFilled: number;
    formatConversions: number;
  };
}

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
  cleaningReport?: DataCleaningReport;
  isAnalyzed: boolean;
  isCleaned: boolean;
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
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Parse Excel avec la bibliothèque xlsx
          const { default: XLSX } = await import('xlsx');
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error('Fichier Excel vide ou invalide');
          }
          
          columns = (jsonData[0] as string[]).map(col => String(col || '').trim());
          
          for (let i = 1; i < jsonData.length; i++) {
            const rowData = jsonData[i] as any[];
            if (rowData && rowData.some(cell => cell !== null && cell !== undefined && cell !== '')) {
              const row: any = {};
              columns.forEach((col, index) => {
                row[col] = rowData[index] !== null && rowData[index] !== undefined ? String(rowData[index]) : '';
              });
              data.push(row);
            }
          }
        }
        
        // Analyser la structure et détecter les problèmes
        const analysisResult = await performDataAnalysis(file.name, data, columns);
        
        resolve(analysisResult);
        
      } catch (error) {
        reject(new Error(`Erreur lors de l'analyse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsText(file);
  });
};

const performDataAnalysis = async (fileName: string, data: any[], columns: string[]): Promise<FileAnalysisResult> => {
  const dataTypes: Record<string, string> = {};
  const errors: string[] = [];
  const issues: DataIssue[] = [];
  let validRows = 0;
  
  // Analyser les types de données et détecter les problèmes
  columns.forEach(col => {
    const values = data.map(row => row[col]);
    const nonEmptyValues = values.filter(val => val !== '' && val !== null && val !== undefined);
    
    if (nonEmptyValues.length === 0) {
      dataTypes[col] = 'empty';
      errors.push(`Colonne "${col}" entièrement vide`);
      return;
    }
    
    // Déterminer le type de données prédominant
    const typeAnalysis = analyzeColumnType(nonEmptyValues);
    dataTypes[col] = typeAnalysis.type;
    
    // Détecter les problèmes dans chaque ligne
    data.forEach((row, rowIndex) => {
      const value = row[col];
      
      // Valeurs manquantes
      if (value === '' || value === null || value === undefined) {
        issues.push({
          type: 'missing_value',
          column: col,
          row: rowIndex + 1,
          value: value,
          description: `Valeur manquante dans la colonne "${col}"`
        });
      } else {
        // Vérifier la cohérence du type
        if (!isValueConsistentWithType(value, typeAnalysis.type)) {
          issues.push({
            type: 'wrong_format',
            column: col,
            row: rowIndex + 1,
            value: value,
            description: `Format incorrect: attendu ${typeAnalysis.type}, reçu "${value}"`
          });
        }
        
        // Détecter les caractères invalides
        if (hasInvalidCharacters(value)) {
          issues.push({
            type: 'invalid_character',
            column: col,
            row: rowIndex + 1,
            value: value,
            description: `Caractères invalides détectés dans "${value}"`
          });
        }
      }
    });
  });
  
  // Détecter les doublons
  const duplicates = findDuplicateRows(data);
  duplicates.forEach(duplicate => {
    issues.push({
      type: 'duplicate',
      column: 'all',
      row: duplicate.rowIndex + 1,
      value: duplicate.row,
      description: `Ligne dupliquée (identique à la ligne ${duplicate.originalIndex + 1})`
    });
  });
  
  // Compter les lignes valides
  data.forEach((row) => {
    const hasValidData = Object.values(row).some(val => 
      val !== '' && val !== null && val !== undefined
    );
    if (hasValidData) {
      validRows++;
    }
  });
  
  // Déterminer si le fichier est bien structuré
  const isWellStructured = 
    columns.length >= 2 && 
    validRows > 0 && 
    (validRows / data.length) > 0.8 && 
    issues.filter(i => i.type !== 'missing_value').length < data.length * 0.1;
  
  return {
    fileName,
    totalRows: data.length,
    validRows,
    errors,
    structure: { columns, dataTypes },
    isWellStructured,
    data,
    isAnalyzed: true,
    isCleaned: false
  };
};

const analyzeColumnType = (values: any[]): { type: string; confidence: number } => {
  const typeChecks = {
    number: (val: any) => !isNaN(Number(val)) && val !== '',
    email: (val: any) => typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    phone: (val: any) => typeof val === 'string' && /^\+?[\d\s\-\(\)]{8,}$/.test(val),
    date: (val: any) => !isNaN(Date.parse(val)),
    text: () => true
  };
  
  const results = Object.entries(typeChecks).map(([type, check]) => ({
    type,
    matches: values.filter(check).length,
    confidence: values.filter(check).length / values.length
  }));
  
  results.sort((a, b) => b.confidence - a.confidence);
  return results[0];
};

const isValueConsistentWithType = (value: any, expectedType: string): boolean => {
  switch (expectedType) {
    case 'number':
      return !isNaN(Number(value)) && value !== '';
    case 'email':
      return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'phone':
      return typeof value === 'string' && /^\+?[\d\s\-\(\)]{8,}$/.test(value);
    case 'date':
      return !isNaN(Date.parse(value));
    default:
      return true;
  }
};

const hasInvalidCharacters = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  // Détecter les caractères de contrôle et autres caractères problématiques
  return /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value);
};

const findDuplicateRows = (data: any[]): { row: any; rowIndex: number; originalIndex: number }[] => {
  const duplicates: { row: any; rowIndex: number; originalIndex: number }[] = [];
  const seen = new Map<string, number>();
  
  data.forEach((row, index) => {
    const rowString = JSON.stringify(row);
    if (seen.has(rowString)) {
      duplicates.push({
        row,
        rowIndex: index,
        originalIndex: seen.get(rowString)!
      });
    } else {
      seen.set(rowString, index);
    }
  });
  
  return duplicates;
};

export const cleanData = async (analysisResult: FileAnalysisResult): Promise<FileAnalysisResult> => {
  if (!analysisResult.isAnalyzed) {
    throw new Error('Les données doivent être analysées avant le nettoyage');
  }
  
  const { data, structure } = analysisResult;
  const cleanedData = [...data];
  const fixesApplied: DataCleaningReport['fixesApplied'] = [];
  let duplicatesRemoved = 0;
  let missingValuesFilled = 0;
  let formatConversions = 0;
  
  // 1. Supprimer les doublons
  const uniqueData: any[] = [];
  const seenRows = new Set<string>();
  
  cleanedData.forEach(row => {
    const rowString = JSON.stringify(row);
    if (!seenRows.has(rowString)) {
      seenRows.add(rowString);
      uniqueData.push(row);
    } else {
      duplicatesRemoved++;
    }
  });
  
  if (duplicatesRemoved > 0) {
    fixesApplied.push({
      type: 'duplicate_removal',
      count: duplicatesRemoved,
      description: `${duplicatesRemoved} ligne(s) dupliquée(s) supprimée(s)`
    });
  }
  
  // 2. Nettoyer et normaliser les données
  uniqueData.forEach(row => {
    structure.columns.forEach(col => {
      const value = row[col];
      const expectedType = structure.dataTypes[col];
      
      // Remplir les valeurs manquantes
      if (value === '' || value === null || value === undefined) {
        row[col] = getDefaultValueForType(expectedType);
        missingValuesFilled++;
      } else {
        // Nettoyer et convertir les formats
        const cleanedValue = cleanAndConvertValue(value, expectedType);
        if (cleanedValue !== value) {
          row[col] = cleanedValue;
          formatConversions++;
        }
      }
    });
  });
  
  if (missingValuesFilled > 0) {
    fixesApplied.push({
      type: 'missing_values',
      count: missingValuesFilled,
      description: `${missingValuesFilled} valeur(s) manquante(s) remplie(s) avec des valeurs par défaut`
    });
  }
  
  if (formatConversions > 0) {
    fixesApplied.push({
      type: 'format_conversion',
      count: formatConversions,
      description: `${formatConversions} valeur(s) convertie(s) au bon format`
    });
  }
  
  // 3. Renommer les colonnes communes pour standardisation
  const columnMapping: Record<string, string> = {
    'nom': 'Nom',
    'prénom': 'Prénom', 
    'prenom': 'Prénom',
    'téléphone': 'phone',
    'telephone': 'phone',
    'tel': 'phone',
    'email': 'email',
    'mail': 'email',
    'adresse': 'ADRESSE',
    'ville': 'VILLE',
    'spécialité': 'SPECIALITE',
    'specialite': 'SPECIALITE'
  };
  
  const renamedColumns = structure.columns.map(col => {
    const lowerCol = col.toLowerCase();
    return columnMapping[lowerCol] || col;
  });
  
  // Restructurer les données avec les nouveaux noms de colonnes
  const restructuredData = uniqueData.map(row => {
    const newRow: any = {};
    structure.columns.forEach((oldCol, index) => {
      const newCol = renamedColumns[index];
      newRow[newCol] = row[oldCol];
    });
    return newRow;
  });
  
  const cleaningReport: DataCleaningReport = {
    issuesFound: [], // Les issues sont déjà détectées dans l'analyse
    fixesApplied,
    dataQualitySummary: {
      totalRows: data.length,
      validRows: analysisResult.validRows,
      cleanedRows: restructuredData.length,
      duplicatesRemoved,
      missingValuesFilled,
      formatConversions
    }
  };
  
  return {
    ...analysisResult,
    data: restructuredData,
    structure: {
      columns: renamedColumns,
      dataTypes: analysisResult.structure.dataTypes
    },
    validRows: restructuredData.length,
    isWellStructured: true,
    isCleaned: true,
    cleaningReport
  };
};

const getDefaultValueForType = (type: string): any => {
  switch (type) {
    case 'number':
      return 0;
    case 'email':
      return 'non-renseigné@exemple.com';
    case 'phone':
      return 'Non renseigné';
    case 'date':
      return new Date().toISOString().split('T')[0];
    default:
      return 'Non renseigné';
  }
};

const cleanAndConvertValue = (value: any, expectedType: string): any => {
  if (typeof value !== 'string') return value;
  
  // Nettoyer les caractères invalides
  let cleaned = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trimmer les espaces
  cleaned = cleaned.trim();
  
  switch (expectedType) {
    case 'number':
      // Extraire les nombres des chaînes
      const numMatch = cleaned.match(/[\d.,]+/);
      if (numMatch) {
        return parseFloat(numMatch[0].replace(',', '.'));
      }
      return cleaned;
      
    case 'email':
      // Normaliser l'email
      return cleaned.toLowerCase();
      
    case 'phone':
      // Normaliser le téléphone
      return cleaned.replace(/[^\d+\-\s\(\)]/g, '');
      
    case 'text':
      // Capitaliser la première lettre pour les noms
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
      
    default:
      return cleaned;
  }
};

export const restructureFile = async (analysisResult: FileAnalysisResult): Promise<FileAnalysisResult> => {
  // Cette fonction est maintenant intégrée dans cleanData
  return cleanData(analysisResult);
};

export const extractClientData = async (analysisResult: FileAnalysisResult): Promise<ClientData[]> => {
  if (!analysisResult.isCleaned) {
    throw new Error('Les données doivent être nettoyées avant l\'extraction');
  }
  
  const clients: ClientData[] = [];
  
  for (const row of analysisResult.data) {
    const client: ClientData = {
      name: row.Nom || row.name || `${row.Prénom || row.firstName || ''} ${row.lastName || ''}`.trim(),
      phone: row.phone || row.téléphone || row.tel,
      email: row.email || row.mail,
      address: row.ADRESSE || row.address || row.adresse,
      specialty: row.SPECIALITE || row.specialty || row.spécialité || row.specialite
    };
    
    if (client.name && client.name !== 'Non renseigné') {
      // Enrichir avec Google Maps API si une adresse est disponible
      if (client.address && client.address !== 'Non renseigné') {
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

export interface DetailedReport {
  fileName: string;
  analysisDate: string;
  summary: {
    totalRows: number;
    validRows: number;
    cleanedRows: number;
    issuesFound: number;
    fixesApplied: number;
  };
  dataQuality: {
    completeness: number; // Pourcentage de données complètes
    accuracy: number; // Pourcentage de données au bon format
    consistency: number; // Pourcentage de données cohérentes
    uniqueness: number; // Pourcentage de données uniques
  };
  issuesDetailed: DataIssue[];
  fixesDetailed: DataCleaningReport['fixesApplied'];
  recommendations: string[];
}

export const generateDetailedReport = (analysisResult: FileAnalysisResult): DetailedReport => {
  if (!analysisResult.isAnalyzed) {
    throw new Error('Les données doivent être analysées avant la génération du rapport');
  }

  const cleaningReport = analysisResult.cleaningReport;
  const issuesFound = cleaningReport?.issuesFound || [];
  const fixesApplied = cleaningReport?.fixesApplied || [];
  
  // Calculer les métriques de qualité des données
  const totalCells = analysisResult.totalRows * analysisResult.structure.columns.length;
  const missingValues = issuesFound.filter(i => i.type === 'missing_value').length;
  const wrongFormats = issuesFound.filter(i => i.type === 'wrong_format').length;
  const duplicates = issuesFound.filter(i => i.type === 'duplicate').length;
  
  const completeness = ((totalCells - missingValues) / totalCells) * 100;
  const accuracy = ((totalCells - wrongFormats) / totalCells) * 100;
  const consistency = ((totalCells - issuesFound.filter(i => i.type === 'inconsistent_type').length) / totalCells) * 100;
  const uniqueness = ((analysisResult.totalRows - duplicates) / analysisResult.totalRows) * 100;
  
  // Générer des recommandations
  const recommendations: string[] = [];
  
  if (completeness < 90) {
    recommendations.push(`Améliorer la complétude des données (${completeness.toFixed(1)}% actuellement). Considérer des validations à la saisie.`);
  }
  
  if (accuracy < 95) {
    recommendations.push(`Améliorer la précision des formats (${accuracy.toFixed(1)}% actuellement). Mettre en place des contrôles de format.`);
  }
  
  if (duplicates > 0) {
    recommendations.push(`Éliminer les sources de doublons (${duplicates} trouvés). Implémenter des clés uniques.`);
  }
  
  if (analysisResult.structure.columns.length > 20) {
    recommendations.push('Considérer la normalisation de la base de données pour réduire la redondance.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Excellente qualité des données ! Maintenir les bonnes pratiques actuelles.');
  }

  return {
    fileName: analysisResult.fileName,
    analysisDate: new Date().toISOString(),
    summary: {
      totalRows: analysisResult.totalRows,
      validRows: analysisResult.validRows,
      cleanedRows: cleaningReport?.dataQualitySummary.cleanedRows || analysisResult.validRows,
      issuesFound: issuesFound.length,
      fixesApplied: fixesApplied.reduce((sum, fix) => sum + fix.count, 0)
    },
    dataQuality: {
      completeness: Math.round(completeness * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      uniqueness: Math.round(uniqueness * 100) / 100
    },
    issuesDetailed: issuesFound,
    fixesDetailed: fixesApplied,
    recommendations
  };
};

export const generateReportHTML = (report: DetailedReport): string => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Analyse - ${report.fileName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-top: 0;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .metric {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .metric-label {
            color: #666;
            margin-top: 5px;
        }
        .quality-bar {
            background: #e9ecef;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .quality-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #ffc107, #dc3545);
            transition: width 0.3s ease;
        }
        .recommendations {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
        }
        .recommendations ul {
            margin: 0;
            padding-left: 20px;
        }
        .recommendations li {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport d'Analyse des Données</h1>
        <p>Fichier: ${report.fileName}</p>
        <p>Date d'analyse: ${new Date(report.analysisDate).toLocaleDateString('fr-FR')}</p>
    </div>

    <div class="section">
        <h2>Résumé Exécutif</h2>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${report.summary.totalRows}</div>
                <div class="metric-label">Lignes totales</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.cleanedRows}</div>
                <div class="metric-label">Lignes nettoyées</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.issuesFound}</div>
                <div class="metric-label">Problèmes détectés</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.fixesApplied}</div>
                <div class="metric-label">Corrections appliquées</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Qualité des Données</h2>
        <div>
            <h4>Complétude: ${report.dataQuality.completeness}%</h4>
            <div class="quality-bar">
                <div class="quality-fill" style="width: ${report.dataQuality.completeness}%"></div>
            </div>
        </div>
        <div>
            <h4>Précision: ${report.dataQuality.accuracy}%</h4>
            <div class="quality-bar">
                <div class="quality-fill" style="width: ${report.dataQuality.accuracy}%"></div>
            </div>
        </div>
        <div>
            <h4>Cohérence: ${report.dataQuality.consistency}%</h4>
            <div class="quality-bar">
                <div class="quality-fill" style="width: ${report.dataQuality.consistency}%"></div>
            </div>
        </div>
        <div>
            <h4>Unicité: ${report.dataQuality.uniqueness}%</h4>
            <div class="quality-bar">
                <div class="quality-fill" style="width: ${report.dataQuality.uniqueness}%"></div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Recommandations</h2>
        <div class="recommendations">
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>Conclusion</h2>
        <p>
            L'analyse du fichier <strong>${report.fileName}</strong> a été complétée avec succès. 
            ${report.summary.fixesApplied > 0 ? 
                `${report.summary.fixesApplied} corrections ont été appliquées automatiquement pour améliorer la qualité des données.` :
                'Aucune correction n\'était nécessaire, les données sont de bonne qualité.'
            }
        </p>
        <p>
            Les données sont maintenant prêtes pour la synchronisation avec la base de données.
        </p>
    </div>
</body>
</html>
  `;
};

export const downloadReport = (report: DetailedReport, format: 'html' | 'json' = 'html') => {
  const content = format === 'html' ? generateReportHTML(report) : JSON.stringify(report, null, 2);
  const blob = new Blob([content], { type: format === 'html' ? 'text/html' : 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `rapport-analyse-${report.fileName.replace(/\.[^/.]+$/, '')}-${new Date().toISOString().split('T')[0]}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

