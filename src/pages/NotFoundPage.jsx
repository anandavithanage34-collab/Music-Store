import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, Music } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <Music className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Link to="/">
            <Button size="lg" className="w-full">
              <Home className="mr-2 h-5 w-5" />
              Go to Homepage
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" size="lg" className="w-full">
              <Search className="mr-2 h-5 w-5" />
              Browse Products
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
