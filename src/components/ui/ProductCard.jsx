import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Heart, Eye, Music } from 'lucide-react'
import { Button } from './Button'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useWishlist } from '../../hooks/useWishlist'
import { formatPrice, getSkillLevelColor } from '../../lib/utils'

export default function ProductCard({ product, className }) {
  const { addToCart } = useCart()
  const { profile } = useAuth()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [addingToCart, setAddingToCart] = useState(false)
  const [addToCartSuccess, setAddToCartSuccess] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]
  const rating = product.average_rating || 4.5
  const reviewCount = product.total_reviews || Math.floor(Math.random() * 50) + 10

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAddToCartSuccess(false)
    
    try {
      const result = await addToCart(product.id, 1)
      
      if (result.success) {
        setAddToCartSuccess(true)
        setTimeout(() => setAddToCartSuccess(false), 2000)
      } else {
        console.error('❌ Failed to add to cart:', result.error)
        alert('❌ Failed to add item to cart. Please try again.')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('❌ Failed to add item to cart. Please try again.')
    }
  }

  const isRecommendedForUser = () => {
    if (!profile?.skill_level || !product.suitable_for) return false
    return product.suitable_for.includes(profile.skill_level)
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`group h-full ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="premium-card overflow-hidden h-full flex flex-col">
        <div className="relative overflow-hidden">
          {/* Product Image */}
          <Link to={`/product/${product.id}`} className="block relative">
            <div className="aspect-square bg-gray-50 overflow-hidden relative">
              {primaryImage ? (
                <>
                  <img
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text || product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                  <Music className="h-16 w-16 text-gray-300" />
                </div>
              )}
              
              {/* Quick View Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
              >
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-gray-900 rounded-full px-6 py-2 backdrop-blur-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Quick View
                </Button>
              </motion.div>
            </div>
          </Link>

          {/* Wishlist Button */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 right-4 p-2.5 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all duration-200 z-10"
            onClick={async (e) => {
              e.preventDefault()
              e.stopPropagation()
              
              if (wishlistLoading) return
              setWishlistLoading(true)
              
              try {
                const inWishlist = isInWishlist(product.id)
                const result = inWishlist 
                  ? await removeFromWishlist(product.id)
                  : await addToWishlist(product.id)
                
                if (!result.success) {
                  alert(result.error || 'Failed to update wishlist')
                }
              } catch (error) {
                console.error('Wishlist error:', error)
              } finally {
                setWishlistLoading(false)
              }
            }}
            disabled={wishlistLoading}
          >
            <Heart className={`h-4 w-4 transition-colors ${
              isInWishlist(product.id) 
                ? 'text-red-500 fill-current' 
                : 'text-gray-600 hover:text-red-500'
            }`} />
          </motion.button>

          {/* Status Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {product.is_sale && (
              <span className="bg-red-500 text-white px-3 py-1 text-xs font-medium rounded-full shadow-lg">
                Sale
              </span>
            )}
            {isRecommendedForUser() && (
              <span className="bg-secondary-500/90 text-gray-900 px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm shadow-lg">
                Recommended
              </span>
            )}
            {product.suitable_for && (
              <span className="bg-gray-900/90 text-white px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm">
                {product.suitable_for[0].charAt(0).toUpperCase() + product.suitable_for[0].slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 flex-1 flex flex-col">
          <Link to={`/product/${product.id}`} className="block mb-4 flex-1">
            <div className="space-y-2">
              {product.brands?.name && (
                <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">{product.brands.name}</p>
              )}
              <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-300 line-clamp-2 text-lg leading-tight font-heading">
                {product.name}
              </h3>
            </div>
          </Link>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(rating) ? 'text-secondary-500 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-400 font-light">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-2xl font-bold text-gray-900 font-heading">
                {formatPrice(product.price)}
              </p>
              {product.original_price && product.original_price > product.price && (
                <p className="text-sm text-gray-400 line-through font-light">
                  {formatPrice(product.original_price)}
                </p>
              )}
            </div>
            {product.inventory?.quantity_available <= 5 && (
              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
                Only {product.inventory.quantity_available} left
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleAddToCart}
              className={`w-full rounded-xl py-3 font-medium transition-all duration-300 ${
                addToCartSuccess 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {addToCartSuccess ? 'Added to Cart!' : 'Add to Cart'}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}