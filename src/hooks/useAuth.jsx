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
      console.log('🔐 Auth state change:', event, session?.user?.email)
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
      console.log('📥 Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Profile not found, will create one')
          // Try to create a profile for existing users
          await createProfileForExistingUser(userId)
        } else {
          console.error('❌ Error fetching profile:', error)
          setProfile(null)
        }
      } else {
        console.log('✅ Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const createProfileForExistingUser = async (userId) => {
    try {
      console.log('🔧 Creating profile for existing user:', userId)
      
      // Get user metadata from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('❌ No user found for profile creation')
        return
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (existingProfile) {
        console.log('✅ Profile already exists for user:', existingProfile)
        setProfile(existingProfile)
        return
      }

      console.log('📝 Creating profile using database function...')

      // Use the database function to create the profile
      const { error } = await supabase.rpc('create_profile_for_user', { user_id: userId })
      
      if (error) {
        console.error('❌ Failed to create profile using database function:', error)
        setProfile(null)
      } else {
        console.log('✅ Profile created successfully using database function')
        // Wait a moment and try to fetch the profile
        setTimeout(async () => {
          await fetchProfile(userId)
        }, 500)
      }
    } catch (error) {
      console.error('❌ Error creating profile for existing user:', error)
      setProfile(null)
    }
  }

  const signUp = async (email, password, profileData) => {
    try {
      console.log('🚀 Starting signup process for:', email)
      console.log('📝 Profile data:', profileData)
      
      // Create user account with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profileData.full_name,
            phone: profileData.phone,
            city: profileData.city,
            age: profileData.age
          },
          emailRedirectTo: `${window.location.origin}/confirm-email`
        }
      })

      if (authError) {
        console.error('❌ Auth signup error:', authError)
        return { data: null, error: authError }
      }

      if (authData.user) {
        console.log('✅ User account created:', authData.user.id)
        
        // Profile should be created automatically by the database trigger
        // We just need to wait a moment for it to be created
        console.log('⏳ Waiting for profile creation...')
        
        // Set the user immediately
        setUser(authData.user)
        
        // Try to fetch the profile after a short delay
        setTimeout(async () => {
          try {
            await fetchProfile(authData.user.id)
          } catch (profileError) {
            console.error('❌ Profile fetch error after signup:', profileError)
          }
        }, 1000)
        
        return { data: { user: authData.user }, error: null }
      }

      return { data: null, error: { message: 'Signup completed but user not created' } }
    } catch (error) {
      console.error('❌ Error in signup:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Sign in error:', error)
        return { data: null, error }
      }
      
      if (data?.user) {
        console.log('✅ Sign in successful for:', data.user.email)
        // Profile will be fetched automatically by the auth state change listener
        return { data, error: null }
      }
      
      return { data: null, error: { message: 'Sign in failed' } }
    } catch (error) {
      console.error('❌ Error in signIn:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user:', user?.email)
      
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Signout error:', error)
      } else {
        console.log('✅ Signout successful')
      }
      
      return { error: null }
    } catch (error) {
      console.error('❌ Error in signOut:', error)
      // Even if there's an error, clear local state
      setUser(null)
      setProfile(null)
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) {
        throw new Error('No authenticated user')
      }

      console.log('📝 Updating profile for user:', user.id, 'with updates:', updates)
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Profile update error:', error)
        return { data: null, error }
      }

      console.log('✅ Profile updated successfully:', data)
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Error in updateProfile:', error)
      return { data: null, error }
    }
  }

  const completeOnboarding = async (skillLevel, responses) => {
    try {
      if (!user?.id) {
        throw new Error('No authenticated user')
      }

      console.log('🎯 Completing onboarding for user:', user.id, 'with skill level:', skillLevel)
      console.log('📝 Responses to save:', responses)
      
      // Save onboarding responses
      if (responses && responses.length > 0) {
        const responseData = responses.map(response => ({
          user_id: user.id,
          question_id: response.question_id,
          answer: response.answer,
          points_beginner: response.points_beginner,
          points_intermediate: response.points_intermediate,
          points_professional: response.points_professional
        }))

        console.log('💾 Saving onboarding responses:', responseData)
        
        const { data: savedResponses, error: responsesError } = await supabase
          .from('onboarding_responses')
          .insert(responseData)
          .select()

        if (responsesError) {
          console.error('❌ Failed to save onboarding responses:', responsesError)
          console.error('❌ Error details:', {
            code: responsesError.code,
            message: responsesError.message,
            details: responsesError.details,
            hint: responsesError.hint
          })
          return { data: null, error: responsesError }
        }
        
        console.log('✅ Onboarding responses saved successfully:', savedResponses)
      }

      // Update profile with skill level
      console.log('📝 Updating profile with skill level:', skillLevel)
      
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
        console.error('❌ Profile update error:', error)
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        return { data: null, error }
      }

      console.log('✅ Onboarding completed successfully:', data)
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Error in completeOnboarding:', error)
      return { data: null, error }
    }
  }

  const completeOnboardingAfterConfirmation = async () => {
    try {
      console.log('🎯 Completing onboarding after email confirmation...')
      
      // Get stored onboarding data
      const storedData = localStorage.getItem('pendingOnboardingAnswers')
      if (!storedData) {
        console.log('❌ No pending onboarding data found')
        return { success: false, error: 'No pending onboarding data' }
      }
      
      const { answers, skillLevel, userId } = JSON.parse(storedData)
      console.log('📊 Retrieved stored data:', { answers, skillLevel, userId })
      
      if (!user?.id || user.id !== userId) {
        console.log('❌ User ID mismatch or no user')
        return { success: false, error: 'User ID mismatch' }
      }
      
      // Convert answers to database format
      const responses = Object.entries(answers).map(([questionId, option]) => {
        // Skip default questions
        if (questionId.startsWith('default-')) {
          console.warn('⚠️ Skipping default question:', questionId)
          return null
        }
        
        return {
          question_id: questionId,
          answer: option.text,
          points_beginner: option.points.beginner,
          points_intermediate: option.points.intermediate,
          points_professional: option.points.professional
        }
      }).filter(Boolean)
      
      if (responses.length === 0) {
        console.log('❌ No valid responses to save')
        return { success: false, error: 'No valid responses' }
      }
      
      console.log('📝 Saving onboarding responses:', responses)
      
      // Save responses to database
      const { error: responsesError } = await supabase
        .from('onboarding_responses')
        .insert(responses)
      
      if (responsesError) {
        console.error('❌ Error saving responses:', responsesError)
        return { success: false, error: responsesError.message }
      }
      
      // Update profile with skill level and onboarding completion
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
        skill_level: skillLevel,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (profileError) {
        console.error('❌ Error updating profile:', profileError)
        return { success: false, error: profileError.message }
      }
      
      // Clear stored data
      localStorage.removeItem('pendingOnboardingAnswers')
      
      console.log('✅ Onboarding completed successfully after confirmation')
      return { success: true, skillLevel, responsesCount: responses.length }
      
    } catch (error) {
      console.error('❌ Error completing onboarding after confirmation:', error)
      return { success: false, error: error.message }
    }
  }

  const testDatabasePermissions = async () => {
    try {
      console.log('🧪 Testing database permissions...')
      
      if (!user?.id) {
        console.log('❌ No authenticated user')
        return { success: false, error: 'No authenticated user' }
      }

      console.log('👤 Testing for user:', user.id, user.email)

      // Test if we can read from profiles
      const { data: profileTest, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('❌ Profile read test failed:', profileError)
        return { 
          success: false, 
          error: profileError.message || 'Profile read failed',
          test: 'profile_read',
          details: {
            code: profileError.code,
            hint: profileError.hint
          }
        }
      }

      console.log('✅ Profile read test passed:', profileTest)

      // Test if we can read from onboarding_responses
      const { data: responsesTest, error: responsesError } = await supabase
        .from('onboarding_responses')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (responsesError) {
        console.error('❌ Onboarding responses read test failed:', responsesError)
        return { 
          success: false, 
          error: responsesError.message || 'Responses read failed',
          test: 'responses_read',
          details: {
            code: responsesError.code,
            hint: responsesError.hint
          }
        }
      }

      console.log('✅ Onboarding responses read test passed:', responsesTest)

      // Test if we can update profiles (for onboarding completion)
      const { data: updateTest, error: updateError } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select('id, updated_at')
        .single()

      if (updateError) {
        console.error('❌ Profile update test failed:', updateError)
        return { 
          success: false, 
          error: updateError.message || 'Profile update failed',
          test: 'profile_update',
          details: {
            code: updateError.code,
            hint: updateError.hint
          }
        }
      }

      console.log('✅ Profile update test passed:', updateTest)

      return { 
        success: true, 
        message: 'All database permission tests passed',
        tests: ['profile_read', 'responses_read', 'profile_update'],
        user: {
          id: user.id,
          email: user.email
        }
      }
    } catch (error) {
      console.error('❌ Database permissions test failed:', error)
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred',
        test: 'general',
        details: {
          message: error.message,
          stack: error.stack
        }
      }
    }
  }

  const testSupabaseConnection = async () => {
    try {
      console.log('🔌 Testing Supabase connection...')
      
      // Test basic connection by getting the current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ Auth connection test failed:', userError)
        return { success: false, error: userError.message, test: 'auth_connection' }
      }
      
      console.log('✅ Auth connection test passed:', currentUser?.email || 'No user')
      
      // Test basic database connection by checking if we can query a simple table
      const { data: testData, error: dbError } = await supabase
        .from('onboarding_questions')
        .select('id')
        .limit(1)
      
      if (dbError) {
        console.error('❌ Database connection test failed:', dbError)
        return { success: false, error: dbError.message, test: 'database_connection' }
      }
      
      console.log('✅ Database connection test passed:', testData?.length || 0, 'questions found')
      
      return { 
        success: true, 
        message: 'Supabase connection test passed',
        tests: ['auth_connection', 'database_connection'],
        user: currentUser?.email || 'No user authenticated'
      }
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error)
      return { 
        success: false, 
        error: error.message || 'Unknown error',
        test: 'connection_test'
      }
    }
  }

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking current authentication state...')
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Session check error:', sessionError)
        return { authenticated: false, error: sessionError.message }
      }
      
      if (session?.user) {
        console.log('✅ User is authenticated:', session.user.email)
        console.log('🔑 Session expires at:', session.expires_at)
        
        // Check if session is expired
        const now = Math.floor(Date.now() / 1000)
        if (session.expires_at && session.expires_at < now) {
          console.log('⚠️ Session expired, signing out user')
          await signOut()
          return { authenticated: false, error: 'Session expired' }
        }
        
        return { authenticated: true, user: session.user }
      } else {
        console.log('❌ No active session found')
        return { authenticated: false, error: 'No active session' }
      }
    } catch (error) {
      console.error('❌ Auth state check error:', error)
      return { authenticated: false, error: error.message }
    }
  }

  const refreshSession = async () => {
    try {
      console.log('🔄 Refreshing authentication session...')
      
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('❌ Session refresh error:', error)
        return { success: false, error: error.message }
      }
      
      if (data.session) {
        console.log('✅ Session refreshed successfully')
        setUser(data.session.user)
        return { success: true, user: data.session.user }
      } else {
        console.log('❌ No session returned from refresh')
        return { success: false, error: 'No session returned' }
      }
    } catch (error) {
      console.error('❌ Session refresh error:', error)
      return { success: false, error: error.message }
    }
  }

  const checkEmailConfirmation = async () => {
    try {
      console.log('📧 Checking email confirmation status...')
      
      if (!user?.email) {
        return { confirmed: false, error: 'No user email found' }
      }

      // Check if user needs email confirmation
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ Error getting user:', userError)
        return { confirmed: false, error: userError.message }
      }

      if (!currentUser) {
        return { confirmed: false, error: 'No user found' }
      }

      // Check if email is confirmed
      if (currentUser.email_confirmed_at) {
        console.log('✅ Email is confirmed:', currentUser.email_confirmed_at)
        return { confirmed: true, confirmedAt: currentUser.email_confirmed_at }
      } else {
        console.log('⚠️ Email not confirmed yet')
        return { confirmed: false, error: 'Email not confirmed' }
      }
    } catch (error) {
      console.error('❌ Email confirmation check error:', error)
      return { confirmed: false, error: error.message }
    }
  }

  const resendConfirmationEmail = async () => {
    try {
      console.log('📧 Resending confirmation email...')
      
      if (!user?.email) {
        return { success: false, error: 'No user email found' }
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      })

      if (error) {
        console.error('❌ Error resending confirmation:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Confirmation email resent successfully')
      return { success: true, message: 'Confirmation email sent' }
    } catch (error) {
      console.error('❌ Error resending confirmation email:', error)
      return { success: false, error: error.message }
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
    completeOnboardingAfterConfirmation,
    refreshProfile: () => user && fetchProfile(user.id),
    confirmEmail: async () => {
      if (user) {
        // Complete onboarding after email confirmation
        await completeOnboardingAfterConfirmation()
        // Refresh the profile
        await fetchProfile(user.id)
      }
    },
    testDatabasePermissions,
    testSupabaseConnection,
    checkAuthState,
    refreshSession,
    checkEmailConfirmation,
    resendConfirmationEmail,
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
