import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Loader2, Award, Target } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input, Label, Select } from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { SriLankanCities } from '../../types'
import { supabase } from '../../lib/supabase'

export default function ProfilePage() {
  const { user, updateProfile, signOut, loading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [onboardingResponses, setOnboardingResponses] = useState([])
  const [onboardingQuestions, setOnboardingQuestions] = useState([])
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    age: ''
  })
  
  // Update form data when user changes
  useEffect(() => {
    if (user) {
      const newFormData = {
        full_name: user.full_name || '',
        phone: user.phone || '',
        city: user.city || '',
        age: user.age?.toString() || ''
      }
      setFormData(newFormData)
    }
  }, [user])

  // Fetch onboarding responses when user is available
  useEffect(() => {
    if (user?.id) {
      fetchOnboardingData()
    }
  }, [user?.id])

  const fetchOnboardingData = async () => {
    try {
      console.log('📥 Fetching onboarding data for user:', user.id)
      
      // Fetch user's onboarding responses with questions
      const { data: responses, error: responsesError } = await supabase
        .from('onboarding_responses')
        .select(`
          *,
          onboarding_questions (
            id,
            question,
            options
          )
        `)
        .eq('user_id', user.id)
        .order('created_at')

      if (responsesError) {
        console.error('❌ Error fetching onboarding responses:', responsesError)
      } else {
        console.log('✅ Onboarding responses fetched:', responses)
        setOnboardingResponses(responses || [])
      }

      // Fetch all questions for reference
      const { data: questions, error: questionsError } = await supabase
        .from('onboarding_questions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (questionsError) {
        console.error('❌ Error fetching questions:', questionsError)
      } else {
        setOnboardingQuestions(questions || [])
      }
    } catch (error) {
      console.error('❌ Error in fetchOnboardingData:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')

      const profileData = {
        full_name: formData.full_name,
        phone: formData.phone,
        city: formData.city,
        age: parseInt(formData.age) || null
      }

      const { data, error: updateError } = await updateProfile(profileData)

      if (updateError) {
        setError(updateError.message || 'Failed to update profile')
      } else {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('❌ Profile update error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        city: user.city || '',
        age: user.age?.toString() || ''
      })
    }
    setIsEditing(false)
    setError('')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
            <Button onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="w-6 h-6 text-primary-600 mr-2" />
                    My Profile
                  </CardTitle>
                  <p className="text-gray-600 mt-1">Manage your account information</p>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="13"
                      max="120"
                      value={formData.age}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    {isEditing ? (
                      <Select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      >
                        <option value="">Select your city</option>
                        {SriLankanCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        disabled
                        className="bg-gray-50"
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Level Card */}
          {user?.skill_level && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-6 h-6 text-primary-600 mr-2" />
                  Musical Skill Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${
                      user.skill_level === 'professional' ? 'bg-purple-100 text-purple-800' :
                      user.skill_level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.skill_level === 'professional' ? '🎼 Professional' :
                       user.skill_level === 'intermediate' ? '🎵 Intermediate' :
                       '🎶 Beginner'}
                    </div>
                    <p className="text-gray-600 mt-2">
                      Based on your musical assessment
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/onboarding'}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Retake Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Onboarding Responses */}
          {onboardingResponses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-6 h-6 text-primary-600 mr-2" />
                  Your Assessment Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onboardingResponses.map((response, index) => (
                    <div key={response.id} className="border-l-4 border-blue-200 pl-4">
                      <h4 className="font-medium text-gray-900">
                        {response.onboarding_questions?.question || `Question ${index + 1}`}
                      </h4>
                      <p className="text-gray-600 mt-1">{response.answer}</p>
                      <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                        <span>Beginner: {response.points_beginner}</span>
                        <span>Intermediate: {response.points_intermediate}</span>
                        <span>Professional: {response.points_professional}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Orders</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {onboardingResponses.length}
                  </div>
                  <div className="text-sm text-gray-600">Assessment Questions</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {user?.onboarding_completed ? '✓' : '○'}
                  </div>
                  <div className="text-sm text-gray-600">Onboarding</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/onboarding'}
                  className="w-full"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Retake Musical Assessment
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await signOut()
                    window.location.href = '/'
                  }}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}