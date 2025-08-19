import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, MapPin, Clock, ArrowRight, Phone } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { useAuth } from '../../hooks/useAuth'
import { formatPrice, formatDate } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

export default function OrderSuccessPage() {
  const { orderId } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      // Try to fetch from database first
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              price,
              product_images (image_url, is_primary)
            )
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        console.log('Database fetch failed, checking localStorage for mock order')
        
        // Check localStorage for mock orders
        const mockOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]')
        const mockOrder = mockOrders.find(o => o.id === orderId)
        
        if (mockOrder) {
          setOrder(mockOrder)
        } else {
          // Create a basic mock order if not found
          setOrder({
            id: orderId,
            order_number: `MUS-${orderId.slice(-6)}`,
            total_amount: 0,
            status: 'pending',
            created_at: new Date().toISOString(),
            shipping_address: {},
            payment_method: 'cash_on_delivery',
            order_items: []
          })
        }
      } else {
        setOrder(data)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      // Create minimal order object to prevent crashes
      setOrder({
        id: orderId,
        order_number: `MUS-${orderId.slice(-6)}`,
        total_amount: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        order_items: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-heading">
            Order Placed Successfully!
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order Number</p>
                    <p className="font-semibold">{order?.order_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-semibold">{formatDate(order?.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-semibold capitalize">
                      {order?.payment_method?.replace('_', ' ') || 'Cash on Delivery'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-semibold text-lg">{formatPrice(order?.total_amount || 0)}</p>
                  </div>
                </div>

                {order?.customer_notes && (
                  <div>
                    <p className="text-gray-600 text-sm">Special Instructions</p>
                    <p className="text-gray-900 mt-1">{order.customer_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order?.shipping_address ? (
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">
                      {typeof order.shipping_address === 'string' 
                        ? JSON.parse(order.shipping_address).full_name 
                        : order.shipping_address.full_name
                      }
                    </p>
                    <p>
                      {typeof order.shipping_address === 'string' 
                        ? JSON.parse(order.shipping_address).phone 
                        : order.shipping_address.phone
                      }
                    </p>
                    <p>
                      {typeof order.shipping_address === 'string' 
                        ? JSON.parse(order.shipping_address).address_line_1 
                        : order.shipping_address.address_line_1
                      }
                    </p>
                    {((typeof order.shipping_address === 'string' 
                        ? JSON.parse(order.shipping_address).address_line_2 
                        : order.shipping_address.address_line_2
                      )) && (
                      <p>
                        {typeof order.shipping_address === 'string' 
                          ? JSON.parse(order.shipping_address).address_line_2 
                          : order.shipping_address.address_line_2
                        }
                      </p>
                    )}
                    <p>
                      {typeof order.shipping_address === 'string' 
                        ? JSON.parse(order.shipping_address).city 
                        : order.shipping_address.city
                      } {typeof order.shipping_address === 'string' 
                        ? JSON.parse(order.shipping_address).postal_code 
                        : order.shipping_address.postal_code
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Address information not available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order?.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.products?.product_images?.[0] ? (
                            <img
                              src={item.products.product_images[0].image_url}
                              alt={item.products.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.products?.name || `Product ${item.product_id}`}
                          </p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {formatPrice(item.total_price || item.unit_price * item.quantity)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No items found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary-700">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Confirmation</p>
                    <p className="text-gray-600">You'll receive a confirmation call within 2 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-gray-700">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Processing</p>
                    <p className="text-gray-600">We'll prepare your instruments with care</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-gray-700">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delivery</p>
                    <p className="text-gray-600">Delivery within 2-5 business days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-8 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders">
              <Button variant="outline" size="lg">
                View All Orders
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg">
                Continue Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Phone className="h-4 w-4" />
              <span className="font-medium">Need Help?</span>
            </div>
            <p className="text-sm text-blue-700">
              Contact us at +94 11 234 5678 for any questions about your order.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
