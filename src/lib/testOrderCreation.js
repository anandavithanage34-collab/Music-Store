import OrderService from './orderService'
import OrderViewer from './orderViewer'

/**
 * Test script to verify order creation functionality
 * Run this in the browser console to test order creation
 */

export const testOrderCreation = async () => {
  console.log('🧪 Starting order creation test...')
  
  try {
    // Get user from custom auth system
    const storedUser = localStorage.getItem('harmony_house_user')
    
    if (!storedUser) {
      console.log('❌ No user logged in. Please log in first.')
      return { success: false, error: 'No user logged in' }
    }
    
    const userData = JSON.parse(storedUser)
    console.log('✅ User logged in:', userData.email || userData.username)
    
    // Test data
    const testOrderData = {
      user_id: userData.id,
      user_email: userData.email || userData.username,
      total_amount: 25000,
      subtotal: 25000,
      delivery_fee: 0,
      shipping_address: {
        full_name: 'Test Customer',
        phone: '+94 77 123 4567',
        address_line_1: '123 Test Street',
        city: 'Colombo',
        postal_code: '10000'
      },
      billing_address: {
        full_name: 'Test Customer',
        phone: '+94 77 123 4567',
        address_line_1: '123 Test Street',
        city: 'Colombo',
        postal_code: '10000'
      },
      customer_notes: 'Test order for verification',
      payment_method: 'cash_on_delivery'
    }

    const testCartItems = [
      {
        product_id: 'test-product-1',
        quantity: 1,
        products: {
          name: 'Test Guitar',
          price: 25000,
          sku: 'TEST-001'
        }
      }
    ]

    console.log('📝 Test order data:', testOrderData)
    console.log('🛒 Test cart items:', testCartItems)

    // Test order creation
    const result = await OrderService.createOrder(testOrderData, testCartItems)
    
    if (result.success) {
      console.log('✅ Order creation test PASSED!')
      console.log('📊 Order ID:', result.orderId)
      console.log('🔢 Order Number:', result.orderNumber)
      
      // Test fetching the created order
      const orderDetails = await OrderViewer.getOrderById(result.orderId)
      if (orderDetails.success) {
        console.log('✅ Order details fetched successfully:', orderDetails.data)
      } else {
        console.log('⚠️ Could not fetch order details:', orderDetails.error)
      }
      
    } else {
      console.log('❌ Order creation test FAILED!')
      console.log('Error:', result.error)
    }

    return result

  } catch (error) {
    console.error('❌ Test failed with error:', error)
    return { success: false, error: error.message }
  }
}

export const testOrderViewer = async () => {
  console.log('🔍 Testing OrderViewer functionality...')
  
  try {
    // Test getting all orders
    const allOrders = await OrderViewer.getAllOrders()
    console.log('📋 All orders:', allOrders)
    
    // Test getting order statistics
    const stats = await OrderViewer.getOrderStatistics()
    console.log('📊 Order statistics:', stats)
    
    return { allOrders, stats }
    
  } catch (error) {
    console.error('❌ OrderViewer test failed:', error)
    return { success: false, error: error.message }
  }
}

// Simple test function that can be run directly
export const simpleTest = async () => {
  console.log('🧪 Running simple order creation test...')
  
  try {
    // Get current user from custom auth system
    const storedUser = localStorage.getItem('harmony_house_user')
    
    if (!storedUser) {
      console.log('❌ No user logged in. Please log in first.')
      return { success: false, error: 'No user logged in' }
    }
    
    const userData = JSON.parse(storedUser)
    console.log('✅ User logged in:', userData.email || userData.username)
    
    // Simple test order
    const simpleOrderData = {
      user_id: userData.id,
      user_email: userData.email || userData.username,
      total_amount: 15000,
      subtotal: 15000,
      delivery_fee: 0,
      shipping_address: {
        full_name: 'Test User',
        phone: '+94 77 000 0000',
        address_line_1: 'Test Address',
        city: 'Colombo',
        postal_code: '10000'
      },
      billing_address: {
        full_name: 'Test User',
        phone: '+94 77 000 0000',
        address_line_1: 'Test Address',
        city: 'Colombo',
        postal_code: '10000'
      },
      customer_notes: 'Simple test order',
      payment_method: 'cash_on_delivery'
    }
    
    const simpleCartItems = [
      {
        product_id: 'simple-test-product',
        quantity: 1,
        products: {
          name: 'Simple Test Product',
          price: 15000,
          sku: 'SIMPLE-001'
        }
      }
    ]
    
    console.log('📝 Creating simple test order...')
    const result = await OrderService.createOrder(simpleOrderData, simpleCartItems)
    
    if (result.success) {
      console.log('✅ Simple test order created successfully!')
      console.log('📊 Order ID:', result.orderId)
      console.log('🔢 Order Number:', result.orderNumber)
    } else {
      console.log('❌ Simple test order failed:', result.error)
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Simple test failed:', error)
    return { success: false, error: error.message }
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  window.testOrderCreation = testOrderCreation
  window.testOrderViewer = testOrderViewer
  window.simpleTest = simpleTest
  window.OrderService = OrderService
  window.OrderViewer = OrderViewer
  
  console.log('🧪 Order creation test functions loaded!')
  console.log('Run simpleTest() to test order creation with current user')
  console.log('Run testOrderCreation() to test with mock data')
  console.log('Run testOrderViewer() to test order viewing')
}
