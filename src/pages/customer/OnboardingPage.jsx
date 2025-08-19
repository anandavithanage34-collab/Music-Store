import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Music } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { useAuth } from '../../hooks/useAuth'
import { calculateSkillLevel } from '../../lib/utils'

const onboardingQuestions = [
  {
    id: 1,
    question: "How long have you been playing musical instruments?",
    options: [
      { text: "I'm completely new to music", points: { beginner: 5, intermediate: 0, professional: 0 } },
      { text: "Less than 1 year", points: { beginner: 4, intermediate: 1, professional: 0 } },
      { text: "1-3 years", points: { beginner: 2, intermediate: 4, professional: 0 } },
      { text: "3-7 years", points: { beginner: 0, intermediate: 3, professional: 2 } },
      { text: "7+ years", points: { beginner: 0, intermediate: 1, professional: 5 } }
    ]
  },
  {
    id: 2,
    question: "What best describes your musical goals?",
    options: [
      { text: "Learn to play for fun and relaxation", points: { beginner: 5, intermediate: 1, professional: 0 } },
      { text: "Play with friends and family", points: { beginner: 3, intermediate: 3, professional: 0 } },
      { text: "Join a band or perform locally", points: { beginner: 1, intermediate: 4, professional: 1 } },
      { text: "Pursue music professionally or teach", points: { beginner: 0, intermediate: 2, professional: 4 } },
      { text: "Already performing/teaching professionally", points: { beginner: 0, intermediate: 0, professional: 5 } }
    ]
  },
  {
    id: 3,
    question: "How comfortable are you with music theory?",
    options: [
      { text: "I don't know any music theory", points: { beginner: 5, intermediate: 0, professional: 0 } },
      { text: "I know basic notes and chords", points: { beginner: 3, intermediate: 2, professional: 0 } },
      { text: "I understand scales and key signatures", points: { beginner: 1, intermediate: 4, professional: 1 } },
      { text: "I'm comfortable with advanced theory", points: { beginner: 0, intermediate: 2, professional: 3 } },
      { text: "I can analyze and compose complex pieces", points: { beginner: 0, intermediate: 0, professional: 5 } }
    ]
  },
  {
    id: 4,
    question: "What's your experience with different instruments?",
    options: [
      { text: "I've never played any instrument", points: { beginner: 5, intermediate: 0, professional: 0 } },
      { text: "I play one instrument at a basic level", points: { beginner: 4, intermediate: 1, professional: 0 } },
      { text: "I play 1-2 instruments reasonably well", points: { beginner: 1, intermediate: 4, professional: 1 } },
      { text: "I play multiple instruments competently", points: { beginner: 0, intermediate: 2, professional: 3 } },
      { text: "I'm proficient in many instruments", points: { beginner: 0, intermediate: 0, professional: 5 } }
    ]
  },
  {
    id: 5,
    question: "What's your budget range for musical instruments?",
    options: [
      { text: "Under LKR 25,000 (starter instruments)", points: { beginner: 4, intermediate: 1, professional: 0 } },
      { text: "LKR 25,000 - 75,000 (quality beginner to intermediate)", points: { beginner: 3, intermediate: 3, professional: 0 } },
      { text: "LKR 75,000 - 200,000 (professional quality)", points: { beginner: 1, intermediate: 3, professional: 2 } },
      { text: "LKR 200,000 - 500,000 (high-end instruments)", points: { beginner: 0, intermediate: 1, professional: 4 } },
      { text: "Over LKR 500,000 (premium/vintage instruments)", points: { beginner: 0, intermediate: 0, professional: 5 } }
    ]
  }
]

export default function OnboardingPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const { completeOnboarding } = useAuth()
  const navigate = useNavigate()

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }))
  }

  const handleNext = () => {
    if (currentQuestion < onboardingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleComplete = async () => {
    console.log('🎯 Starting onboarding completion...')
    console.log('Current answers:', answers)
    setLoading(true)
    
    try {
      // Calculate skill level based on answers
      const responses = Object.entries(answers).map(([questionId, option]) => ({
        question_id: questionId,
        answer: option.text,
        points_beginner: option.points.beginner,
        points_intermediate: option.points.intermediate,
        points_professional: option.points.professional
      }))

      console.log('📊 Calculated responses:', responses)
      const skillLevel = calculateSkillLevel(responses)
      console.log('🎵 Determined skill level:', skillLevel)

      const result = await completeOnboarding(skillLevel, responses)
      console.log('✅ Onboarding result:', result)

      if (result?.error) {
        console.error('❌ Onboarding error:', result.error)
        alert('There was an issue completing your setup. Please try again.')
      } else {
        console.log('🚀 Onboarding successful! Redirecting to homepage...')
        navigate('/')
      }
    } catch (error) {
      console.error('❌ Onboarding error:', error)
      alert('There was an issue completing your setup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestionData = onboardingQuestions[currentQuestion]
  const selectedAnswer = answers[currentQuestionData.id]
  const isLastQuestion = currentQuestion === onboardingQuestions.length - 1
  const allQuestionsAnswered = Object.keys(answers).length === onboardingQuestions.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Music className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900 font-heading">Music Store LK</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's Personalize Your Experience</h1>
          <p className="text-gray-600">
            Answer a few questions so we can recommend the perfect instruments for your skill level
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6 bg-gray-200 rounded-full h-2 max-w-md mx-auto">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / onboardingQuestions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Question {currentQuestion + 1} of {onboardingQuestions.length}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              {currentQuestionData.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {currentQuestionData.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestionData.id, option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer?.text === option.text
                        ? 'border-primary-500 bg-primary-50 text-primary-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.text}</span>
                      {selectedAnswer?.text === option.text && (
                        <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={currentQuestion === 0 ? 'invisible' : ''}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            {currentQuestion + 1} / {onboardingQuestions.length}
          </div>

          {isLastQuestion ? (
            <Button
              onClick={handleComplete}
              disabled={!allQuestionsAnswered}
              loading={loading}
            >
              Complete Setup
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            Skip for now (you can complete this later)
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
