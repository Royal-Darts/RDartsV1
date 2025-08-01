import { supabase } from './supabase'
import type { PlayerStat, PlayerStatWithJoins } from './supabase'

export async function getTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('tournament_year', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('team_name')
  
  if (error) throw error
  return data
}

export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('player_name')
  
  if (error) throw error
  return data
}

export async function getPlayerStats(filters?: {
  tournamentId?: number
  teamId?: number
  playerId?: number
}): Promise<PlayerStatWithJoins[]> {
  let query = supabase
    .from('player_stats')
    .select(`
      *,
      players!inner(player_name),
      teams!inner(team_name),
      tournaments!inner(tournament_name, tournament_year)
    `)

  if (filters?.tournamentId) {
    query = query.eq('tournament_id', filters.tournamentId)
  }
  if (filters?.teamId) {
    query = query.eq('team_id', filters.teamId)
  }
  if (filters?.playerId) {
    query = query.eq('player_id', filters.playerId)
  }

  const { data, error } = await query.order('three_dart_avg', { ascending: false })
  
  if (error) throw error
  return data as PlayerStatWithJoins[]
}

export async function getTopPerformers(
  metric: string = 'three_dart_avg', 
  limit: number = 10
): Promise<PlayerStatWithJoins[]> {
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      *,
      players!inner(player_name),
      teams!inner(team_name),
      tournaments!inner(tournament_name, tournament_year)
    `)
    .order(metric, { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as PlayerStatWithJoins[]
}

export async function getPlayerPerformanceOverTime(playerId: number): Promise<PlayerStatWithJoins[]> {
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      *,
      tournaments!inner(tournament_name, tournament_year)
    `)
    .eq('player_id', playerId)
    .order('tournaments(tournament_year)', { ascending: true })
  
  if (error) throw error
  return data as PlayerStatWithJoins[]
}
