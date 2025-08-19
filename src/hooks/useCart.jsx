import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    console.log('🔄 Cart useEffect triggered, user:', user ? user.id : 'not authenticated')
    
    // Always load cart from localStorage since we're using hardcoded data
    const loadLocalCart = async () => {
      const localCart = localStorage.getItem('musicstore_cart')
      console.log('📦 Loading cart from localStorage:', localCart ? JSON.parse(localCart).length : 0, 'items')
      
      if (localCart) {
        const parsedCart = JSON.parse(localCart)
        const enrichedCart = await enrichLocalCartItems(parsedCart)
        console.log('✨ Cart loaded with enriched data:', enrichedCart.length, 'items')
        setCartItems(enrichedCart)
      } else {
        console.log('📭 No cart found in localStorage')
        setCartItems([])
      }
    }
    
    loadLocalCart()
  }, [user])

  const enrichLocalCartItems = async (localItems) => {
    // For localStorage cart items, try to get product info from sample data
    try {
      const { sampleProducts } = await import('../lib/sampleData')
      
      return localItems.map(item => {
        const productInfo = sampleProducts.find(p => p.id == item.product_id) // Use == for type flexibility
        if (productInfo) {
          return {
            ...item,
            products: productInfo,
            price: productInfo.price
          }
        }
        return {
          ...item,
          price: item.price || 15000 // Default price if not found
        }
      })
    } catch (error) {
      console.error('Error enriching cart items:', error)
      // Return items with default price if import fails
      return localItems.map(item => ({
        ...item,
        price: item.price || 15000
      }))
    }
  }

  const mergeLocalCartWithDatabase = async (localItems) => {
    if (localItems.length === 0) {
      await fetchCartItems()
      return
    }

    console.log('Merging local cart with database for authenticated user:', localItems)
    
    try {
      // Try to fetch existing cart from database first
      const { data: existingCartItems, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      // Merge logic: combine localStorage items with existing database items
      const mergedItems = [...localItems]
      
      // Add existing database items that aren't in localStorage
      if (existingCartItems && existingCartItems.length > 0) {
        existingCartItems.forEach(dbItem => {
          const localItem = localItems.find(local => local.product_id === dbItem.product_id)
          if (!localItem) {
            mergedItems.push(dbItem)
          }
        })
      }

      // Try to save merged items to database
      if (mergedItems.length > 0) {
        const { error: insertError } = await supabase
          .from('cart_items')
          .upsert(
            mergedItems.map(item => ({
              user_id: user.id,
              product_id: item.product_id,
              quantity: item.quantity
            })),
            { onConflict: 'user_id,product_id' }
          )

        if (insertError) throw insertError
      }
      
      // Clear localStorage after successful merge and fetch fresh data
      localStorage.removeItem('musicstore_cart')
      await fetchCartItems()
    } catch (error) {
      console.error('Database merge failed, using localStorage cart for authenticated user:', error)
      // If database operations fail, just use localStorage items
      setCartItems(localItems)
    }
  }

  const fetchCartItems = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            product_images!inner (image_url)
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems(data || [])
    } catch (error) {
      console.error('Error fetching cart items, using localStorage fallback:', error)
      
      // Fallback to localStorage if database fails
      const loadLocalCart = async () => {
        const localCart = localStorage.getItem('musicstore_cart')
        if (localCart) {
          const parsedCart = JSON.parse(localCart)
          const enrichedCart = await enrichLocalCartItems(parsedCart)
          setCartItems(enrichedCart)
        } else {
          setCartItems([])
        }
      }
      loadLocalCart()
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    console.log(`🛒 Adding to cart: Product ${productId}, Quantity ${quantity}, User: ${user ? 'authenticated' : 'guest'}`)
    
    try {
      if (!user) {
        // Add to localStorage for non-authenticated users
        const localCart = JSON.parse(localStorage.getItem('musicstore_cart') || '[]')
        const existingItem = localCart.find(item => item.product_id === productId)
        
        if (existingItem) {
          existingItem.quantity += quantity
          console.log(`📦 Updated existing item quantity to ${existingItem.quantity}`)
        } else {
          localCart.push({ product_id: productId, quantity })
          console.log(`✨ Added new item to cart`)
        }
        
        localStorage.setItem('musicstore_cart', JSON.stringify(localCart))
        // For localStorage items, we need to add price info for cart calculations
        enrichLocalCartItems(localCart).then(enrichedCart => {
          setCartItems(enrichedCart)
          console.log(`🎯 Cart updated successfully. Total items: ${localCart.length}`)
        })
        return { success: true }
      }

      // For authenticated users, always use localStorage for now (since we're using hardcoded data)
      console.log('🔐 Authenticated user - using localStorage cart')
      const localCart = JSON.parse(localStorage.getItem('musicstore_cart') || '[]')
      const existingItem = localCart.find(item => item.product_id === productId)
      
      if (existingItem) {
        existingItem.quantity += quantity
        console.log(`📦 Updated existing item quantity to ${existingItem.quantity}`)
      } else {
        localCart.push({ 
          product_id: productId, 
          quantity,
          user_id: user.id,
          added_at: new Date().toISOString()
        })
        console.log(`✨ Added new item to cart`)
      }
      
      localStorage.setItem('musicstore_cart', JSON.stringify(localCart))
      
      // Enrich and update cart state immediately
      const enrichedCart = await enrichLocalCartItems(localCart)
      setCartItems(enrichedCart)
      console.log(`🎯 Cart updated successfully for authenticated user. Total items: ${localCart.length}`)
      
      return { success: true }
    } catch (error) {
      console.error('Error adding to cart:', error)
      return { success: false, error }
    }
  }

  const updateCartItem = async (productId, quantity) => {
    console.log(`🔄 Updating cart item: Product ${productId}, Quantity ${quantity}, User: ${user ? 'authenticated' : 'guest'}`)
    
    try {
      // Always use localStorage for cart operations since we're using hardcoded data
      const localCart = JSON.parse(localStorage.getItem('musicstore_cart') || '[]')
      const itemIndex = localCart.findIndex(item => item.product_id == productId) // Use == for type flexibility
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          console.log('🗑️ Removing item due to zero quantity')
          localCart.splice(itemIndex, 1)
        } else {
          console.log(`📝 Updating quantity from ${localCart[itemIndex].quantity} to ${quantity}`)
          localCart[itemIndex].quantity = quantity
        }
      } else {
        console.log('❌ Item not found in cart for update')
        return { success: false, error: 'Item not found in cart' }
      }
      
      localStorage.setItem('musicstore_cart', JSON.stringify(localCart))
      
      // Enrich and update cart state
      const enrichedCart = await enrichLocalCartItems(localCart)
      setCartItems(enrichedCart)
      console.log('✅ Cart updated successfully')
      
      return { success: true }
    } catch (error) {
      console.error('Error updating cart item:', error)
      return { success: false, error }
    }
  }

  const removeFromCart = async (productId) => {
    console.log(`🗑️ Removing from cart: Product ${productId}, User: ${user ? 'authenticated' : 'guest'}`)
    
    try {
      // Always use localStorage for cart operations since we're using hardcoded data
      const localCart = JSON.parse(localStorage.getItem('musicstore_cart') || '[]')
      const originalLength = localCart.length
      const filteredCart = localCart.filter(item => item.product_id != productId) // Use != for type flexibility
      
      if (filteredCart.length === originalLength) {
        console.log('❌ Item not found in cart for removal')
        return { success: false, error: 'Item not found in cart' }
      }
      
      console.log(`📤 Removed item. Cart size: ${originalLength} -> ${filteredCart.length}`)
      localStorage.setItem('musicstore_cart', JSON.stringify(filteredCart))
      
      // Enrich and update cart state
      const enrichedCart = await enrichLocalCartItems(filteredCart)
      setCartItems(enrichedCart)
      console.log('✅ Item removed successfully')
      
      return { success: true }
    } catch (error) {
      console.error('Error removing from cart:', error)
      return { success: false, error }
    }
  }

  const clearCart = async () => {
    try {
      if (!user) {
        localStorage.removeItem('musicstore_cart')
        setCartItems([])
        return { success: true }
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems([])
      return { success: true }
    } catch (error) {
      console.error('Error clearing cart:', error)
      return { success: false, error }
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Handle both database format (item.products.price) and localStorage format (need to fetch price)
      const price = item.products?.price || item.price || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0)
  }

  const value = {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    fetchCartItems
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
