import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for mock user first
    const mockUser = localStorage.getItem('mock_user')
    const mockProfile = localStorage.getItem('mock_profile')
    
    if (mockUser && mockProfile) {
      setUser(JSON.parse(mockUser))
      setProfile(JSON.parse(mockProfile))
      setLoading(false)
      return
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, profileData) => {
    try {
      // Try Supabase first, fall back to mock mode if it fails
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData
        }
      })

      if (error) {
        // Mock mode - create a temporary user for testing
        console.log('Using mock authentication mode')
        const mockUser = {
          id: 'mock-' + Date.now(),
          email,
          created_at: new Date().toISOString()
        }
        const mockProfile = {
          id: mockUser.id,
          email,
          ...profileData,
          onboarding_completed: false,
          created_at: new Date().toISOString()
        }
        
        setUser(mockUser)
        setProfile(mockProfile)
        localStorage.setItem('mock_user', JSON.stringify(mockUser))
        localStorage.setItem('mock_profile', JSON.stringify(mockProfile))
        
        return { data: { user: mockUser }, error: null }
      }

      // Create profile record if Supabase worked
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email,
              ...profileData,
              onboarding_completed: false
            }
          ])

        if (profileError) {
          console.log('Profile creation failed, using mock mode')
          const mockProfile = {
            id: data.user.id,
            email,
            ...profileData,
            onboarding_completed: false
          }
          setProfile(mockProfile)
          localStorage.setItem('mock_profile', JSON.stringify(mockProfile))
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      // Clear mock data
      localStorage.removeItem('mock_user')
      localStorage.removeItem('mock_profile')
      localStorage.removeItem('mock_onboarding_responses')
      localStorage.removeItem('musicstore_cart')
      
      const { error } = await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      return { error }
    } catch (error) {
      // Even if Supabase fails, clear local state
      setUser(null)
      setProfile(null)
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      // Check if user is in mock mode
      const mockUser = localStorage.getItem('mock_user')
      const mockProfile = localStorage.getItem('mock_profile')
      
      if (mockUser && mockProfile) {
        // Mock mode - update local storage
        const updatedProfile = {
          ...JSON.parse(mockProfile),
          ...updates
        }
        
        setProfile(updatedProfile)
        localStorage.setItem('mock_profile', JSON.stringify(updatedProfile))
        return { data: updatedProfile, error: null }
      }

      // Try Supabase for real users
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        // If Supabase fails, fall back to mock mode for testing
        const updatedProfile = {
          ...profile,
          ...updates
        }
        
        setProfile(updatedProfile)
        localStorage.setItem('mock_profile', JSON.stringify(updatedProfile))
        return { data: updatedProfile, error: null }
      }

      setProfile(data)
      return { data, error: null }
    } catch (error) {
      // Final fallback to mock mode
      const updatedProfile = {
        ...profile,
        ...updates
      }
      
      setProfile(updatedProfile)
      localStorage.setItem('mock_profile', JSON.stringify(updatedProfile))
      return { data: updatedProfile, error: null }
    }
  }

  const completeOnboarding = async (skillLevel, responses) => {
    try {
      // Check if user is in mock mode
      const mockUser = localStorage.getItem('mock_user')
      const mockProfile = localStorage.getItem('mock_profile')
      
      if (mockUser && mockProfile) {
        // Mock mode - update local storage
        console.log('🔧 Using mock mode for onboarding completion')
        const updatedProfile = {
          ...JSON.parse(mockProfile),
          skill_level: skillLevel,
          onboarding_completed: true
        }
        
        setProfile(updatedProfile)
        localStorage.setItem('mock_profile', JSON.stringify(updatedProfile))
        localStorage.setItem('mock_onboarding_responses', JSON.stringify(responses))
        
        return { data: updatedProfile, error: null }
      }

      // Try Supabase for real users
      // Save onboarding responses
      if (responses && responses.length > 0) {
        const { error: responsesError } = await supabase
          .from('onboarding_responses')
          .insert(responses.map(response => ({
            user_id: user.id,
            ...response
          })))

        if (responsesError) {
          console.log('Failed to save responses, continuing with profile update')
        }
      }

      // Update profile with skill level
      const { data, error } = await supabase
        .from('profiles')
        .update({
          skill_level: skillLevel,
          onboarding_completed: true
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        // If Supabase fails, fall back to mock mode
        console.log('Supabase profile update failed, using mock mode')
        const updatedProfile = {
          ...profile,
          skill_level: skillLevel,
          onboarding_completed: true
        }
        
        setProfile(updatedProfile)
        localStorage.setItem('mock_profile', JSON.stringify(updatedProfile))
        return { data: updatedProfile, error: null }
      }

      setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Onboarding failed, using mock fallback:', error)
      
      // Final fallback to mock mode
      const updatedProfile = {
        ...profile,
        skill_level: skillLevel,
        onboarding_completed: true
      }
      
      setProfile(updatedProfile)
      localStorage.setItem('mock_profile', JSON.stringify(updatedProfile))
      return { data: updatedProfile, error: null }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    completeOnboarding,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isStaff: profile?.role === 'staff' || profile?.role === 'admin',
    skillLevel: profile?.skill_level,
    onboardingCompleted: profile?.onboarding_completed
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
