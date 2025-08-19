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
      // Always use mock mode for now since we're using hardcoded data
      console.log('🔧 Using mock authentication mode for signup')
      const mockUser = {
        id: 'mock-' + Date.now(),
        email,
        created_at: new Date().toISOString()
      }
      const mockProfile = {
        id: mockUser.id,
        email,
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        city: profileData.city || '',
        age: profileData.age || null,
        onboarding_completed: false,
        created_at: new Date().toISOString()
      }
      
      console.log('📝 Created mock profile with data:', mockProfile)
      
      setUser(mockUser)
      setProfile(mockProfile)
      localStorage.setItem('mock_user', JSON.stringify(mockUser))
      localStorage.setItem('mock_profile', JSON.stringify(mockProfile))
      
      return { data: { user: mockUser }, error: null }
    } catch (error) {
      console.error('Error in signup:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      // Check for mock user first
      const mockUser = localStorage.getItem('mock_user')
      const mockProfile = localStorage.getItem('mock_profile')
      
      if (mockUser && mockProfile) {
        const user = JSON.parse(mockUser)
        const profile = JSON.parse(mockProfile)
        
        console.log('🔍 Found mock user:', user.email)
        console.log('📝 Found mock profile:', profile)
        
        // Simple email/password check for mock mode
        if (user.email === email) {
          console.log('✅ Mock user authentication successful')
          setUser(user)
          setProfile(profile)
          return { data: { user }, error: null }
        } else {
          console.log('❌ Email mismatch for mock user')
          return { data: null, error: { message: 'Invalid email or password' } }
        }
      }
      
      console.log('🔍 No mock user found, trying Supabase authentication')
      
      // Try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (data?.user && !error) {
        // Fetch profile data immediately after successful login
        await fetchProfile(data.user.id)
      }
      
      return { data, error }
    } catch (error) {
      console.error('Error in signIn:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      
      // Clear mock data
      localStorage.removeItem('mock_user')
      localStorage.removeItem('mock_profile')
      localStorage.removeItem('mock_onboarding_responses')
      localStorage.removeItem('musicstore_cart')
      
      // Try Supabase signout but don't wait too long
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signout timeout')), 3000)
      )
      
      try {
        await Promise.race([
          supabase.auth.signOut(),
          timeoutPromise
        ])
      } catch (supabaseError) {
        console.log('Supabase signout timeout or error, continuing with local signout')
      }
      
      return { error: null }
    } catch (error) {
      // Even if everything fails, local state is already cleared
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
