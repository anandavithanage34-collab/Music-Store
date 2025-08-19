import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Music, Award, Truck, Shield, Star } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import ProductCard from '../../components/ui/ProductCard'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { sampleProducts } from '../../lib/sampleData'

export default function HomePage() {
  const { profile, isAuthenticated } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [profile])

  const fetchProducts = async () => {
    try {
      // Always use hardcoded sample data for consistency
      setFeaturedProducts(sampleProducts.slice(0, 8))
      
      if (profile?.skill_level) {
        const recommended = sampleProducts.filter(p => 
          p.suitable_for.includes(profile.skill_level)
        )
        setRecommendedProducts(recommended.slice(0, 4))
      }
    } catch (error) {
      console.error('Error with products setup:', error)
      setFeaturedProducts(sampleProducts.slice(0, 8))
      setRecommendedProducts(sampleProducts.slice(0, 4))
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: Truck,
      title: 'Island-wide Delivery',
      description: 'Free delivery across Sri Lanka for orders above LKR 15,000'
    },
    {
      icon: Shield,
      title: 'Warranty Protection',
      description: 'Comprehensive warranty on all instruments with local service'
    },
    {
      icon: Award,
      title: 'Expert Guidance',
      description: 'Professional musicians and certified technicians to help you choose'
    },
    {
      icon: Star,
      title: 'Quality Guarantee',
      description: 'Only authentic instruments from authorized dealers worldwide'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1920&q=80" 
            alt="Premium musical instruments" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-8 text-white"
            >
              <div className="space-y-4">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-secondary-400 font-medium tracking-wider uppercase text-sm"
                >
                  Sri Lanka's Premier Music Store - Harmony House
                </motion.p>
                <h1 className="text-5xl lg:text-7xl font-bold font-heading leading-tight">
                  Craft Your
                  <span className="block text-secondary-400 italic">Musical Legacy</span>
                </h1>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-xl text-gray-200 leading-relaxed max-w-lg"
              >
                Discover handcrafted instruments, premium gear, and timeless melodies. Where passion meets perfection.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="space-y-6"
              >
                {isAuthenticated && profile ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-2xl font-light">
                        Welcome back, <span className="font-semibold">{profile.full_name.split(' ')[0]}</span>
                      </p>
                      {profile.skill_level && (
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-400/20 backdrop-blur-sm border border-secondary-400/30">
                          <Star className="h-4 w-4 mr-2 text-secondary-400" />
                          <span className="text-sm font-medium text-secondary-400">
                            {profile.skill_level.charAt(0).toUpperCase() + profile.skill_level.slice(1)} Musician
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/products">
                        <Button className="elegant-button text-lg px-10 py-4">
                          Explore Instruments
                          <ArrowRight className="ml-3 h-5 w-5" />
                        </Button>
                      </Link>
                      {!profile.onboarding_completed && (
                        <Link to="/onboarding">
                          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full">
                            Complete Setup
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <Link to="/products">
                        <Button className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105">
                          Browse Collection
                          <ArrowRight className="ml-3 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                    <p className="text-sm text-white font-light">
                      Join 10,000+ musicians who trust us for their musical journey
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="relative lg:flex justify-end"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-400/20 to-accent-500/20 rounded-3xl blur-3xl transform rotate-6"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                        <Music className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">500+</p>
                        <p className="text-sm text-gray-300">Instruments</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                        <Shield className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">24M</p>
                        <p className="text-sm text-gray-300">Warranty</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                        <Award className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">10K+</p>
                        <p className="text-sm text-gray-300">Happy Customers</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                        <Truck className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">Free</p>
                        <p className="text-sm text-gray-300">Delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-secondary-600 font-medium tracking-wider uppercase text-sm mb-4">
              Excellence in Every Note
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-heading">
              The Harmony House
              <span className="block text-gray-600 font-light italic">Difference</span>
            </h2>
            <p className="text-xl luxury-text max-w-3xl mx-auto">
              Uncompromising quality, expert craftsmanship, and personalized service 
              for discerning musicians across Sri Lanka.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="premium-card text-center p-8 group-hover:shadow-2xl group-hover:-translate-y-2">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 font-heading">
                    {feature.title}
                  </h3>
                  <p className="luxury-text text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Products (for logged-in users) */}
      {isAuthenticated && profile?.skill_level && recommendedProducts.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-secondary-600 font-medium tracking-wider uppercase text-sm mb-4">
                Curated for You
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-heading">
                Perfect for 
                <span className="text-gray-600 italic">{profile.skill_level.charAt(0).toUpperCase() + profile.skill_level.slice(1)}</span>
                <span className="block text-gray-900">Musicians</span>
              </h2>
              <p className="text-xl luxury-text max-w-2xl mx-auto">
                Expertly selected instruments that match your skill level and musical aspirations
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link to="/products">
                <Button className="elegant-button text-lg px-10 py-4">
                  View All Recommendations
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-secondary-600 font-medium tracking-wider uppercase text-sm mb-4">
              Handpicked Collection
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-heading">
              Featured
              <span className="block text-gray-600 italic font-light">Instruments</span>
            </h2>
            <p className="text-xl luxury-text max-w-2xl mx-auto">
              Discover our most sought-after instruments, carefully selected by musical experts
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-2xl mb-6"></div>
                  <div className="h-4 bg-gray-200 rounded-full mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link to="/products">
              <Button className="elegant-button text-lg px-12 py-4">
                Explore Full Collection
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 luxury-gradient overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary-400/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-secondary-400 font-medium tracking-wider uppercase text-sm">
                Begin Your Journey
              </p>
              <h2 className="text-4xl lg:text-6xl font-bold text-white font-heading leading-tight">
                Where Music
                <span className="block text-secondary-400 italic font-light">Comes Alive</span>
              </h2>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join a community of passionate musicians across Sri Lanka. Experience personalized 
              service, expert guidance, and instruments that inspire greatness.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link to="/onboarding">
                    <Button className="bg-secondary-500 hover:bg-secondary-600 text-gray-900 px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link to="/products">
                    <Button variant="outline" className="border-white text-black hover:bg-white hover:text-gray-900 px-10 py-4 rounded-full text-lg">
                      Browse Collection
                    </Button>
                  </Link>
                </div>
              ) : !profile?.onboarding_completed ? (
                <Link to="/onboarding">
                  <Button className="bg-secondary-500 hover:bg-secondary-600 text-gray-900 px-10 py-4 rounded-full text-lg font-medium">
                    Complete Your Profile Setup
                  </Button>
                </Link>
              ) : (
                <Link to="/products">
                  <Button className="elegant-button text-lg px-12 py-4">
                    Discover New Instruments
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center justify-center space-x-8 text-white/80">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-sm">Premium Instruments</p>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">10K+</p>
                  <p className="text-sm">Happy Musicians</p>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">24/7</p>
                  <p className="text-sm">Expert Support</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
