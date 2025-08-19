import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function generateSKU(category, brand, name) {
  const categoryCode = category.substring(0, 3).toUpperCase()
  const brandCode = brand ? brand.substring(0, 3).toUpperCase() : 'GEN'
  const nameCode = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase()
  
  return `${categoryCode}-${brandCode}-${nameCode}-${randomCode}`
}

export function calculateSkillLevel(responses) {
  let beginnerScore = 0
  let intermediateScore = 0
  let professionalScore = 0
  
  responses.forEach(response => {
    beginnerScore += response.points_beginner || 0
    intermediateScore += response.points_intermediate || 0
    professionalScore += response.points_professional || 0
  })
  
  const maxScore = Math.max(beginnerScore, intermediateScore, professionalScore)
  
  if (maxScore === beginnerScore) return 'beginner'
  if (maxScore === intermediateScore) return 'intermediate'
  return 'professional'
}

export function getSkillLevelColor(skillLevel) {
  switch (skillLevel) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'professional':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
