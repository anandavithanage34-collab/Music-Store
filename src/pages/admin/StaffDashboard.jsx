import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Package, Users, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

const StaffOverview = () => {
  const stats = [
    { label: 'Orders to Process', value: '12', icon: ShoppingBag, color: 'text-orange-600' },
    { label: 'Low Stock Items', value: '5', icon: Package, color: 'text-red-600' },
    { label: 'Customer Inquiries', value: '8', icon: Users, color: 'text-blue-600' }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Staff Dashboard</h1>
        <p className="text-gray-600">Manage orders and inventory</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Task management system will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function StaffDashboard() {
  const location = useLocation()
  
  const sidebarItems = [
    { name: 'Overview', href: '/staff', icon: BarChart3 },
    { name: 'Orders', href: '/staff/orders', icon: ShoppingBag },
    { name: 'Inventory', href: '/staff/inventory', icon: Package }
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
            <h2 className="text-xl font-bold text-gray-900 font-heading">Staff Panel</h2>
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
            <Route path="/" element={<StaffOverview />} />
            <Route path="/orders" element={<div>Order Processing (Coming Soon)</div>} />
            <Route path="/inventory" element={<div>Inventory Management (Coming Soon)</div>} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
