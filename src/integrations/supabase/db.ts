// integration/db.ts
import { supabase } from './client';

export interface MedecinData {
  Nom: string;
  Prénom: string;
  'SECT ACT': string;
  Semaine: string;
  STRUCTURE: string;
  'Nom du compte': string;
  SPECIALITE: string;
  POTENTIEL: string;
  VILLE: string;
  ADRESSE: string;
}

export interface UpsertResult {
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
  conflicts: Array<{
    row: MedecinData;
    reason: string;
    action: 'updated' | 'skipped';
  }>;
}

/**
 * Configuration pour la stratégie d'upsert
 */
export interface UpsertConfig {
  // Colonnes utilisées pour identifier les doublons
  uniqueKeys: string[];
  // Stratégie en cas de conflit: 'update', 'skip', 'error'
  conflictStrategy: 'update' | 'skip' | 'error';
  // Colonnes à mettre à jour en cas de conflit (si strategy = 'update')
  updateColumns?: string[];
  // Fonction personnalisée pour déterminer si une ligne doit être mise à jour
  shouldUpdate?: (existing: any, incoming: MedecinData) => boolean;
}

export async function saveFile(
  userId: string,
  file: File
): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(fileBuffer);

  const { data, error } = await supabase.storage
    .from('uploaded_files')
    .upload(`${userId}/${file.name}-${Date.now()}`, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    throw new Error(`Erreur lors de la sauvegarde du fichier: ${error.message}`);
  }

  return data.path;
}

/**
 * Sauvegarde les données de médecins avec stratégie d'upsert pour éviter les doublons
 */
export async function saveMedecinDataWithUpsert(
  fileId: string,
  medecins: MedecinData[],
  config: UpsertConfig = {
    uniqueKeys: ['Nom', 'Prénom', 'VILLE'],
    conflictStrategy: 'update',
    updateColumns: ['SECT ACT', 'Semaine', 'STRUCTURE', 'Nom du compte', 'SPECIALITE', 'POTENTIEL', 'ADRESSE']
  }
): Promise<UpsertResult> {
  
  const result: UpsertResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    total: medecins.length,
    conflicts: []
  };
  
  try {
    for (const medecin of medecins) {
      try {
        // Construire la requête de recherche des doublons
        let query = supabase
          .from('medecin')
          .select('*');
        
        // Ajouter les conditions pour les clés uniques
        config.uniqueKeys.forEach(key => {
          const dbColumn = convertToDbColumn(key);
          const value = getMedecinValue(medecin, key);
          query = query.ilike(dbColumn, value);
        });
        
        const { data: existingRecords, error: searchError } = await query;
        
        if (searchError) {
          throw new Error(`Erreur lors de la recherche: ${searchError.message}`);
        }
        
        if (existingRecords && existingRecords.length > 0) {
          // Conflit détecté
          const existingRecord = existingRecords[0];
          
          switch (config.conflictStrategy) {
            case 'update':
              if (!config.shouldUpdate || config.shouldUpdate(existingRecord, medecin)) {
                await updateMedecinRecord(existingRecord.id, medecin, config.updateColumns || []);
                result.updated++;
                result.conflicts.push({
                  row: medecin,
                  reason: `Mise à jour de l'enregistrement existant (ID: ${existingRecord.id})`,
                  action: 'updated'
                });
              } else {
                result.skipped++;
                result.conflicts.push({
                  row: medecin,
                  reason: 'Enregistrement existant plus récent, mise à jour ignorée',
                  action: 'skipped'
                });
              }
              break;
              
            case 'skip':
              result.skipped++;
              result.conflicts.push({
                row: medecin,
                reason: 'Enregistrement similaire existe déjà, insertion ignorée',
                action: 'skipped'
              });
              break;
              
            case 'error':
              throw new Error(`Doublon détecté pour ${medecin.Nom} ${medecin.Prénom} à ${medecin.VILLE}`);
          }
        } else {
          // Aucun conflit, insertion normale
          await insertMedecinRecord(fileId, medecin);
          result.inserted++;
        }
        
      } catch (recordError) {
        console.error(`Erreur lors du traitement de l'enregistrement:`, medecin, recordError);
        // Continuer avec les autres enregistrements
        result.skipped++;
        result.conflicts.push({
          row: medecin,
          reason: `Erreur lors du traitement: ${recordError instanceof Error ? recordError.message : 'Erreur inconnue'}`,
          action: 'skipped'
        });
      }
    }
    
  } catch (error) {
    console.error("Erreur lors de la transaction d'upsert:", error);
    throw new Error("Échec de la sauvegarde des données de médecin avec upsert.");
  }
  
  return result;
}

/**
 * Insère un nouvel enregistrement de médecin
 */
