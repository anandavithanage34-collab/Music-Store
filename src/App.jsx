import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/customer/HomePage'
import ProductsPage from './pages/customer/ProductsPage'
import ProductDetailPage from './pages/customer/ProductDetailPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import LoginPage from './pages/customer/LoginPage'
import RegisterPage from './pages/customer/RegisterPage'
import OnboardingPage from './pages/customer/OnboardingPage'
import ProfilePage from './pages/customer/ProfilePage'
import OrdersPage from './pages/customer/OrdersPage'
import OrderSuccessPage from './pages/customer/OrderSuccessPage'
import AboutPage from './pages/customer/AboutPage'
import ContactPage from './pages/customer/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import StaffDashboard from './pages/admin/StaffDashboard'
import { AuthProvider } from './hooks/useAuth'
import { CartProvider } from './hooks/useCart'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/staff/*" element={<StaffDashboard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
