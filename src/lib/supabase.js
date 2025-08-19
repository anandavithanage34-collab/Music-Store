import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibrcrjebxcnqlkiwsodp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicmNyamVieGNucWxraXdzb2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NjkyMzcsImV4cCI6MjA3MTE0NTIzN30.pd4UPmwedlMgtC4g9wGpIun9H2el_nbAK7vHUdNtCOo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Schema for Sri Lankan Music Store
export const createDatabaseSchema = async () => {
  // This will contain all our table creation scripts
  // We'll implement this once Supabase MCP authentication is working
}
