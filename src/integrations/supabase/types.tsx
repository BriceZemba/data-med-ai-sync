// integrations/supabase/types.tsx
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/* ----------------------------------------------------------
   1.  Generated with:
       npx supabase gen types typescript --project-id kwrokfbropptrbzvpwct --schema public
----------------------------------------------------------- */
export interface Database {
  public: {
    Tables: {
      medecin: {
        Row: {
          id: number
          file_id: string
          nom: string
          prenom: string
          sect_act: string | null
          semaine: string | null
          structure: string | null
          nom_compte: string | null
          specialite: string | null
          potentiel: string | null
          ville: string | null
          adresse: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          file_id: string
          nom: string
          prenom: string
          sect_act?: string | null
          semaine?: string | null
          structure?: string | null
          nom_compte?: string | null
          specialite?: string | null
          potentiel?: string | null
          ville?: string | null
          adresse?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          file_id?: string
          nom?: string
          prenom?: string
          sect_act?: string | null
          semaine?: string | null
          structure?: string | null
          nom_compte?: string | null
          specialite?: string | null
          potentiel?: string | null
          ville?: string | null
          adresse?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/* ----------------------------------------------------------
   2.  Quick aliases for daily usage
----------------------------------------------------------- */
export type MedecinRow        = Database['public']['Tables']['medecin']['Row']
export type MedecinInsert     = Database['public']['Tables']['medecin']['Insert']
export type MedecinUpdate     = Database['public']['Tables']['medecin']['Update']