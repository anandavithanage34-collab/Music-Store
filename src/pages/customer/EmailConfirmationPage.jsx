import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'

export default function EmailConfirmationPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the confirmation parameters from URL
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        
        console.log('🔗 Email confirmation parameters:', { token_hash, type })

        if (!token_hash || !type) {
          setStatus('error')
          setMessage('Invalid confirmation link. Missing required parameters.')
          return
        }

        console.log('🔄 Verifying email confirmation...')
        
        // Verify the email confirmation token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type
        })

        if (error) {
          console.error('❌ Email confirmation error:', error)
          setStatus('error')
          setMessage(error.message || 'Email confirmation failed. The link may be expired or invalid.')
        } else if (data?.user) {
          console.log('✅ Email confirmed successfully for:', data.user.email)
          setStatus('success')
          setMessage('Your email has been confirmed successfully! Redirecting to login...')
          
          // Redirect to login immediately
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Email confirmed! Please sign in to continue.',
                type: 'success'
              }
            })
          }, 1500)
        } else {
          setStatus('error')
          setMessage('Email confirmation failed. Please try again.')
        }
      } catch (error) {
        console.error('❌ Error in email confirmation:', error)
        setStatus('error')
        setMessage('An unexpected error occurred during email confirmation.')
      }
    }

    handleEmailConfirmation()
  }, [searchParams, navigate])

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
            <CardTitle className="text-center">Email Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Confirming your email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Email Confirmed!
                </h2>
                <p className="text-gray-600">{message}</p>
                <div className="text-sm text-gray-500">
                  Redirecting to login page...
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Confirmation Failed
                </h2>
                <p className="text-gray-600">{message}</p>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}