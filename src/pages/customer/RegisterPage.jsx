import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Music, Eye, EyeOff, Loader2, Mail, User, Phone, MapPin, Calendar } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input, Label, Select } from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { SriLankanCities } from '../../types'
import { supabase } from '../../lib/supabase'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    age: '',
    city: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [onboardingData, setOnboardingData] = useState(null)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  // Load onboarding data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('onboardingData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setOnboardingData(data)
        console.log('📥 Loaded onboarding data:', data)
      } catch (error) {
        console.error('❌ Error parsing onboarding data:', error)
      }
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
    if (success) setSuccess('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!formData.age) newErrors.age = 'Age is required'
    else if (formData.age < 13 || formData.age > 120) newErrors.age = 'Age must be between 13 and 120'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveOnboardingResponses = async (userId) => {
    if (!onboardingData || !onboardingData.answers) {
      console.log('ℹ️ No onboarding data to save')
      return { success: true }
    }

    try {
      console.log('💾 Saving onboarding responses for user:', userId)
      
      // Prepare responses data
      const responsesData = Object.entries(onboardingData.answers).map(([questionId, answer]) => ({
        user_id: userId,
        question_id: questionId,
        answer: answer.text,
        points_beginner: answer.points?.beginner || 0,
        points_intermediate: answer.points?.intermediate || 0,
        points_professional: answer.points?.professional || 0
      }))

      console.log('📝 Responses to save:', responsesData)

      // Save responses to database
      const { data: savedResponses, error: responsesError } = await supabase
        .from('onboarding_responses')
        .insert(responsesData)
        .select()

      if (responsesError) {
        console.error('❌ Failed to save onboarding responses:', responsesError)
        return { success: false, error: responsesError }
      }

      console.log('✅ Onboarding responses saved successfully:', savedResponses)

      // Update user with skill level and onboarding completion
      const { data: updateResult, error: updateError } = await supabase.rpc('update_user_profile', {
        p_user_id: userId,
        p_skill_level: onboardingData.skillLevel,
        p_onboarding_completed: true
      })

      if (updateError) {
        console.error('❌ Failed to update user with skill level:', updateError)
        return { success: false, error: updateError }
      }

      if (!updateResult.success) {
        console.error('❌ User update failed:', updateResult.error)
        return { success: false, error: { message: updateResult.error } }
      }

      console.log('✅ User updated with skill level:', updateResult.user)
      return { success: true }
    } catch (error) {
      console.error('❌ Error saving onboarding responses:', error)
      return { success: false, error }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setErrors({})
      setSuccess('')

      console.log('🚀 Starting registration process...')

      // Prepare profile data for signup
      const profileData = {
        full_name: formData.full_name,
        age: parseInt(formData.age),
        city: formData.city,
        phone: formData.phone
      }

      console.log('📝 Profile data:', profileData)

      // Sign up the user
      const { data, error } = await signUp(formData.email, formData.password, profileData)

      if (error) {
        console.error('❌ Signup error:', error)
        setErrors({ submit: error.message || 'Registration failed. Please try again.' })
      } else if (data?.user) {
        console.log('✅ Signup successful for:', data.user.email)
        
        // Save onboarding responses after successful signup
        if (onboardingData) {
          const saveResult = await saveOnboardingResponses(data.user.id)
          
          if (!saveResult.success) {
            console.error('⚠️ Failed to save onboarding data, but user was created')
            // Don't fail the whole process, just log the error
          } else {
            console.log('✅ Onboarding data saved successfully')
          }
        }

        // Clear onboarding data from localStorage
        localStorage.removeItem('onboardingData')
        
        setSuccess('Account created successfully! You can now sign in.')
        
        // Wait a moment to show success message, then redirect to login
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Account created successfully! You can now sign in with your credentials.',
              type: 'success'
            }
          })
        }, 2000)
      } else {
        setErrors({ submit: 'Registration failed. Please try again.' })
      }
    } catch (error) {
      console.error('❌ Registration error:', error)
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center">
                <Music className="w-8 h-8 text-primary-600 mr-3" />
                Join Our Musical Community
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">
                Create your account to get personalized instrument recommendations
              </p>
              {!onboardingData && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 mb-2">
                    💡 Want personalized recommendations? Take our quick musical assessment first!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/onboarding')}
                    className="w-full"
                  >
                    Take Assessment
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Messages */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-800 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Success Messages */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-green-800 text-sm">{success}</p>
                  </div>
                )}

                {/* Onboarding Assessment Results */}
                {onboardingData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                      🎯 Your Musical Assessment Results
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        onboardingData.skillLevel === 'professional' ? 'bg-purple-100 text-purple-800' :
                        onboardingData.skillLevel === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {onboardingData.skillLevel === 'professional' ? '🎼 Professional' :
                         onboardingData.skillLevel === 'intermediate' ? '🎵 Intermediate' :
                         '🎶 Beginner'}
                      </span>
                    </h3>
                    <div className="text-xs text-blue-600 space-y-1">
                      <p>• Assessment completed on {new Date(onboardingData.completedAt).toLocaleDateString()}</p>
                      <p>• {Object.keys(onboardingData.answers).length} questions answered</p>
                      <p>• Personalized recommendations will be available after registration</p>
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={errors.full_name ? 'border-red-300' : ''}
                    />
                    {errors.full_name && <p className="text-red-600 text-xs mt-1">{errors.full_name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="age">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Age
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="13"
                      max="120"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter your age"
                      className={errors.age ? 'border-red-300' : ''}
                    />
                    {errors.age && <p className="text-red-600 text-xs mt-1">{errors.age}</p>}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={errors.email ? 'border-red-300' : ''}
                    />
                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className={errors.phone ? 'border-red-300' : ''}
                    />
                    {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="city">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    City
                  </Label>
                  <Select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'border-red-300' : ''}
                  >
                    <option value="">Select your city</option>
                    {SriLankanCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Select>
                  {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a password"
                        className={errors.password ? 'border-red-300' : ''}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className={errors.confirmPassword ? 'border-red-300' : ''}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}