import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Plus,
  Settings,
  BarChart3,
  FileText,
  Bell,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import ProductManagement from '../../components/admin/ProductManagement'
import OrderManagement from '../../components/admin/OrderManagement'

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  })
  const [newOrders, setNewOrders] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)

  console.log('🏗️ AdminDashboard component rendered with stats:', stats)

  // Log when component mounts
  useEffect(() => {
    console.log('🚀 AdminDashboard mounted, fetching initial stats...')
  }, [])

  // Function to update stats immediately when new order arrives
  const updateStatsForNewOrder = (newOrder) => {
    console.log('📊 Updating stats for new order from order_details:', newOrder)
    
    setStats(prev => {
      // Update stats immediately for new orders from order_details table
      return {
        ...prev,
        totalOrders: prev.totalOrders + 1,
        totalRevenue: prev.totalRevenue + (newOrder.total_amount || 0)
      }
    })
  }

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true)
      console.log('📊 Fetching real dashboard stats from order_details table...')
      
      // Get basic counts from database
      const [productsResult, orderDetailsResult, usersResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('order_details').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' })
      ])
      
      // Get revenue from order_details table
      const { data: revenueData, error: revenueError } = await supabase
        .from('order_details')
        .select('total_amount')
      
      let totalRevenue = 0
      if (!revenueError && revenueData) {
        totalRevenue = revenueData.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      }
      
      // Get recent orders count (last 24 hours) from order_details table
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const { data: recentOrders, error: recentError } = await supabase
        .from('order_details')
        .select('id')
        .gte('created_at', yesterday.toISOString())
      
      const recentOrdersCount = recentError ? 0 : (recentOrders?.length || 0)
      
      // Get total orders and revenue from order_details table
      const totalOrders = orderDetailsResult.count || 0
      const totalRevenueCombined = totalRevenue
      const totalRecentOrders = recentOrdersCount
      
      console.log('✅ Dashboard stats fetched from order_details table:', {
        products: productsResult.count || 0,
        orders: totalOrders,
        users: usersResult.count || 0,
        revenue: totalRevenueCombined,
        recentOrders: totalRecentOrders,
        dbOrders: orderDetailsResult.count || 0,
        dbRevenue: totalRevenue
      })
      
      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: totalOrders,
        totalUsers: usersResult.count || 0,
        totalRevenue: totalRevenueCombined,
        recentOrders: totalRecentOrders
      })
    } catch (error) {
      console.error('❌ Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch dashboard stats immediately
    fetchDashboardStats()
    
    // Set up real-time subscription for new orders from order_details table
    const ordersSubscription = supabase
      .channel('admin_order_details_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'order_details' }, 
        (payload) => {
          console.log('🆕 New order received from order_details:', payload.new)
          setNewOrders(prev => [payload.new, ...prev.slice(0, 4)]) // Keep last 5 new orders
          // Immediately update stats when new order arrives
          updateStatsForNewOrder(payload.new)
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'order_details' },
        (payload) => {
          console.log('🔄 Order updated in order_details:', payload.new)
          // Refresh stats when order status changes (affects revenue calculations)
          fetchDashboardStats()
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'order_details' },
        () => {
          console.log('🗑️ Order deleted from order_details')
          // Refresh stats when order status changes
          fetchDashboardStats()
        }
      )
      .subscribe()

    // Listen for order status updates from OrderManagement component
    const handleOrderStatusUpdate = (event) => {
      console.log('🔄 Order status updated via component:', event.detail)
      // Refresh dashboard stats when order status is updated
      fetchDashboardStats()
    }

    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdate)

    return () => {
      supabase.removeChannel(ordersSubscription)
      window.removeEventListener('orderStatusUpdated', handleOrderStatusUpdate)
    }
  }, []) // Empty dependency array to run only once on mount

  // Redirect if not admin - MUST be after all hooks
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh requested')
    await fetchDashboardStats()
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const clearNotifications = () => {
    setNewOrders([])
    setShowNotifications(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Harmony House Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  {newOrders.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {newOrders.length}
                    </span>
                  )}
                </Button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearNotifications}
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      </div>
                      
                      {newOrders.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No new orders</p>
                      ) : (
                        <div className="space-y-2">
                          {newOrders.map((order, index) => (
                            <div key={order.id || index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  New Order #{order.order_number || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  LKR {order.total_amount?.toLocaleString() || '0'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.customer_full_name || 'Customer'}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(order.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <span className="text-sm text-gray-600">
                Welcome, {user?.full_name || user?.username}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
          <Button 
            onClick={handleManualRefresh} 
            variant="outline" 
            size="sm"
            disabled={statsLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            {statsLoading ? 'Refreshing...' : 'Refresh Stats'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Active products in catalog
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {stats.totalOrders}
                {statsLoading && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Total orders ({stats.recentOrders || 0} today)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                LKR {stats.totalRevenue?.toLocaleString() || '0'}
                {statsLoading && (
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Total revenue from orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* New Orders Alert */}
        {newOrders.length > 0 && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800">
                      {newOrders.length} new order{newOrders.length > 1 ? 's' : ''} received!
                    </p>
                    <p className="text-xs text-orange-700">
                      Check the Orders tab to process them
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                    className="text-orange-700 border-orange-300 hover:bg-orange-100"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Admin Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
              {newOrders.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {newOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Detailed insights and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    Analytics dashboard coming soon. Track sales, customer behavior, and performance metrics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>
                  Configure system settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    Settings panel coming soon. Manage system configuration and admin preferences.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}