import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Calendar, DollarSign, Eye, MapPin, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { useAuth } from '../../hooks/useAuth'
import { formatPrice, formatDate } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user) return

    try {
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        
        // Check localStorage for mock orders
        const mockOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]')
        if (mockOrders.length > 0) {
          setOrders(mockOrders)
          return
        }
        
        // Mock orders for demo if no localStorage orders
        setOrders([
          {
            id: 'mock-order-1',
            order_number: 'MUS-001',
            status: 'delivered',
            total_amount: 25000,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            shipping_address: 'Colombo, Sri Lanka',
            order_items: [
              {
                id: 'item-1',
                quantity: 1,
                price: 25000,
                products: {
                  id: 1,
                  name: 'Yamaha Acoustic Guitar',
                  price: 25000,
                  product_images: [{ image_url: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400', is_primary: true }]
                }
              }
            ]
          },
          {
            id: 'mock-order-2',
            order_number: 'MUS-002', 
            status: 'processing',
            total_amount: 45000,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            shipping_address: 'Kandy, Sri Lanka',
            order_items: [
              {
                id: 'item-2',
                quantity: 1,
                price: 45000,
                products: {
                  id: 2,
                  name: 'Roland Digital Piano',
                  price: 45000,
                  product_images: [{ image_url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400', is_primary: true }]
                }
              }
            ]
          }
        ])
      } else {
        setOrders(data || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'processing':
        return <Package className="h-4 w-4 text-orange-500" />
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'processing':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-heading">My Orders</h1>
            <p className="text-gray-600 mt-2">Track your purchase history and order status</p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">
                Start shopping to see your orders here
              </p>
              <Button onClick={() => window.location.href = '/products'}>
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Order {order.order_number}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Placed on {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-4 md:mt-0">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {selectedOrder === order.id ? 'Hide' : 'View'} Details
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-semibold text-lg">{formatPrice(order.total_amount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Items</p>
                          <p className="font-semibold">{order.order_items?.length || 0} item(s)</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Shipping Address</p>
                          <p className="font-medium flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {order.shipping_address}
                          </p>
                        </div>
                      </div>

                      {/* Order Items Details */}
                      {selectedOrder === order.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t pt-4"
                        >
                          <h4 className="font-semibold mb-3">Order Items</h4>
                          <div className="space-y-3">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                  {item.products?.product_images?.[0] ? (
                                    <img
                                      src={item.products.product_images[0].image_url}
                                      alt={item.products.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Package className="h-6 w-6" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{item.products?.name}</h5>
                                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                  <p className="text-sm font-medium text-gray-900">{formatPrice(item.price)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
