import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Filter, Grid, List, SortAsc, Search, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Input, Label, Select } from '../../components/ui/Input'
import ProductCard from '../../components/ui/ProductCard'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { sampleProducts, sampleCategories, sampleBrands } from '../../lib/sampleData'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    skillLevel: searchParams.get('skillLevel') || '',
    sortBy: searchParams.get('sortBy') || 'name'
  })

  const { profile } = useAuth()

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  useEffect(() => {
    fetchProducts()
    updateSearchParams()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) {
        setCategories(sampleCategories)
      } else {
        setCategories(data || sampleCategories)
      }
    } catch (error) {
      console.error('Error fetching categories, using sample data:', error)
      setCategories(sampleCategories)
    }
  }

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        setBrands(sampleBrands)
      } else {
        setBrands(data || sampleBrands)
      }
    } catch (error) {
      console.error('Error fetching brands, using sample data:', error)
      setBrands(sampleBrands)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          brands (name),
          product_images (image_url, is_primary, alt_text),
          categories (name, slug)
        `)
        .eq('is_active', true)

      // Apply filters (Supabase queries)
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.category) {
        query = query.eq('categories.slug', filters.category)
      }

      if (filters.brand) {
        query = query.eq('brands.name', filters.brand)
      }

      if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice))
      }

      if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice))
      }

      if (filters.skillLevel) {
        query = query.contains('suitable_for', [filters.skillLevel])
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true })
          break
        case 'price_high':
          query = query.order('price', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'popular':
          query = query.order('total_sales', { ascending: false })
          break
        default:
          query = query.order('name', { ascending: true })
      }

      const { data, error } = await query

      if (error) {
        // Use sample data with client-side filtering
        console.log('Using sample data - Supabase not connected')
        let filteredProducts = [...sampleProducts]

        if (filters.search) {
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            p.description.toLowerCase().includes(filters.search.toLowerCase())
          )
        }

        if (filters.category) {
          filteredProducts = filteredProducts.filter(p => 
            p.categories.slug === filters.category
          )
        }

        if (filters.brand) {
          filteredProducts = filteredProducts.filter(p => 
            p.brands.name === filters.brand
          )
        }

        if (filters.minPrice) {
          filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(filters.minPrice))
        }

        if (filters.maxPrice) {
          filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(filters.maxPrice))
        }

        if (filters.skillLevel) {
          filteredProducts = filteredProducts.filter(p => 
            p.suitable_for.includes(filters.skillLevel)
          )
        }

        // Client-side sorting
        switch (filters.sortBy) {
          case 'price_low':
            filteredProducts.sort((a, b) => a.price - b.price)
            break
          case 'price_high':
            filteredProducts.sort((a, b) => b.price - a.price)
            break
          case 'newest':
            // Sample data doesn't have created_at, so we'll use name
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
            break
          default:
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
        }

        setProducts(filteredProducts)
      } else {
        setProducts(data || [])
      }
    } catch (error) {
      console.error('Error fetching products, using sample data:', error)
      setProducts(sampleProducts)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      skillLevel: '',
      sortBy: 'name'
    })
  }

  const updateSearchParams = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })
    setSearchParams(params)
  }

  // Products are already filtered from fetchProducts - no need for additional filtering
  const filteredProducts = products

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'name')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-secondary-600 font-medium tracking-wider uppercase text-sm mb-4">
                Premium Collection
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-heading">
                Exceptional
                <span className="block text-gray-600 italic font-light">Instruments</span>
              </h1>
              <p className="text-xl luxury-text max-w-2xl mx-auto">
                Discover handcrafted instruments that inspire greatness
                {profile?.skill_level && (
                  <span className="block mt-2 text-secondary-600 font-medium">
                    Curated for {profile.skill_level} musicians
                  </span>
                )}
              </p>
            </motion.div>
          </div>

          {/* Search and Controls */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="premium-card p-8"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search for instruments, brands, accessories..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500 text-lg"
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                      showFilters ? 'bg-gray-900 text-white' : 'border-gray-300 text-gray-700 hover:border-gray-900'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="bg-secondary-500 text-gray-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        !
                      </span>
                    )}
                  </Button>

                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300 font-medium min-w-[180px]"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="popular">Most Popular</option>
                  </select>

                  <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              <div className="premium-card p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300 font-medium"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Brand</label>
                    <select
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300 font-medium"
                    >
                      <option value="">All Brands</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Skill Level</label>
                    <select
                      value={filters.skillLevel}
                      onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300 font-medium"
                    >
                      <option value="">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Price Range (LKR)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      onClick={clearFilters} 
                      className="border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 px-6 py-2 rounded-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Results */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'result' : 'results'}`}
              {filters.search && ` for "${filters.search}"`}
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No instruments found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </motion.div>
          ) : (
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
