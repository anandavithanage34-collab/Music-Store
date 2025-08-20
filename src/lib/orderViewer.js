import { supabase } from './supabase'

/**
 * Order Viewer Utility - Works with simplified single-table approach
 * All order information is now stored in the order_details table
 */

export class OrderViewer {
  /**
   * Get all orders with complete details from order_details table
   * @returns {Object} - Orders with complete details
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
   * Get order by ID with complete details
   * @param {string} orderId - Order ID
   * @returns {Object} - Order with complete details
   */
  static async getOrderById(orderId) {
    try {
      console.log(`🔍 Fetching order ${orderId} from order_details table...`)
      
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error

      console.log('✅ Order details fetched successfully')
      return { success: true, data }

    } catch (error) {
      console.error('❌ Failed to fetch order:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get orders by user ID
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
   * Get orders by status
   * @param {string} status - Order status
   * @returns {Object} - Orders with specified status
   */
  static async getOrdersByStatus(status) {
    try {
      console.log(`🔍 Fetching orders with status: ${status}`)
      
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .eq('order_status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log(`✅ Found ${data?.length || 0} orders with status: ${status}`)
      return { success: true, data: data || [] }

    } catch (error) {
      console.error('❌ Failed to fetch orders by status:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get order summary statistics
   * @returns {Object} - Order statistics
   */
  static async getOrderStatistics() {
    try {
      console.log('📊 Calculating order statistics...')
      
      const { data, error } = await supabase
        .from('order_details')
        .select('order_status, total_amount, created_at')

      if (error) throw error

      const stats = {
        total_orders: data?.length || 0,
        total_revenue: 0,
        status_counts: {},
        recent_orders: 0
      }

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      data?.forEach(order => {
        // Count by status
        stats.status_counts[order.order_status] = (stats.status_counts[order.order_status] || 0) + 1
        
        // Sum total revenue
        if (order.total_amount) {
          stats.total_revenue += parseFloat(order.total_amount)
        }
        
        // Count recent orders
        if (new Date(order.created_at) > thirtyDaysAgo) {
          stats.recent_orders++
        }
      })

      console.log('✅ Order statistics calculated successfully')
      return { success: true, data: stats }

    } catch (error) {
      console.error('❌ Failed to calculate order statistics:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Search orders by various criteria
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
   * Get order items for a specific order
   * @param {string} orderId - Order ID
   * @returns {Object} - Order items
   */
  static async getOrderItems(orderId) {
    try {
      console.log(`🔍 Fetching order items for order ${orderId}...`)
      
      const { data: order, error } = await supabase
        .from('order_details')
        .select('order_items')
        .eq('id', orderId)
        .single()

      if (error) throw error

      const orderItems = order.order_items || []
      console.log(`✅ Found ${orderItems.length} items for order`)
      
      return { success: true, data: orderItems }

    } catch (error) {
      console.error('❌ Failed to fetch order items:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get recent orders (last 30 days)
   * @returns {Object} - Recent orders
   */
  static async getRecentOrders() {
    try {
      console.log('🔍 Fetching recent orders...')
      
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log(`✅ Found ${data?.length || 0} recent orders`)
      return { success: true, data: data || [] }

    } catch (error) {
      console.error('❌ Failed to fetch recent orders:', error)
      return { success: false, error: error.message }
    }
  }
}

export default OrderViewer