async function insertMedecinRecord(fileId: string, medecin: MedecinData): Promise<void> {
  const { error } = await supabase
    .from('medecin')
    .insert({
      file_id: fileId,
      nom: medecin.Nom,
      prenom: medecin.Prénom,
      sect_act: medecin['SECT ACT'],
      semaine: medecin.Semaine,
      structure: medecin.STRUCTURE,
      nom_compte: medecin['Nom du compte'],
      specialite: medecin.SPECIALITE,
      potentiel: medecin.POTENTIEL,
      ville: medecin.VILLE,
      adresse: medecin.ADRESSE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw new Error(`Erreur lors de l'insertion: ${error.message}`);
  }
}

/**
 * Met à jour un enregistrement existant de médecin
 */
async function updateMedecinRecord(
  recordId: number, 
  medecin: MedecinData, 
  updateColumns: string[]
): Promise<void> {
  if (updateColumns.length === 0) {
    // Si aucune colonne spécifiée, mettre à jour toutes les colonnes sauf les clés uniques
    updateColumns = ['SECT ACT', 'Semaine', 'STRUCTURE', 'Nom du compte', 'SPECIALITE', 'POTENTIEL', 'ADRESSE'];
  }
  
  const updateData: any = {
    updated_at: new Date().toISOString()
  };
  
  updateColumns.forEach(col => {
    const dbColumn = convertToDbColumn(col);
    const value = getMedecinValue(medecin, col);
    updateData[dbColumn] = value;
  });
  
  const { error } = await supabase
    .from('medecin')
    .update(updateData)
    .eq('id', recordId);

  if (error) {
    throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
  }
}

/**
 * Convertit un nom de champ en nom de colonne de base de données
 */
function convertToDbColumn(fieldName: string): string {
  const mapping: Record<string, string> = {
    'Nom': 'nom',
    'nom': 'nom',
    'Prénom': 'prenom',
    'prenom': 'prenom',
    'SECT ACT': 'sect_act',
    'sect_act': 'sect_act',
    'Semaine': 'semaine',
    'semaine': 'semaine',
    'STRUCTURE': 'structure',
    'structure': 'structure',
    'Nom du compte': 'nom_compte',
    'nom_compte': 'nom_compte',
    'SPECIALITE': 'specialite',
    'specialite': 'specialite',
    'POTENTIEL': 'potentiel',
    'potentiel': 'potentiel',
    'VILLE': 'ville',
    'ville': 'ville',
    'ADRESSE': 'adresse',
    'adresse': 'adresse'
  };
  
  return mapping[fieldName] || fieldName.toLowerCase();
}

/**
 * Récupère la valeur d'un champ du médecin
 */
function getMedecinValue(medecin: MedecinData, fieldName: string): any {
  const mapping: Record<string, keyof MedecinData> = {
    'nom': 'Nom',
    'Nom': 'Nom',
    'prenom': 'Prénom',
    'Prénom': 'Prénom',
    'sect_act': 'SECT ACT',
    'SECT ACT': 'SECT ACT',
    'semaine': 'Semaine',
    'Semaine': 'Semaine',
    'structure': 'STRUCTURE',
    'STRUCTURE': 'STRUCTURE',
    'nom_compte': 'Nom du compte',
    'Nom du compte': 'Nom du compte',
    'specialite': 'SPECIALITE',
    'SPECIALITE': 'SPECIALITE',
    'potentiel': 'POTENTIEL',
    'POTENTIEL': 'POTENTIEL',
    'ville': 'VILLE',
    'VILLE': 'VILLE',
    'adresse': 'ADRESSE',
    'ADRESSE': 'ADRESSE'
  };
  
  const key = mapping[fieldName] || fieldName as keyof MedecinData;
  return medecin[key];
}

/**
 * Fonction de compatibilité avec l'ancien code
 * @deprecated Utilisez saveMedecinDataWithUpsert à la place
 */
export async function saveMedecinData(
  fileId: string,
  medecins: MedecinData[]
): Promise<void> {
  const result = await saveMedecinDataWithUpsert(fileId, medecins);
  
  if (result.conflicts.length > 0) {
    console.warn(`Avertissement: ${result.conflicts.length} conflits détectés lors de la sauvegarde.`);
    console.warn(`Résumé: ${result.inserted} insertions, ${result.updated} mises à jour, ${result.skipped} ignorés`);
  }
}

/**
 * Obtient des statistiques sur les données existantes
 */
export async function getMedecinStats(): Promise<{
  totalRecords: number;
  uniqueNames: number;
  citiesCount: number;
  specialtiesCount: number;
}> {
  const { data: totalData } = await supabase
    .from('medecin')
    .select('id', { count: 'exact' });

  const { data: uniqueNamesData } = await supabase
    .from('medecin')
    .select('nom, prenom')
    .group('nom, prenom');

  const { data: citiesData } = await supabase
    .from('medecin')
    .select('ville')
    .not('ville', 'is', null)
    .group('ville');

  const { data: specialtiesData } = await supabase
    .from('medecin')
    .select('specialite')
    .not('specialite', 'is', null)
    .group('specialite');
  
  return {
    totalRecords: totalData?.length || 0,
    uniqueNames: uniqueNamesData?.length || 0,
    citiesCount: citiesData?.length || 0,
    specialtiesCount: specialtiesData?.length || 0
  };
}

/**
 * Recherche des doublons potentiels dans la base de données
 */
export async function findPotentialDuplicates(): Promise<Array<{
  group: string;
  count: number;
  records: any[];
}>> {
  // Cette fonction nécessiterait une requête SQL plus complexe
  // Pour Supabase, on peut utiliser une approche simplifiée
  const { data, error } = await supabase
    .from('medecin')
    .select('*');

  if (error || !data) {
    return [];
  }

  const groups = new Map<string, any[]>();
  
  data.forEach(record => {
    const key = `${record.nom?.toLowerCase()}|${record.prenom?.toLowerCase()}|${record.ville?.toLowerCase()}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(record);
  });

  return Array.from(groups.entries())
    .filter(([_, records]) => records.length > 1)
    .map(([key, records]) => ({
      group: key,
      count: records.length,
      records
    }))
    .sort((a, b) => b.count - a.count);
}

