export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            favorites: {
                Row: {
                    id: string
                    user_id: string
                    media_id: number
                    media_type: 'movie' | 'tv'
                    title: string
                    poster_path: string | null
                    backdrop_path: string | null
                    vote_average: number | null
                    release_date: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    media_id: number
                    media_type: 'movie' | 'tv'
                    title: string
                    poster_path?: string | null
                    backdrop_path?: string | null
                    vote_average?: number | null
                    release_date?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    media_id?: number
                    media_type?: 'movie' | 'tv'
                    title?: string
                    poster_path?: string | null
                    backdrop_path?: string | null
                    vote_average?: number | null
                    release_date?: string | null
                    created_at?: string
                }
            }
            watch_history: {
                Row: {
                    id: string
                    user_id: string
                    media_id: number
                    media_type: 'movie' | 'tv'
                    title: string
                    poster_path: string | null
                    backdrop_path: string | null
                    progress: number
                    season_number: number | null
                    episode_number: number | null
                    last_watched_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    media_id: number
                    media_type: 'movie' | 'tv'
                    title: string
                    poster_path?: string | null
                    backdrop_path?: string | null
                    progress?: number
                    season_number?: number | null
                    episode_number?: number | null
                    last_watched_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    media_id?: number
                    media_type?: 'movie' | 'tv'
                    title?: string
                    poster_path?: string | null
                    backdrop_path?: string | null
                    progress?: number
                    season_number?: number | null
                    episode_number?: number | null
                    last_watched_at?: string
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
