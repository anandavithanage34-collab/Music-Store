import { supabase } from './supabase'

/**
 * Simplified Order Service - Stores ALL order information in ONE table: order_details
 * This eliminates the need for multiple tables and simplifies data management
 */

export class OrderService {
  /**
   * Create a complete order with ALL details in ONE table (order_details)
   * @param {Object} orderData - Order information
   * @param {Array} cartItems - Cart items to convert to order items
   * @returns {Object} - Result with orderId and success status
   */
  static async createOrder(orderData, cartItems) {
    const orderNumber = `MUS-${Date.now().toString().slice(-6)}`
    
    try {
      console.log('🔄 Starting simplified order creation in ONE table...')
      console.log('📊 Order data received:', orderData)
      console.log('🛒 Cart items received:', cartItems)
      
      // Step 0: Verify user data from custom auth system
      if (!orderData.user_id) {
        console.error('❌ No user_id provided in order data')
        throw new Error('User ID is required to create an order')
      }
      
      console.log('✅ User ID verified:', orderData.user_id)
      
      // Step 1: Create comprehensive order with ALL details in order_details table
      console.log('📋 Creating complete order in order_details table...')
      
      // Prepare order items as JSON for storage in the single table
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.products?.name || `Product ${item.product_id}`,
        product_sku: item.products?.sku || 'N/A',
        product_image: item.products?.product_images?.[0]?.image_url || null,
        quantity: item.quantity,
        unit_price: item.products?.price || item.price || 0,
        total_price: (item.products?.price || item.price || 0) * item.quantity,
        product_specifications: item.products?.specifications || {},
        product_features: item.products?.features || [],
        warranty_months: item.products?.warranty_months || 12
      }))
      
      const completeOrderData = {
        order_number: orderNumber,
        user_id: orderData.user_id,
        customer_full_name: orderData.shipping_address.full_name,
        customer_phone: orderData.shipping_address.phone,
        customer_email: orderData.user_email || 'N/A',
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        order_date: new Date().toISOString(),
        order_status: 'pending',
        payment_status: 'pending',
        payment_method: orderData.payment_method,
        subtotal: orderData.subtotal || orderData.total_amount,
        delivery_fee: orderData.delivery_fee || 0,
        total_amount: orderData.total_amount,
        delivery_city: orderData.shipping_address.city,
        delivery_postal_code: orderData.shipping_address.postal_code,
        customer_notes: orderData.customer_notes,
        admin_notes: null,
        special_instructions: orderData.customer_notes,
        tracking_number: null,
        estimated_delivery_date: null,
        actual_delivery_date: null,
        // Store ALL order items in this single table
        order_items: orderItems,
        total_items: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      }

      console.log('📋 Complete order data to insert:', completeOrderData)

      const { data: orderDetails, error: detailsError } = await supabase
        .from('order_details')
        .insert([completeOrderData])
        .select()
        .single()

      if (detailsError) {
        console.error('❌ Order creation failed:', detailsError)
        throw new Error(`Failed to create order: ${detailsError.message}`)
      }

      console.log('✅ Complete order created successfully in order_details table')
      console.log('🎉 Order ID:', orderDetails.id)
      console.log('🔢 Order Number:', orderNumber)
      
      return {
        success: true,
        orderId: orderDetails.id,
        orderNumber: orderNumber,
        message: 'Order created successfully with all details in one table'
      }

    } catch (error) {
      console.error('❌ Order creation failed:', error)
      
      return {
        success: false,
        error: error.message,
        orderNumber: orderNumber,
        message: 'Order creation failed'
      }
    }
  }

  /**
   * Fetch order with complete details from order_details table
   * @param {string} orderId - Order ID to fetch
   * @returns {Object} - Order with complete details
   */
  static async fetchOrderDetails(orderId) {
    try {
      console.log(`🔍 Fetching order ${orderId} from order_details table...`)
      
      const { data: orderDetails, error: detailsError } = await supabase
        .from('order_details')
        .select('*')
        .eq('id', orderId)
        .single()

      if (detailsError) {
        console.error('❌ Failed to fetch order details:', detailsError)
        return { success: false, error: detailsError.message }
      }

      console.log('✅ Order details fetched successfully from order_details table')
      return { success: true, data: orderDetails, source: 'order_details' }

    } catch (error) {
      console.error('❌ Failed to fetch order details:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update order status in order_details table
   * @param {string} orderId - Order ID
   * @param {string} newStatus - New status
   * @param {string} adminNotes - Admin notes
   * @param {string} trackingNumber - Tracking number
   * @returns {Object} - Update result
   */
  static async updateOrderStatus(orderId, newStatus, adminNotes = null, trackingNumber = null) {
    try {
      console.log('🔄 Updating order status in order_details table...')

      const { error: updateError } = await supabase
        .from('order_details')
        .update({
          order_status: newStatus,
          admin_notes: adminNotes,
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (updateError) {
        throw updateError
      }

      console.log('✅ Order status updated successfully')
      return { success: true }

    } catch (error) {
      console.error('❌ Failed to update order status:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all orders from order_details table
   * @returns {Object} - All orders with complete details
   */
  static async getAllOrders() {
    try {
      console.log('🔍 Fetching all orders from order_details table...')
      
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log(`✅ Found ${data?.length || 0} orders in order_details table`)
      return { success: true, data: data || [] }

    } catch (error) {
      console.error('❌ Failed to fetch orders:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get orders by user ID from order_details table
   * @param {string} userId - User ID
   * @returns {Object} - User's orders
   */
  static async getOrdersByUser(userId) {
    try {
      console.log(`🔍 Fetching orders for user ${userId}...`)
      
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log(`✅ Found ${data?.length || 0} orders for user`)
      return { success: true, data: data || [] }

    } catch (error) {
      console.error('❌ Failed to fetch user orders:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Search orders by various criteria in order_details table
   * @param {Object} searchCriteria - Search parameters
   * @returns {Object} - Matching orders
   */
  static async searchOrders(searchCriteria) {
    try {
      console.log('🔍 Searching orders with criteria:', searchCriteria)
      
      let query = supabase
        .from('order_details')
        .select('*')

      // Apply search filters
      if (searchCriteria.orderNumber) {
        query = query.ilike('order_number', `%${searchCriteria.orderNumber}%`)
      }
      
      if (searchCriteria.customerName) {
        query = query.ilike('customer_full_name', `%${searchCriteria.customerName}%`)
      }
      
      if (searchCriteria.customerPhone) {
        query = query.ilike('customer_phone', `%${searchCriteria.customerPhone}%`)
      }
      
      if (searchCriteria.status) {
        query = query.eq('order_status', searchCriteria.status)
      }
      
      if (searchCriteria.city) {
        query = query.ilike('delivery_city', `%${searchCriteria.city}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      console.log(`✅ Found ${data?.length || 0} matching orders`)
      return { success: true, data: data || [] }

    } catch (error) {
      console.error('❌ Failed to search orders:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Create a mock order for development/testing
   * @param {Object} orderData - Order information
   * @param {Array} cartItems - Cart items
   * @returns {Object} - Mock order result
   */
  static createMockOrder(orderData, cartItems) {
    const orderNumber = `MUS-${Date.now().toString().slice(-6)}`
    const orderId = `mock-${Date.now()}`
    
    const mockOrder = {
      id: orderId,
      order_number: orderNumber,
      user_id: orderData.user_id || 'mock-user',
      total_amount: orderData.total_amount,
      shipping_address: orderData.shipping_address,
      billing_address: orderData.billing_address,
      customer_notes: orderData.customer_notes,
      payment_method: orderData.payment_method,
      status: 'pending',
      created_at: new Date().toISOString(),
      order_items: cartItems.map(item => ({
        id: `mock-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.products?.price || item.price || 0,
        total_price: (item.products?.price || item.price || 0) * item.quantity,
        product_name: item.products?.name || `Product ${item.product_id}`,
        product_sku: item.products?.sku || 'N/A',
        product_image: item.products?.product_images?.[0]?.image_url || null
      }))
    }

    // Store in localStorage
    const existingOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]')
    existingOrders.push(mockOrder)
    localStorage.setItem('mock_orders', JSON.stringify(existingOrders))

    console.log('📝 Mock order created:', orderId)

    return {
      success: true,
      orderId: orderId,
      orderNumber: orderNumber,
      message: 'Mock order created successfully',
      isMock: true
    }
  }
}

export default OrderService
