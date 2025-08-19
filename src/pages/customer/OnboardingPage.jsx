import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState('intro') // 'intro', 'questions', 'complete'
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [onboardingQuestions, setOnboardingQuestions] = useState([])
  const [skillLevel, setSkillLevel] = useState(null)
  
  const navigate = useNavigate()

  // Fetch questions from database
  const fetchOnboardingQuestions = async () => {
    try {
      setLoading(true)
      console.log('📥 Fetching onboarding questions from database...')
      
      const { data, error } = await supabase
        .from('onboarding_questions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      
      if (error) {
        console.error('❌ Error fetching questions:', error)
        setOnboardingQuestions([])
      } else {
        console.log('✅ Questions fetched successfully:', data)
        setOnboardingQuestions(data)
      }
    } catch (error) {
      console.error('❌ Error in fetchOnboardingQuestions:', error)
      setOnboardingQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOnboardingQuestions()
  }, [])

  const handleAnswer = (questionId, answer) => {
    console.log('📝 Answer selected:', { questionId, answer })
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < onboardingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // All questions answered, calculate skill level and complete
      completeOnboardingFlow()
    }
  }

  const completeOnboardingFlow = () => {
    // Calculate skill level from answers
    const totalPoints = { beginner: 0, intermediate: 0, professional: 0 }
    
    Object.values(answers).forEach(answer => {
      if (answer && answer.points) {
        totalPoints.beginner += answer.points.beginner || 0
        totalPoints.intermediate += answer.points.intermediate || 0
        totalPoints.professional += answer.points.professional || 0
      }
    })
    
    let calculatedSkillLevel = 'beginner'
    if (totalPoints.professional > totalPoints.beginner && totalPoints.professional > totalPoints.intermediate) {
      calculatedSkillLevel = 'professional'
    } else if (totalPoints.intermediate > totalPoints.beginner) {
      calculatedSkillLevel = 'intermediate'
    }

    console.log('🎯 Calculated skill level:', calculatedSkillLevel)
    console.log('📊 Points breakdown:', totalPoints)
    
    // Store onboarding data in localStorage to be used during registration
    const onboardingData = {
      answers,
      skillLevel: calculatedSkillLevel,
      questions: onboardingQuestions,
      totalPoints,
      completedAt: new Date().toISOString()
    }
    
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData))
    console.log('💾 Onboarding data stored in localStorage')
    
    setSkillLevel(calculatedSkillLevel)
    setCurrentStep('complete')
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  // Step 1: Introduction
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Musical Assessment
              </h1>
              <p className="text-gray-600 mb-8">
                Let's understand your musical background to provide personalized instrument recommendations. 
                This will take about 2-3 minutes.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold mr-2">5</span>
                    Quick Questions
                  </span>
                  <span className="flex items-center">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold mr-2">📊</span>
                    Skill Analysis
                  </span>
                  <span className="flex items-center">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold mr-2">🎯</span>
                    Personalized Results
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep('questions')}
                size="lg"
                disabled={loading || onboardingQuestions.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading Questions...
                  </>
                ) : onboardingQuestions.length === 0 ? (
                  'No Questions Available'
                ) : (
                  'Start Assessment'
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Step 2: Questions
  if (currentStep === 'questions' && onboardingQuestions.length > 0) {
    const question = onboardingQuestions[currentQuestion]
    const selectedAnswer = answers[question.id]

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {onboardingQuestions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / onboardingQuestions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / onboardingQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {question.question}
              </h2>
              
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(question.id, option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer?.text === option.text
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        selectedAnswer?.text === option.text
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswer?.text === option.text && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={!selectedAnswer}
              >
                {currentQuestion === onboardingQuestions.length - 1 ? 'Complete Assessment' : 'Next Question'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Step 3: Completion
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Assessment Complete!
              </h1>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Based on your responses, we've determined your skill level:
                </p>
                <div className={`inline-block px-6 py-3 rounded-full text-lg font-semibold ${
                  skillLevel === 'professional' ? 'bg-purple-100 text-purple-800' :
                  skillLevel === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {skillLevel === 'professional' ? '🎼 Professional' :
                   skillLevel === 'intermediate' ? '🎵 Intermediate' :
                   '🎶 Beginner'}
                </div>
              </div>

              <p className="text-gray-600 mb-8">
                Now let's create your account to get personalized instrument recommendations!
              </p>

              <div className="space-y-4">
                <Button
                  onClick={() => navigate('/register')}
                  size="lg"
                  className="w-full"
                >
                  Create Account
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep('intro')
                    setCurrentQuestion(0)
                    setAnswers({})
                    setSkillLevel(null)
                  }}
                  className="w-full"
                >
                  Retake Assessment
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
      <Card className="p-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </Card>
    </div>
  )
}