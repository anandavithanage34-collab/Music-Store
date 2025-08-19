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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkStoredUser = async () => {
      try {
        const storedUser = localStorage.getItem('harmony_house_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          console.log('📥 Found stored user:', userData.email || userData.username)
          
          // If it's an admin user, just set it (hardcoded credentials don't need DB verification)
          if (userData.role === 'admin') {
            console.log('✅ Admin user restored from storage')
            setUser(userData)
          } else {
            // Verify regular user still exists in database
            const { data, error } = await supabase.rpc('get_user_by_id', {
              p_user_id: userData.id
            })
            
            if (error) {
              console.error('❌ Error verifying stored user:', error)
              localStorage.removeItem('harmony_house_user')
              setUser(null)
            } else if (data.success) {
              console.log('✅ User verified from database:', data.user.email)
              setUser(data.user)
            } else {
              console.log('❌ User not found in database, clearing storage')
              localStorage.removeItem('harmony_house_user')
              setUser(null)
            }
          }
        }
      } catch (error) {
        console.error('❌ Error checking stored user:', error)
        localStorage.removeItem('harmony_house_user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkStoredUser()
  }, [])

  const signUp = async (email, password, profileData) => {
    try {
      console.log('🚀 Starting custom registration for:', email)
      console.log('📝 Profile data:', profileData)
      
      const { data, error } = await supabase.rpc('register_user', {
        p_email: email,
        p_password: password,
        p_full_name: profileData.full_name,
        p_phone: profileData.phone,
        p_city: profileData.city,
        p_age: profileData.age
      })

      if (error) {
        console.error('❌ Registration error:', error)
        return { data: null, error }
      }

      if (!data.success) {
        console.error('❌ Registration failed:', data.error)
        return { data: null, error: { message: data.error } }
      }

      console.log('✅ User registered successfully:', data.user.email)
      
      // Store user in localStorage and state
      localStorage.setItem('harmony_house_user', JSON.stringify(data.user))
      setUser(data.user)
      
      return { data: { user: data.user }, error: null }
    } catch (error) {
      console.error('❌ Error in registration:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Attempting custom sign in for:', email)
      
      const { data, error } = await supabase.rpc('authenticate_user', {
        p_email: email,
        p_password: password
      })
      
      if (error) {
        console.error('❌ Authentication error:', error)
        return { data: null, error }
      }
      
      if (!data.success) {
        console.error('❌ Authentication failed:', data.error)
        return { data: null, error: { message: data.error } }
      }
      
      console.log('✅ Authentication successful for:', data.user.email)
      
      // Store user in localStorage and state
      localStorage.setItem('harmony_house_user', JSON.stringify(data.user))
      setUser(data.user)
      
      return { data: { user: data.user }, error: null }
    } catch (error) {
      console.error('❌ Error in sign in:', error)
      return { data: null, error }
    }
  }

  const signInAdmin = async (username, password) => {
    try {
      console.log('🔐 Attempting admin login:', username)
      
      const { data, error } = await supabase.rpc('authenticate_admin', {
        p_username: username,
        p_password: password
      })

      if (error) {
        console.error('❌ Admin login error:', error)
        return { data: null, error }
      }

      if (!data.success) {
        console.error('❌ Admin login failed:', data.error)
        return { data: null, error: { message: data.error } }
      }

      const adminUser = data.user
      console.log('✅ Admin login successful:', adminUser.username)
      
      // Store admin user in localStorage and state
      localStorage.setItem('harmony_house_user', JSON.stringify(adminUser))
      setUser(adminUser)
      
      return { data: { user: adminUser }, error: null }
      
    } catch (error) {
      console.error('❌ Admin login error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user:', user?.email)
      
      // Clear local state and storage
      setUser(null)
      localStorage.removeItem('harmony_house_user')
      
      console.log('✅ Signout successful')
      return { error: null }
    } catch (error) {
      console.error('❌ Error in signOut:', error)
      // Even if there's an error, clear local state
      setUser(null)
      localStorage.removeItem('harmony_house_user')
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) {
        throw new Error('No authenticated user')
      }

      console.log('📝 Updating profile for user:', user.id, 'with updates:', updates)
      
      const { data, error } = await supabase.rpc('update_user_profile', {
        p_user_id: user.id,
        p_full_name: updates.full_name,
        p_phone: updates.phone,
        p_city: updates.city,
        p_age: updates.age,
        p_skill_level: updates.skill_level,
        p_onboarding_completed: updates.onboarding_completed
      })

      if (error) {
        console.error('❌ Profile update error:', error)
        return { data: null, error }
      }

      if (!data.success) {
        console.error('❌ Profile update failed:', data.error)
        return { data: null, error: { message: data.error } }
      }

      console.log('✅ Profile updated successfully:', data.user)
      
      // Update local storage and state
      localStorage.setItem('harmony_house_user', JSON.stringify(data.user))
      setUser(data.user)
      
      return { data: data.user, error: null }
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
          return { data: null, error: responsesError }
        }
        
        console.log('✅ Onboarding responses saved successfully:', savedResponses)
      }

      // Update user profile with skill level and onboarding completion
      const updateResult = await updateProfile({
        skill_level: skillLevel,
        onboarding_completed: true
      })

      if (updateResult.error) {
        console.error('❌ Failed to update profile after onboarding:', updateResult.error)
        return { data: null, error: updateResult.error }
      }

      console.log('✅ Onboarding completed successfully')
      return { data: updateResult.data, error: null }
    } catch (error) {
      console.error('❌ Error in completeOnboarding:', error)
      return { data: null, error }
    }
  }

  const refreshProfile = async () => {
    try {
      if (!user?.id) {
        return { data: null, error: { message: 'No authenticated user' } }
      }

      console.log('🔄 Refreshing profile for user:', user.id)
      
      const { data, error } = await supabase.rpc('get_user_by_id', {
        p_user_id: user.id
      })
      
      if (error) {
        console.error('❌ Error refreshing profile:', error)
        return { data: null, error }
      }
      
      if (!data.success) {
        console.error('❌ Profile refresh failed:', data.error)
        return { data: null, error: { message: data.error } }
      }
      
      console.log('✅ Profile refreshed successfully:', data.user)
      
      // Update local storage and state
      localStorage.setItem('harmony_house_user', JSON.stringify(data.user))
      setUser(data.user)
      
      return { data: data.user, error: null }
    } catch (error) {
      console.error('❌ Error refreshing profile:', error)
      return { data: null, error }
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInAdmin,
    signOut,
    updateProfile,
    completeOnboarding,
    refreshProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff' || user?.role === 'admin',
    skillLevel: user?.skill_level,
    onboardingCompleted: user?.onboarding_completed
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}