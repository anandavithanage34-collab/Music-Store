import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft, Plus, Minus, Play } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useWishlist } from '../../hooks/useWishlist'
import { formatPrice, getSkillLevelColor } from '../../lib/utils'
import { sampleProducts } from '../../lib/sampleData'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const { addToCart } = useCart()
  const { profile } = useAuth()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [id])

  const fetchProduct = async () => {
    try {
      // Always use hardcoded sample data - find product by ID
      const foundProduct = sampleProducts.find(p => p.id === id)
      
      if (foundProduct) {
        setProduct(foundProduct)
      } else {
        setProduct(null)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    // For now, use empty reviews array since we're using hardcoded data
    // In a real app, this would fetch from the database
    setReviews([])
  }

  const [addToCartSuccess, setAddToCartSuccess] = useState(false)

  const handleAddToCart = async () => {
    try {
      const result = await addToCart(product.id, quantity)
      if (result.success) {
        setAddToCartSuccess(true)
        // Clear success message after 3 seconds
        setTimeout(() => setAddToCartSuccess(false), 3000)
      } else {
        alert('❌ Failed to add item to cart. Please try again.')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('❌ Failed to add item to cart. Please try again.')
    }
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const isRecommendedForUser = () => {
    if (!profile?.skill_level || !product?.suitable_for) return false
    return product.suitable_for.includes(profile.skill_level)
  }

  const isInStock = product?.inventory?.quantity_available > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link to="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/products">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg overflow-hidden border">
              {product.product_images?.[selectedImage] ? (
                <img
                  src={product.product_images[selectedImage].image_url}
                  alt={product.product_images[selectedImage].alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Music className="h-24 w-24" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.product_images?.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.product_images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div>
              {product.brands?.name && (
                <p className="text-lg text-primary-600 font-medium mb-2">{product.brands.name}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xl text-gray-500 line-through ml-3">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>

              {/* Suitability */}
              {product.suitable_for && product.suitable_for.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900 mb-2">Suitable for:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.suitable_for.map((level) => (
                      <span
                        key={level}
                        className={`px-3 py-1 text-sm font-medium rounded-full border ${getSkillLevelColor(level)}`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </span>
                    ))}
                  </div>
                  {isRecommendedForUser() && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      ✨ Recommended for your skill level
                    </p>
                  )}
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {isInStock ? (
                  <p className="text-green-600 font-medium">
                    ✓ In Stock ({product.inventory?.quantity_available} available)
                  </p>
                ) : (
                  <p className="text-red-600 font-medium">⚠ Out of Stock</p>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[60px]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= (product.inventory?.quantity_available || 0)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 ${addToCartSuccess ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  size="lg"
                  disabled={!isInStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {addToCartSuccess ? 'Added to Cart!' : 'Add to Cart'}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={async () => {
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
                  <Heart className={`mr-2 h-4 w-4 ${
                    isInWishlist(product.id) ? 'text-red-500 fill-current' : ''
                  }`} />
                  {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary-600" />
                  <span>Free delivery over LKR 15,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary-600" />
                  <span>{product.warranty_months} months warranty</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {product.description || 'No description available.'}
                  </p>
                  
                  {/* View Video Button */}
                  {product.video_url && (
                    <div className="mt-6">
                      <Button
                        onClick={() => window.open(product.video_url, '_blank')}
                        variant="outline"
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 hover:text-red-800"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        View Video
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                        </span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {review.profiles?.full_name || 'Anonymous'}
                              </span>
                              {review.is_verified && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                        )}
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                    
                    {reviews.length > 5 && (
                      <Button variant="outline" className="w-full">
                        View All Reviews
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Info */}
            {product.brands && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brand: {product.brands.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.brands.description && (
                    <p className="text-gray-600 text-sm mb-3">{product.brands.description}</p>
                  )}
                  {product.brands.country_origin && (
                    <p className="text-sm text-gray-500">
                      Origin: {product.brands.country_origin}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Warranty & Service */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Warranty & Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary-600" />
                  <span>{product.warranty_months} months manufacturer warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary-600" />
                  <span>Free delivery island-wide</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary-600">🛠️</span>
                  <span>Local service center support</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary-600">📞</span>
                  <span>Expert consultation available</span>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Accessories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">You might also need</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">
                  Recommended accessories and complementary products will be shown here.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
