import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { 
  Search, 
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const [statusForm, setStatusForm] = useState({
    status: '',
    admin_notes: '',
    tracking_number: ''
  })

  useEffect(() => {
    fetchOrders()
    
    // Set up real-time subscription for order_details table
    const ordersSubscription = supabase
      .channel('order_details_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'order_details' }, 
        () => {
          console.log('🔄 Order details changed, refreshing...')
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersSubscription)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('📦 Fetching all orders from order_details table...')
      
      // Fetch from the simplified order_details table
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching orders:', error)
        throw error
      }
      
      // Transform the data to match the expected format
      const transformedOrders = (data || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        user_id: order.user_id,
        customer: {
          full_name: order.customer_full_name,
          email: order.customer_email,
          phone: order.customer_phone,
          city: order.delivery_city
        },
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        total_amount: order.total_amount,
        subtotal: order.subtotal,
        delivery_fee: order.delivery_fee,
        status: order.order_status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        customer_notes: order.customer_notes,
        admin_notes: order.admin_notes,
        tracking_number: order.tracking_number,
        estimated_delivery_date: order.estimated_delivery_date,
        actual_delivery_date: order.actual_delivery_date,
        created_at: order.created_at,
        updated_at: order.updated_at,
        // Extract items from the JSON order_items field
        items: order.order_items || [],
        total_items: order.total_items || 0
      }))
      
      console.log('✅ Orders fetched from order_details table:', transformedOrders)
      setOrders(transformedOrders)
      setLastRefresh(new Date())
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError('')
      
      if (!selectedOrder) {
        setError('No order selected')
        return
      }

      console.log('🔄 Updating order status:', selectedOrder.id, statusForm)
      
      // Update the order in order_details table
      const { error: updateError } = await supabase
        .from('order_details')
        .update({
          order_status: statusForm.status,
          admin_notes: statusForm.admin_notes,
          tracking_number: statusForm.tracking_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id)

      if (updateError) {
        console.error('❌ Error updating order:', updateError)
        throw updateError
      }

      console.log('✅ Order status updated successfully')
      setSuccess('Order status updated successfully')
      setShowStatusDialog(false)
      setStatusForm({ status: '', admin_notes: '', tracking_number: '' })
      setSelectedOrder(null)
      
      // Refresh orders
      await fetchOrders()
      
    } catch (error) {
      console.error('❌ Error updating order status:', error)
      setError('Failed to update order status')
    } finally {
      setLoading(false)
    }
  }

  const openStatusDialog = (order) => {
    setSelectedOrder(order)
    setStatusForm({
      status: order.status,
      admin_notes: order.admin_notes || '',
      tracking_number: order.tracking_number || ''
    })
    setShowStatusDialog(true)
  }

  const openOrderDialog = (order) => {
    setSelectedOrder(order)
    setShowOrderDialog(true)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">View and manage customer orders</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          onClick={handleManualRefresh} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Orders'}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders found'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <p className="text-sm text-gray-400 mt-2">
                Orders will appear here once customers place them
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <Card key={order.id || order.order_number} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        Order #{order.order_number || 'N/A'}
                      </h3>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{order.customer?.full_name || order.shipping_address?.full_name || 'Unknown Customer'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{order.customer?.phone || order.shipping_address?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">LKR {order.total_amount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openOrderDialog(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openStatusDialog(order)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Update Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.order_number || 'N/A'}</DialogTitle>
            <DialogDescription>
              Complete order information and customer details
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-semibold">#{selectedOrder.order_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1) || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold">LKR {selectedOrder.total_amount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span>{selectedOrder.payment_method || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span>{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'N/A'}</span>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking:</span>
                        <span className="font-mono text-sm">{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold">{selectedOrder.customer?.full_name || selectedOrder.shipping_address?.full_name || 'Unknown Customer'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedOrder.customer?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{selectedOrder.customer?.phone || selectedOrder.shipping_address?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span>{selectedOrder.customer?.city || selectedOrder.shipping_address?.city || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{formatAddress(selectedOrder.shipping_address)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOrder.items.map(item => (
                        <div key={item.id || item.product_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{item.product_name || `Product ${item.product_id}`}</p>
                            <p className="text-sm text-gray-600">SKU: {item.sku || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {item.quantity} × LKR {item.unit_price?.toLocaleString() || '0'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: LKR {item.total_price?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedOrder.customer_notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedOrder.customer_notes}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedOrder.admin_notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Admin Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedOrder.admin_notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status and add tracking information for order #{selectedOrder?.order_number || 'N/A'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Order Status *</label>
              <Select value={statusForm.status} onValueChange={(value) => setStatusForm(prev => ({...prev, status: value}))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-60 overflow-y-auto">
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="confirmed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      Confirmed
                    </div>
                  </SelectItem>
                  <SelectItem value="processing">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-500" />
                      Processing
                    </div>
                  </SelectItem>
                  <SelectItem value="shipped">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-orange-500" />
                      Shipped
                    </div>
                  </SelectItem>
                  <SelectItem value="delivered">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Delivered
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Tracking Number</label>
              <Input
                value={statusForm.tracking_number}
                onChange={(e) => setStatusForm(prev => ({...prev, tracking_number: e.target.value}))}
                placeholder="Enter tracking number (optional)"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={statusForm.admin_notes}
                onChange={(e) => setStatusForm(prev => ({...prev, admin_notes: e.target.value}))}
                placeholder="Add notes about this status update (optional)"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    case 'processing':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    case 'shipped':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    case 'delivered':
      return 'bg-green-100 text-green-800 hover:bg-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-200'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />
    case 'confirmed':
      return <CheckCircle className="w-4 h-4" />
    case 'processing':
      return <Package className="w-4 h-4" />
    case 'shipped':
      return <Truck className="w-4 h-4" />
    case 'delivered':
      return <CheckCircle className="w-4 h-4" />
    case 'cancelled':
      return <XCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const formatAddress = (address) => {
  if (!address) return 'No address provided'
  
  const parts = []
  if (address.full_name) parts.push(address.full_name)
  if (address.address_line_1) parts.push(address.address_line_1)
  if (address.address_line_2) parts.push(address.address_line_2)
  if (address.city) parts.push(address.city)
  if (address.postal_code) parts.push(address.postal_code)
  if (address.phone) parts.push(`Phone: ${address.phone}`)
  
  return parts.join(', ')
}
