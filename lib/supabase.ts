import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Base types for individual tables
export interface Tournament {
  tournament_id: number
  tournament_name: string
  tournament_year: number
  start_date?: string
  end_date?: string
  location?: string
}

export interface Team {
  team_id: number
  team_name: string
}

export interface Player {
  player_id: number
  player_name: string
}

// PlayerStat type with optional joined data
export interface PlayerStat {
  stat_id: number
  tournament_id: number
  player_id: number
  team_id: number
  match_played: number
  sets_played: number
  sets_won: number
  legs_played: number
  legs_diff: number
  legs_won: number
  scores_100_plus: number
  scores_140_plus: number
  scores_170_plus: number
  scores_180: number
  high_finish: number
  finishes_100_plus: number
  best_leg: number
  worst_leg: number
  win_rate_sets: number
  win_rate_legs: number
  three_dart_avg: number
  one_dart_avg: number
  first_9_avg: number
  keep_rate: number
  break_rate: number
  second_legs: number
  break_legs: number
  total_score: number
  total_darts: number
  group_number?: number
  
  // Joined data (optional, depends on query)
  players?: Pick<Player, 'player_name'>
  teams?: Pick<Team, 'team_name'>
  tournaments?: Pick<Tournament, 'tournament_name' | 'tournament_year'>
  
  // Legacy fields for backward compatibility
  player_name?: string
  team_name?: string
  tournament_name?: string
}

// Type for PlayerStat with guaranteed joined data
export interface PlayerStatWithJoins extends PlayerStat {
  players: Pick<Player, 'player_name'>
  teams: Pick<Team, 'team_name'>
  tournaments: Pick<Tournament, 'tournament_name' | 'tournament_year'>
}
