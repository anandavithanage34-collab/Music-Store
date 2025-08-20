import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Phone, CreditCard, Truck, Shield, Check, Music } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { formatPrice } from '../../lib/utils'
import { SriLankanCities } from '../../types'
import { supabase } from '../../lib/supabase'
import OrderService from '../../lib/orderService'

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { profile, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
    } else if (cartItems.length === 0) {
      navigate('/cart')
    }
  }, [user, cartItems.length, navigate])

  const [orderData, setOrderData] = useState({
    shipping_address: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address_line_1: '',
      address_line_2: '',
      city: user?.city || '',
      postal_code: ''
    },
    billing_address: {
      same_as_shipping: true,
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address_line_1: '',
      address_line_2: '',
      city: user?.city || '',
      postal_code: ''
    },
    payment_method: 'cash_on_delivery',
    customer_notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const cartTotal = getCartTotal()
  const deliveryFee = cartTotal >= 15000 ? 0 : 1500
  const finalTotal = cartTotal + deliveryFee

  const handleShippingChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      shipping_address: {
        ...prev.shipping_address,
        [field]: value
      }
    }))

    // Auto-update billing if same as shipping
    if (orderData.billing_address.same_as_shipping) {
      setOrderData(prev => ({
        ...prev,
        billing_address: {
          ...prev.billing_address,
          [field]: value
        }
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const { shipping_address } = orderData

    if (!shipping_address.full_name) newErrors.shipping_full_name = 'Name is required'
    if (!shipping_address.phone) newErrors.shipping_phone = 'Phone is required'
    if (!shipping_address.address_line_1) newErrors.shipping_address_line_1 = 'Address is required'
    if (!shipping_address.city) newErrors.shipping_city = 'City is required'
    if (!shipping_address.postal_code) newErrors.shipping_postal_code = 'Postal code is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePlaceOrder = async () => {
    if (!validateForm()) return

    if (cartItems.length === 0) {
      setErrors({ submit: 'Your cart is empty. Please add items before checkout.' })
      return
    }

    setLoading(true)
    setErrors({}) // Clear previous errors
    
    try {
      console.log('🚀 Starting order placement process...')
      
      // Prepare order data for the service
      const orderDataForService = {
        user_id: user?.id,
        user_email: user?.email,
        total_amount: finalTotal,
        subtotal: cartTotal,
        delivery_fee: deliveryFee,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        customer_notes: orderData.customer_notes,
        payment_method: orderData.payment_method
      }

      // Try to create order using the enhanced service
      let orderResult = null
      
      try {
        console.log('📊 Attempting to create order in Supabase...')
        orderResult = await OrderService.createOrder(orderDataForService, cartItems)
        
        if (!orderResult.success) {
          throw new Error(orderResult.error || 'Order creation failed')
        }
        
        console.log('✅ Order created successfully in Supabase:', orderResult.orderId)
        
      } catch (dbError) {
        console.log('⚠️ Supabase order creation failed, falling back to mock order:', dbError)
        
        // Fallback to mock order for development/testing
        orderResult = OrderService.createMockOrder(orderDataForService, cartItems)
        
        if (!orderResult.success) {
          throw new Error('Failed to create both database and mock orders')
        }
        
        console.log('📝 Mock order created as fallback:', orderResult.orderId)
      }

      // Clear cart after successful order creation
      await clearCart()

      // Show success message
      const successMessage = orderResult.isMock 
        ? '🎉 Order placed successfully! (Development Mode - Mock Order)'
        : '🎉 Order placed successfully! Redirecting to confirmation page...'
      
      alert(successMessage)

      // Navigate to success page
      navigate(`/order-success/${orderResult.orderId}`)

    } catch (error) {
      console.error('❌ Error placing order:', error)
      setErrors({ 
        submit: `Failed to place order: ${error.message}. Please try again.` 
      })
    } finally {
      setLoading(false)
    }
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
                Final Step
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-heading">
                Secure
                <span className="block text-gray-600 italic font-light">Checkout</span>
              </h1>
              <p className="text-xl luxury-text max-w-2xl mx-auto">
                Complete your order with confidence. Your musical journey begins here.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="premium-card overflow-hidden">
                  <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3 font-heading">
                      <div className="p-2 bg-gray-900 rounded-full">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      Shipping Address
                    </h3>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={orderData.shipping_address.full_name}
                          onChange={(e) => handleShippingChange('full_name', e.target.value)}
                          placeholder="Full name"
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300 ${errors.shipping_full_name ? 'border-red-500' : ''}`}
                        />
                        {errors.shipping_full_name && (
                          <p className="text-red-500 text-sm mt-1">{errors.shipping_full_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="text"
                          value={orderData.shipping_address.phone}
                          onChange={(e) => handleShippingChange('phone', e.target.value)}
                          placeholder="+94 77 123 4567"
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300 ${errors.shipping_phone ? 'border-red-500' : ''}`}
                        />
                        {errors.shipping_phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.shipping_phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                      <input
                        type="text"
                        value={orderData.shipping_address.address_line_1}
                        onChange={(e) => handleShippingChange('address_line_1', e.target.value)}
                        placeholder="Street address, house number"
                        className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300 ${errors.shipping_address_line_1 ? 'border-red-500' : ''}`}
                      />
                      {errors.shipping_address_line_1 && (
                        <p className="text-red-500 text-sm mt-1">{errors.shipping_address_line_1}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={orderData.shipping_address.address_line_2}
                        onChange={(e) => handleShippingChange('address_line_2', e.target.value)}
                        placeholder="Apartment, suite, building (optional)"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <select
                          value={orderData.shipping_address.city}
                          onChange={(e) => handleShippingChange('city', e.target.value)}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300 ${errors.shipping_city ? 'border-red-500' : ''}`}
                        >
                          <option value="">Select City</option>
                          {SriLankanCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        {errors.shipping_city && (
                          <p className="text-red-500 text-sm mt-1">{errors.shipping_city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={orderData.shipping_address.postal_code}
                          onChange={(e) => handleShippingChange('postal_code', e.target.value)}
                          placeholder="10000"
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300 ${errors.shipping_postal_code ? 'border-red-500' : ''}`}
                        />
                        {errors.shipping_postal_code && (
                          <p className="text-red-500 text-sm mt-1">{errors.shipping_postal_code}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="premium-card overflow-hidden">
                  <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3 font-heading">
                      <div className="p-2 bg-gray-900 rounded-full">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      Payment Method
                    </h3>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center space-x-3 p-4 border border-primary-200 bg-primary-50 rounded-lg">
                      <input
                        type="radio"
                        id="cod"
                        name="payment"
                        value="cash_on_delivery"
                        checked={orderData.payment_method === 'cash_on_delivery'}
                        onChange={(e) => setOrderData(prev => ({ ...prev, payment_method: e.target.value }))}
                        className="text-primary-600"
                      />
                      <label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Cash on Delivery</p>
                            <p className="text-sm text-gray-600">Pay when you receive your order</p>
                          </div>
                          <Truck className="h-5 w-5 text-primary-600" />
                        </div>
                      </label>
                    </div>

                    <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg opacity-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-500">Online Payment</p>
                          <p className="text-sm text-gray-400">Coming soon - Card, Bank Transfer</p>
                        </div>
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Customer Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="premium-card overflow-hidden">
                  <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 font-heading">Special Instructions</h3>
                  </div>
                  <div className="p-8">
                    <textarea
                      value={orderData.customer_notes}
                      onChange={(e) => setOrderData(prev => ({ ...prev, customer_notes: e.target.value }))}
                      placeholder="Any special instructions for delivery or product preferences..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="sticky top-32 space-y-8"
              >
                <div className="premium-card overflow-hidden">
                  <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 font-heading">Order Summary</h3>
                  </div>
                  <div className="p-8 space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {cartItems.map((item, index) => (
                        <div key={item.id || item.product_id || index} className="flex items-center space-x-3 text-sm">
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {item.products?.product_images?.[0] ? (
                              <img
                                src={item.products.product_images[0].image_url}
                                alt={item.products.name || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {item.products?.name || `Product ${item.product_id}`}
                            </p>
                            <p className="text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-gray-900">
                            {formatPrice((item.products?.price || item.price || 0) * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t border-gray-100 pt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="luxury-text">Subtotal</span>
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
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-900 font-heading">Total</span>
                          <span className="text-2xl font-bold text-gray-900 font-heading">{formatPrice(finalTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Place Order */}
                <div className="premium-card overflow-hidden">
                  <div className="p-8">
                    {errors.submit && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-red-800 text-sm">{errors.submit}</p>
                      </div>
                    )}

                    <Button
                      onClick={handlePlaceOrder}
                      className="w-full mb-4"
                      size="lg"

                      disabled={loading || cartItems.length === 0}
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Place Order - {formatPrice(finalTotal)}
                    </Button>

                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>Cash on Delivery available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>Island-wide delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>Warranty protection included</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="premium-card overflow-hidden">
                  <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 font-heading">Delivery Information</h3>
                  </div>
                  <div className="p-8 text-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <Truck className="h-4 w-4 text-white" />
                      </div>
                      <span className="luxury-text">Standard delivery: 2-5 business days</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <span className="luxury-text">Available across Sri Lanka</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <span className="luxury-text">SMS tracking updates</span>
                    </div>
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