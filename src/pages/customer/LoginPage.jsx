import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Music, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input, Label } from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile')
    }
  }, [user, navigate])

  // Check for success message from email confirmation or other sources
  useEffect(() => {
    if (location.state?.message) {
      if (location.state.type === 'success' || location.state.type === 'info') {
        setSuccess(location.state.message)
      } else {
        setError(location.state.message)
      }
      // Clear the state
      navigate(location.pathname, { replace: true })
    }
  }, [location.state, navigate, location.pathname])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      console.log('🔐 Attempting sign in for:', formData.email)
      
      const { data, error: signInError } = await signIn(formData.email, formData.password)
      
      if (signInError) {
        console.error('❌ Sign in error:', signInError)
        setError(signInError.message || 'Invalid email or password')
      } else if (data?.user) {
        console.log('✅ Sign in successful for:', data.user.email)
        setSuccess('Sign in successful! Redirecting to your profile...')
        
        // Wait a moment to show success message, then redirect to profile
        setTimeout(() => {
          navigate('/profile')
        }, 1000)
      } else {
        setError('Sign in failed. Please try again.')
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center">
              <Music className="w-8 h-8 text-primary-600 mr-3" />
              Welcome Back
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Sign in to your musical journey
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Success Messages */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-green-800 text-sm">{success}</p>
                </div>
              )}

              {/* Email Field */}
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
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                    Create account
                  </Link>
                </p>
              </div>

              {/* Assessment Link */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">
                  New to musical instruments?
                </p>
                <Link 
                  to="/onboarding" 
                  className="text-sm font-medium text-purple-600 hover:text-purple-500"
                >
                  Take our Musical Assessment →
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}