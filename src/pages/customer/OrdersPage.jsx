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
      
      // Set up real-time subscription for order updates from order_details table
      const ordersSubscription = supabase
        .channel('customer_order_details_changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'order_details' }, 
          (payload) => {
            console.log('🔄 Order updated in real-time:', payload.new)
            // Check if this order belongs to the current user
            if (payload.new.user_id === user.id) {
              console.log('✅ Order belongs to current user, updating...')
              // Update the specific order in the local state
              setOrders(prevOrders => 
                prevOrders.map(order => 
                  order.id === payload.new.id 
                    ? { ...order, ...payload.new }
                    : order
                )
              )
            }
          }
        )
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'order_details' },
          (payload) => {
            console.log('🆕 New order received in real-time:', payload.new)
            // Check if this new order belongs to the current user
            if (payload.new.user_id === user.id) {
              console.log('✅ New order belongs to current user, adding...')
              // Add the new order to the local state
              setOrders(prevOrders => [payload.new, ...prevOrders])
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(ordersSubscription)
      }
    }
  }, [user])



  const fetchOrders = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      console.log('🔍 Fetching orders for user:', user.id)
      
      // Fetch orders from the simplified order_details table
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching orders:', error)
        throw error
      }

      if (data && data.length > 0) {
        console.log('📊 Orders found from order_details table:', data)
        
        // Transform the data to match the expected format
        const transformedOrders = data.map(order => ({
          id: order.id,
          order_number: order.order_number,
          user_id: order.user_id,
          status: order.order_status,
          payment_status: order.payment_status,
          total_amount: order.total_amount,
          subtotal: order.subtotal,
          delivery_fee: order.delivery_fee,
          payment_method: order.payment_method,
          customer_notes: order.customer_notes,
          admin_notes: order.admin_notes,
          tracking_number: order.tracking_number,
          estimated_delivery_date: order.estimated_delivery_date,
          actual_delivery_date: order.actual_delivery_date,
          created_at: order.created_at,
          updated_at: order.updated_at,
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
          // Extract items from the JSON order_items field
          order_items: order.order_items || [],
          total_items: order.total_items || 0
        }))
        
        setOrders(transformedOrders)
      } else {
        console.log('🔄 No orders found for user')
        setOrders([])
      }
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Function to manually refresh orders
  const handleRefreshOrders = async () => {
    setLoading(true)
    await fetchOrders()
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-heading">My Orders</h1>
                <p className="text-gray-600 mt-2">Track your purchase history and order status</p>
              </div>
              <Button 
                onClick={handleRefreshOrders} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Refresh Orders
              </Button>
            </div>
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
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-semibold text-lg">{formatPrice(order.total_amount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Items</p>
                          <p className="font-semibold">{order.total_items || order.order_items?.length || 0} item(s)</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Status</p>
                          <p className="font-semibold">{order.payment_status || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-semibold">{order.payment_method || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Order Details (Expandable) */}
                      {selectedOrder === order.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t pt-4 space-y-4"
                        >
                          {/* Order Items */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                            <div className="space-y-3">
                              {order.order_items?.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {item.product_image ? (
                                      <img
                                        src={item.product_image}
                                        alt={item.product_name}
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
                                      {item.product_name || `Product ${item.product_id}`}
                                    </p>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                    {item.product_sku && (
                                      <p className="text-xs text-gray-400">SKU: {item.product_sku}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                      {formatPrice(item.total_price)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {formatPrice(item.unit_price)} each
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping Address */}
                          {order.shipping_address && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm">
                                    <p className="font-medium">{order.shipping_address.full_name}</p>
                                    <p className="text-gray-600">{order.shipping_address.address_line_1}</p>
                                    {order.shipping_address.address_line_2 && (
                                      <p className="text-gray-600">{order.shipping_address.address_line_2}</p>
                                    )}
                                    <p className="text-gray-600">
                                      {order.shipping_address.city}, {order.shipping_address.postal_code}
                                    </p>
                                    <p className="text-gray-600">{order.shipping_address.phone}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Order Status Timeline */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Order Status</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                <span className="font-medium">
                                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  • Last updated: {formatDate(order.updated_at || order.created_at)}
                                </span>
                              </div>
                              {order.admin_notes && (
                                <p className="text-sm text-gray-600 mt-2 italic">
                                  Admin Note: {order.admin_notes}
                                </p>
                              )}
                              {order.tracking_number && (
                                <p className="text-sm text-gray-600 mt-2">
                                  Tracking: <span className="font-mono">{order.tracking_number}</span>
                                </p>
                              )}
                            </div>
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
