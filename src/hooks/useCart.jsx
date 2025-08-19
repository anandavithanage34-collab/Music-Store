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
    if (user) {
      // When user logs in, try to merge localStorage cart with database cart
      const localCart = localStorage.getItem('musicstore_cart')
      if (localCart) {
        const localItems = JSON.parse(localCart)
        // Merge local cart items with user's cart
        mergeLocalCartWithDatabase(localItems)
      } else {
        fetchCartItems()
      }
    } else {
      // Load cart from localStorage for non-authenticated users
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
    }
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

      // Add to database for authenticated users - with fallback to localStorage
      try {
        // First check if item already exists
        const { data: existingItem, error: selectError } = await supabase
          .from('cart_items')
          .select('quantity')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .single()

        if (selectError && selectError.code !== 'PGRST116') {
          throw selectError
        }

        if (existingItem) {
          // Update existing item by adding to current quantity
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('user_id', user.id)
            .eq('product_id', productId)

          if (updateError) throw updateError
        } else {
          // Insert new item
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity
            })

          if (insertError) throw insertError
        }

        await fetchCartItems()
        console.log(`✅ Database cart updated successfully for authenticated user`)
        return { success: true }
      } catch (dbError) {
        console.log('⚠️ Database operation failed, falling back to localStorage for authenticated user:', dbError)
        
        // Fallback to localStorage if database fails (even for authenticated users)
        const localCart = JSON.parse(localStorage.getItem('musicstore_cart') || '[]')
        const existingItem = localCart.find(item => item.product_id === productId)
        
        if (existingItem) {
          existingItem.quantity += quantity
        } else {
          localCart.push({ 
            product_id: productId, 
            quantity,
            // Store additional info for authenticated users in localStorage
            user_id: user.id,
            added_at: new Date().toISOString()
          })
        }
        
        localStorage.setItem('musicstore_cart', JSON.stringify(localCart))
        // Enrich cart items for authenticated users too
        enrichLocalCartItems(localCart).then(enrichedCart => {
          setCartItems(enrichedCart)
          console.log(`🎯 Fallback cart updated successfully. Total items: ${localCart.length}`)
        })
        return { success: true }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      return { success: false, error }
    }
  }

  const updateCartItem = async (productId, quantity) => {
    try {
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('musicstore_cart') || '[]')
        const itemIndex = localCart.findIndex(item => item.product_id === productId)
        
        if (itemIndex >= 0) {
          if (quantity <= 0) {
            localCart.splice(itemIndex, 1)
          } else {
            localCart[itemIndex].quantity = quantity
          }
        }
        
        localStorage.setItem('musicstore_cart', JSON.stringify(localCart))
        setCartItems(localCart)
        return { success: true }
      }

      if (quantity <= 0) {
        return await removeFromCart(productId)
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error

      await fetchCartItems()
      return { success: true }
    } catch (error) {
      console.error('Error updating cart item:', error)
      return { success: false, error }
    }
  }

  const removeFromCart = async (productId) => {
    try {
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('musicstore_cart') || '[]')
        const filteredCart = localCart.filter(item => item.product_id !== productId)
        localStorage.setItem('musicstore_cart', JSON.stringify(filteredCart))
        setCartItems(filteredCart)
        return { success: true }
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error

      await fetchCartItems()
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
