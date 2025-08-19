import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Music } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { formatPrice } from '../../lib/utils'

export default function CartPage() {
  const { cartItems, updateCartItem, removeFromCart, getCartTotal, loading } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const cartTotal = getCartTotal()
  const deliveryFee = cartTotal >= 15000 ? 0 : 1500 // Free delivery over LKR 15,000
  const finalTotal = cartTotal + deliveryFee

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(productId)
    } else {
      await updateCartItem(productId, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
    } else {
      navigate('/checkout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
          <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-heading">
            Your Cart is
            <span className="block text-gray-600 italic font-light">Empty</span>
          </h1>
          <p className="text-xl luxury-text mb-12 max-w-2xl mx-auto">
            Discover exceptional musical instruments crafted to inspire your next masterpiece
          </p>
          <Link to="/products">
            <Button className="elegant-button text-lg px-12 py-4">
              Explore Collection
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-secondary-600 font-medium tracking-wider uppercase text-sm mb-4">
                Your Selection
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-heading">
                Shopping
                <span className="block text-gray-600 italic font-light">Cart</span>
              </h1>
              <p className="text-xl luxury-text">
                {cartItems.length} carefully chosen {cartItems.length === 1 ? 'instrument' : 'instruments'} await your approval
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id || item.product_id || index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="premium-card overflow-hidden">
                                        <div className="p-8">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Product Image */}
                        <div className="w-full sm:w-32 h-56 sm:h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                          {item.products?.product_images?.[0] ? (
                            <img
                              src={item.products.product_images[0].image_url}
                              alt={item.products.name || 'Product'}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                              <Music className="h-10 w-10 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-4">
                          <div>
                            {item.products?.brands?.name && (
                              <p className="text-sm font-medium text-gray-500 tracking-wide uppercase mb-2">{item.products.brands.name}</p>
                            )}
                            <h3 className="text-xl font-semibold text-gray-900 font-heading">
                              <Link 
                                to={`/product/${item.product_id}`}
                                className="hover:text-gray-700 transition-colors duration-300"
                              >
                                {item.products?.name || `Product ${item.product_id}`}
                              </Link>
                            </h3>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-4">
                              <span className="text-sm font-medium text-gray-700">Quantity</span>
                              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                  className="p-3 hover:bg-gray-900 hover:text-white transition-all duration-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={item.quantity <= 1}
                                  title="Decrease quantity"
                                >
                                  <Minus className="h-4 w-4" />
                                </motion.button>
                                <span className="px-4 py-3 text-center min-w-[60px] font-medium text-gray-900">
                                  {item.quantity}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                  className="p-3 hover:bg-gray-900 hover:text-white transition-all duration-300 text-gray-600"
                                  title="Increase quantity"
                                >
                                  <Plus className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </div>

                            {/* Price and Remove */}
                            <div className="flex items-center justify-between sm:justify-end gap-6">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900 font-heading">
                                  {formatPrice((item.products?.price || item.price || 0) * item.quantity)}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-sm luxury-text">
                                    {formatPrice(item.products?.price || item.price || 0)} each
                                  </p>
                                )}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  if (confirm('Are you sure you want to remove this item from your cart?')) {
                                    removeFromCart(item.product_id)
                                  }
                                }}
                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
                                title="Remove from cart"
                              >
                                <Trash2 className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="sticky top-32"
              >
                <div className="premium-card overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-heading">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="luxury-text">Subtotal ({cartItems.length} items)</span>
                        <span className="text-lg font-semibold text-gray-900">{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="luxury-text">Delivery Fee</span>
                        <span className={`text-lg font-semibold ${
                          deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                        </span>
                      </div>
                      {cartTotal < 15000 && (
                        <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4">
                          <p className="text-sm text-secondary-800 font-medium">
                            Add {formatPrice(15000 - cartTotal)} more for free delivery!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-6 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900 font-heading">Total</span>
                        <span className="text-2xl font-bold text-gray-900 font-heading">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          onClick={handleCheckout}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl text-lg font-medium transition-all duration-300"
                          size="lg"
                        >
                          {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                          <ArrowRight className="ml-3 h-5 w-5" />
                        </Button>
                      </motion.div>

                      <div className="text-center">
                        <Link
                          to="/products"
                          className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-300 inline-flex items-center group"
                        >
                          Continue Shopping
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="bg-gray-50 p-6 text-center">
                    <p className="text-sm luxury-text">
                      🔒 Secure checkout • Cash on Delivery available • Island-wide delivery
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
