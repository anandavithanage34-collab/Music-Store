import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Package, Users, ShoppingBag, BarChart3, Settings, 
  Plus, TrendingUp, DollarSign, Star 
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

const AdminOverview = () => {
  const stats = [
    { label: 'Total Products', value: '247', icon: Package, color: 'text-blue-600' },
    { label: 'Total Customers', value: '1,234', icon: Users, color: 'text-green-600' },
    { label: 'Orders Today', value: '23', icon: ShoppingBag, color: 'text-orange-600' },
    { label: 'Revenue This Month', value: 'LKR 2,450,000', icon: DollarSign, color: 'text-purple-600' }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your music store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 justify-start" variant="outline">
              <Plus className="mr-3 h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Add Product</p>
                <p className="text-sm text-gray-500">Add new instrument</p>
              </div>
            </Button>
            <Button className="h-16 justify-start" variant="outline">
              <Users className="mr-3 h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Manage Users</p>
                <p className="text-sm text-gray-500">View customer accounts</p>
              </div>
            </Button>
            <Button className="h-16 justify-start" variant="outline">
              <ShoppingBag className="mr-3 h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">View Orders</p>
                <p className="text-sm text-gray-500">Process orders</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">
                Recent orders will be displayed here once the database is connected.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">
                Sales analytics will be displayed here once products are added.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const location = useLocation()
  
  const sidebarItems = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-64 bg-white shadow-lg min-h-screen"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 font-heading">Admin Panel</h2>
          </div>
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/products" element={<div>Product Management (Coming Soon)</div>} />
            <Route path="/orders" element={<div>Order Management (Coming Soon)</div>} />
            <Route path="/customers" element={<div>Customer Management (Coming Soon)</div>} />
            <Route path="/reviews" element={<div>Review Management (Coming Soon)</div>} />
            <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
