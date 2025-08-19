import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, ShoppingCart, User, Search, Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { isAuthenticated, profile, signOut } = useAuth()
  const { getCartCount } = useCart()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    if (isSigningOut) return // Prevent multiple clicks
    
    setIsSigningOut(true)
    setIsUserMenuOpen(false)
    
    try {
      // Call signOut function from useAuth
      await signOut()
      
      // Navigate immediately
      navigate('/', { replace: true })
      
      // Show success message after navigation
      setTimeout(() => {
        alert('✅ Successfully signed out!')
      }, 200)
      
    } catch (error) {
      console.error('Signout error:', error)
      // Still redirect to home even if signout has issues
      navigate('/', { replace: true })
      setTimeout(() => {
        alert('❌ Signout failed but redirected to home.')
      }, 200)
    } finally {
      setIsSigningOut(false)
    }
  }

  const cartItemCount = getCartCount()

  const navigationItems = [
    { name: 'Collections', href: '/products', hasDropdown: true },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-700 p-2 rounded-full">
                <Music className="h-6 w-6 text-white" />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 font-heading leading-tight">
                Harmony House
              </span>
              <span className="text-xs text-gray-500 font-light tracking-wider uppercase">
                Sri Lanka
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center ml-12">
            <div className="flex items-center space-x-2 bg-gray-100/80 backdrop-blur-sm border border-gray-200/50 rounded-full p-2 hover:bg-gray-50 transition-all duration-300">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.href}
                    className="flex items-center space-x-1 text-gray-700 hover:text-white transition-all duration-300 font-medium py-2 px-4 rounded-full hover:bg-gray-900"
                  >
                    <span>{item.name}</span>
                    {item.hasDropdown && (
                      <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                    )}
                  </Link>
                
                {/* Dropdown Menu */}
                {item.hasDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="p-6 space-y-4">
                      <Link to="/products?category=guitars_basses" className="block text-gray-700 hover:text-gray-900 font-medium">
                        Guitars and Basses
                      </Link>
                      <Link to="/products?category=drums_percussion" className="block text-gray-700 hover:text-gray-900 font-medium">
                        Drums and Percussion
                      </Link>
                      <Link to="/products?category=keys" className="block text-gray-700 hover:text-gray-900 font-medium">
                        Keys
                      </Link>
                      <Link to="/products?category=studio_recording" className="block text-gray-700 hover:text-gray-900 font-medium">
                        Studio and Recording Equipment
                      </Link>
                      <Link to="/products?category=traditional" className="block text-gray-700 hover:text-gray-900 font-medium">
                        Traditional Sri Lankan
                      </Link>
                      <Link to="/products?category=accessories" className="block text-gray-700 hover:text-gray-900 font-medium">
                        Accessories
                      </Link>
                    </div>
                  </div>
                )}
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="bg-gray-100/80 backdrop-blur-sm border border-gray-200/50 rounded-full p-1 hover:bg-gray-50 transition-all duration-300">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search for instruments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-gray-900 focus:outline-none text-gray-900 placeholder-gray-500 rounded-full"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-6">
            {/* Cart */}
            <Link to="/cart" className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 text-gray-700 hover:text-white transition-all duration-300 rounded-full bg-gray-100/50 hover:bg-gray-900 backdrop-blur-sm border border-gray-200/50 hover:border-gray-900"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 group bg-gray-100/50 backdrop-blur-sm border border-gray-200/50 hover:border-gray-900"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                        <p className="text-xs text-gray-500">{profile?.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link 
                          to="/profile" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          My Profile
                        </Link>
                        <Link 
                          to="/orders" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          My Orders
                        </Link>
                        {!profile?.onboarding_completed && (
                          <Link 
                            to="/onboarding" 
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-3 text-sm text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors font-medium"
                          >
                            🎯 Complete Assessment
                          </Link>
                        )}
                        {profile?.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        {(profile?.role === 'staff' || profile?.role === 'admin') && (
                          <Link 
                            to="/staff" 
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            Staff Dashboard
                          </Link>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleSignOut()
                          }}
                          disabled={isSigningOut}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSigningOut ? 'Signing out...' : 'Sign Out'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-white font-medium rounded-full bg-gray-100/50 hover:bg-gray-900 backdrop-blur-sm border border-gray-200/50 hover:border-gray-900 px-6 py-2.5">
                    Sign In
                  </Button>
                </Link>
                <Link to="/onboarding">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2.5 rounded-full shadow-lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for instruments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all duration-300"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-6 space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 text-gray-700 hover:text-gray-900 transition-colors font-medium text-lg"
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Categories */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Categories</p>
                <div className="space-y-3">
                  <Link to="/products?category=guitars_basses" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 font-medium">
                    Guitars and Basses
                  </Link>
                  <Link to="/products?category=drums_percussion" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 font-medium">
                    Drums and Percussion
                  </Link>
                  <Link to="/products?category=keys" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 font-medium">
                    Keys
                  </Link>
                  <Link to="/products?category=studio_recording" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 font-medium">
                    Studio and Recording Equipment
                  </Link>
                  <Link to="/products?category=traditional" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 font-medium">
                    Traditional Sri Lankan
                  </Link>
                  <Link to="/products?category=accessories" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 font-medium">
                    Accessories
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}