// integrations/supabase/db.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/* ------------------------------------------------------------------ */
/* 1.  Domain types                                                   */
/* ------------------------------------------------------------------ */
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

export interface UpsertConfig {
  uniqueKeys: string[];
  conflictStrategy: 'update' | 'skip' | 'error';
  updateColumns?: string[];
  shouldUpdate?: (existing: any, incoming: MedecinData) => boolean;
}

/* ------------------------------------------------------------------ */
/* 2.  Storage helpers                                                */
/* ------------------------------------------------------------------ */
export async function saveFile(
  userId: string,
  file: File,
  supabase: SupabaseClient<Database>
): Promise<string> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const safeName = file.name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase();

  const { data, error } = await supabase.storage
    .from('uploaded-files')
    .upload(`${userId}/${safeName}-${Date.now()}`, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return data.path;
}

/* ------------------------------------------------------------------ */
/* 3.  Upsert logic                                                   */
/* ------------------------------------------------------------------ */
export async function saveMedecinDataWithUpsert(
  fileId: string,
  medecins: MedecinData[],
  config: UpsertConfig,
  supabase: SupabaseClient<Database>
): Promise<UpsertResult> {
  const result: UpsertResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    total: medecins.length,
    conflicts: [],
  };

  for (const medecin of medecins) {
    try {
      let query = supabase.from('medecin').select('*');
      config.uniqueKeys.forEach((k) => {
        const col = convertToDbColumn(k);
        const val = getMedecinValue(medecin, k);
        query = query.ilike(col, val);
      });

      const { data: existing, error: searchError } = await query;
      if (searchError) throw searchError;

      if (existing?.length) {
        const record = existing[0];
        switch (config.conflictStrategy) {
          case 'update':
            if (!config.shouldUpdate || config.shouldUpdate(record, medecin)) {
              await updateRecord(supabase, record.id, medecin, config.updateColumns ?? []);
              result.updated++;
              result.conflicts.push({ row: medecin, reason: `Updated ID ${record.id}`, action: 'updated' });
            } else {
              result.skipped++;
              result.conflicts.push({ row: medecin, reason: 'Skipped (newer)', action: 'skipped' });
            }
            break;
          case 'skip':
            result.skipped++;
            result.conflicts.push({ row: medecin, reason: 'Duplicate skipped', action: 'skipped' });
            break;
          case 'error':
            throw new Error(`Duplicate: ${medecin.Nom} ${medecin.Prénom} à ${medecin.VILLE}`);
        }
      } else {
        await insertRecord(supabase, fileId, medecin);
        result.inserted++;
      }
    } catch (err) {
      console.error(err);
      result.skipped++;
      result.conflicts.push({ row: medecin, reason: String(err), action: 'skipped' });
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* 4.  CRUD helpers                                                   */
/* ------------------------------------------------------------------ */
async function insertRecord(supabase: SupabaseClient<Database>, fileId: string, m: MedecinData) {
  const { error } = await supabase.from('medecin').insert({
    file_id: fileId,
    nom: m.Nom,
    prenom: m.Prénom,
    sect_act: m['SECT ACT'],
    semaine: m.Semaine,
    structure: m.STRUCTURE,
    nom_compte: m['Nom du compte'],
    specialite: m.SPECIALITE,
    potentiel: m.POTENTIEL,
    ville: m.VILLE,
    adresse: m.ADRESSE,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Insert failed: ${error.message}`);
}

async function updateRecord(
  supabase: SupabaseClient<Database>,
  id: number,
  m: MedecinData,
  cols: string[]
) {
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  cols.forEach((c) => (updates[convertToDbColumn(c)] = getMedecinValue(m, c)));
  const { error } = await supabase.from('medecin').update(updates).eq('id', id);
  if (error) throw new Error(`Update failed: ${error.message}`);
}

/* ------------------------------------------------------------------ */
/* 5.  Utility mappers                                                */
/* ------------------------------------------------------------------ */
const FIELD_MAP: Record<string, string> = {
  Nom: 'nom',
  Prénom: 'prenom',
  'SECT ACT': 'sect_act',
  Semaine: 'semaine',
  STRUCTURE: 'structure',
  'Nom du compte': 'nom_compte',
  SPECIALITE: 'specialite',
  POTENTIEL: 'potentiel',
  VILLE: 'ville',
  ADRESSE: 'adresse',
};

function convertToDbColumn(key: string): string {
  return FIELD_MAP[key] ?? key.toLowerCase();
}

function getMedecinValue(m: MedecinData, key: string): string {
  return m[key as keyof MedecinData] as string;
}

/* ------------------------------------------------------------------ */
/* 6.  Legacy / Stats / Dups                                          */
/* ------------------------------------------------------------------ */
export async function saveMedecinData(fileId: string, ms: MedecinData[], s: SupabaseClient<Database>) {
  
  const res = await saveMedecinDataWithUpsert(fileId, ms, {}, s);
  if (res.conflicts.length) {
    console.warn(`${res.conflicts.length} conflicts`, res);
  }
}

export async function getMedecinStats(supabase: SupabaseClient<Database>) {
  const [
    { count: totalRecords },
    { data: names },
    { data: cities },
    { data: specs },
  ] = await Promise.all([
    supabase.from('medecin').select('*', { count: 'exact', head: true }),
    supabase.from('medecin').select('nom, prenom'),
    supabase.from('medecin').select('ville').not('ville', 'is', null),
    supabase.from('medecin').select('specialite').not('specialite', 'is', null),
  ]);

  return {
    totalRecords: totalRecords ?? 0,
    uniqueNames: names?.length ?? 0,
    citiesCount: cities?.length ?? 0,
    specialtiesCount: specs?.length ?? 0,
  };
}

export async function findPotentialDuplicates(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from('medecin').select('*');
  if (error || !data) return [];

  const groups = new Map<string, any[]>();
  data.forEach((r) => {
    const key = `${r.nom}|${r.prenom}|${r.ville}`.toLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), r]);
  });

  return Array.from(groups.entries())
    .filter(([, rs]) => rs.length > 1)
    .map(([k, rs]) => ({ group: k, count: rs.length, records: rs }))
    .sort((a, b) => b.count - a.count);
}