import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ArrowLeft, Star } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { useWishlist } from '../../hooks/useWishlist'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../lib/utils'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, getWishlistCount } = useWishlist()
  const { addToCart } = useCart()

  const handleRemoveFromWishlist = async (productId) => {
    const result = await removeFromWishlist(productId)
    if (!result.success) {
      alert(result.error || 'Failed to remove from wishlist')
    }
  }

  const handleAddToCart = async (product) => {
    const result = await addToCart(product.id, 1)
    if (result.success) {
      alert('✅ Added to cart!')
    } else {
      alert('❌ Failed to add to cart. Please try again.')
    }
  }

  const handleMoveToCart = async (product) => {
    // Add to cart first
    const cartResult = await addToCart(product.id, 1)
    if (cartResult.success) {
      // Then remove from wishlist
      await removeFromWishlist(product.id)
      alert('✅ Moved to cart!')
    } else {
      alert('❌ Failed to move to cart. Please try again.')
    }
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/products" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 font-heading">My Wishlist</h1>
            <p className="text-gray-600 mt-2">Save your favorite instruments for later</p>
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-8">
                Start adding your favorite instruments to create your perfect collection.
              </p>
              <Link to="/products">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full">
                  Explore Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">My Wishlist</h1>
              <p className="text-gray-600 mt-2">
                {getWishlistCount()} {getWishlistCount() === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item, index) => {
            const product = item.products
            if (!product) return null

            const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]
            const rating = product.average_rating || 4.5
            const reviewCount = product.total_reviews || Math.floor(Math.random() * 50) + 10

            return (
              <motion.div
                key={item.product_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    {/* Product Image */}
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        {primaryImage ? (
                          <img
                            src={primaryImage.image_url}
                            alt={primaryImage.alt_text || product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                            <Music className="h-16 w-16 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-500" />
                    </button>

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                      {product.is_sale && (
                        <span className="bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                          Sale
                        </span>
                      )}
                      {product.suitable_for && (
                        <span className="bg-gray-900/90 text-white px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm">
                          {product.suitable_for[0].charAt(0).toUpperCase() + product.suitable_for[0].slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Product Info */}
                    <Link to={`/product/${product.id}`} className="block mb-4">
                      <div className="space-y-2">
                        {product.brands?.name && (
                          <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">
                            {product.brands.name}
                          </p>
                        )}
                        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 text-lg leading-tight">
                          {product.name}
                        </h3>
                      </div>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-400">({reviewCount})</span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                      {product.original_price && product.original_price > product.price && (
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(product.original_price)}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleMoveToCart(product)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Move to Cart
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAddToCart(product)}
                          variant="outline"
                          className="flex-1"
                        >
                          Add to Cart
                        </Button>
                        <Button
                          onClick={() => handleRemoveFromWishlist(product.id)}
                          variant="outline"
                          className="px-3 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </div>

                    {/* Added Date */}
                    <p className="text-xs text-gray-400 mt-3">
                      Added {new Date(item.added_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link to="/products">
            <Button variant="outline" className="px-8 py-3 rounded-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
