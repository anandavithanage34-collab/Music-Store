import { useState, useEffect, useContext, createContext } from 'react'
import { useAuth } from './useAuth'
import { sampleProducts } from '../lib/sampleData'

const WishlistContext = createContext({})

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Load wishlist from localStorage when component mounts or user changes
  useEffect(() => {
    loadWishlistFromStorage()
  }, [user?.id])

  const loadWishlistFromStorage = () => {
    try {
      const savedWishlist = localStorage.getItem('musicstore_wishlist')
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist)
        // Enrich with product data from sample products
        const enrichedWishlist = parsedWishlist.map(item => {
          const productInfo = sampleProducts.find(p => p.id === item.product_id)
          return {
            ...item,
            products: productInfo
          }
        }).filter(item => item.products) // Filter out any items where product wasn't found
        
        setWishlist(enrichedWishlist)
      } else {
        setWishlist([])
      }
    } catch (error) {
      console.error('Error loading wishlist from storage:', error)
      setWishlist([])
    }
  }

  const saveWishlistToStorage = (wishlistData) => {
    try {
      // Only save basic info to localStorage
      const simpleWishlist = wishlistData.map(item => ({
        product_id: item.product_id,
        added_at: item.added_at
      }))
      localStorage.setItem('musicstore_wishlist', JSON.stringify(simpleWishlist))
    } catch (error) {
      console.error('Error saving wishlist to storage:', error)
    }
  }

  const addToWishlist = async (productId) => {
    try {
      // Check if already in wishlist
      if (isInWishlist(productId)) {
        return { success: false, error: 'Item already in wishlist' }
      }

      // Find product info
      const productInfo = sampleProducts.find(p => p.id === productId)
      if (!productInfo) {
        return { success: false, error: 'Product not found' }
      }

      const newItem = {
        product_id: productId,
        added_at: new Date().toISOString(),
        products: productInfo
      }

      const updatedWishlist = [newItem, ...wishlist]
      setWishlist(updatedWishlist)
      saveWishlistToStorage(updatedWishlist)

      return { success: true }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return { success: false, error: error.message }
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      const updatedWishlist = wishlist.filter(item => item.product_id !== productId)
      setWishlist(updatedWishlist)
      saveWishlistToStorage(updatedWishlist)
      return { success: true }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return { success: false, error: error.message }
    }
  }

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId)
  }

  const getWishlistCount = () => {
    return wishlist.length
  }

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    loadWishlistFromStorage
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
