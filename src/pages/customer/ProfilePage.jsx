import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input, Label, Select } from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { SriLankanCities } from '../../types'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    age: ''
  })
  
  // Update form data when profile changes
  React.useEffect(() => {
    if (profile) {
      const newFormData = {
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        age: profile.age?.toString() || ''
      }
      setFormData(newFormData)
    }
  }, [profile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required')
      return
    }

    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        city: formData.city,
        age: formData.age ? parseInt(formData.age) : null
      })

      if (error) {
        setError('Failed to update profile')
      } else {
        setIsEditing(false)
        setError('')
        // Show success message
        alert('✅ Profile updated successfully!')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      city: profile?.city || '',
      age: profile?.age || ''
    })
    setIsEditing(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-heading">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {profile?.full_name || 'User'}
                  </h2>
                  <p className="text-gray-600 mb-2">{user?.email}</p>
                  {profile?.skill_level && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                      {profile.skill_level.charAt(0).toUpperCase() + profile.skill_level.slice(1)} Level
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</span>
                    </div>
                    {profile?.onboarding_completed ? (
                      <div className="text-green-600">
                        ✅ Profile Complete
                      </div>
                    ) : (
                      <div className="text-orange-600">
                        ⏳ Complete your onboarding
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center mt-1 p-3 bg-gray-50 rounded-md">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-700">{user?.email}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center mt-1 p-3 border rounded-md">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-700">{profile?.full_name || 'Not set'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+94 77 123 4567"
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center mt-1 p-3 border rounded-md">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-700">{profile?.phone || 'Not set'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      {isEditing ? (
                        <Select
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="mt-1"
                        >
                          <option value="">Select City</option>
                          {SriLankanCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </Select>
                      ) : (
                        <div className="flex items-center mt-1 p-3 border rounded-md">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-700">{profile?.city || 'Not set'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="age">Age</Label>
                      {isEditing ? (
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          min="13"
                          max="120"
                          value={formData.age}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center mt-1 p-3 border rounded-md">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-700">{profile?.age || 'Not set'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Skill Level</Label>
                      <div className="flex items-center mt-1 p-3 border rounded-md">
                        <span className="text-gray-700">
                          {profile?.skill_level 
                            ? profile.skill_level.charAt(0).toUpperCase() + profile.skill_level.slice(1)
                            : 'Not assessed'
                          }
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Skill level is determined through onboarding assessment
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="mt-6">
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
                      <div className="text-2xl font-bold text-purple-600">0</div>
                      <div className="text-sm text-gray-600">Wishlist</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">LKR 0</div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
