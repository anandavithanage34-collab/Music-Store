import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export default function ProductManagement() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    brand_id: '',
    sku: '',
    suitable_for: [],
    features: '',
    warranty_months: '12',
    quantity_available: '0',
    image_url: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('📦 Fetching all products for admin...')
      
      const { data, error } = await supabase.rpc('get_all_products_admin')
      
      if (error) {
        console.error('❌ Error fetching products:', error)
        setError('Failed to fetch products')
        return
      }
      
      console.log('✅ Products fetched:', data)
      setProducts(data || [])
    } catch (error) {
      console.error('❌ Error fetching products:', error)
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      setBrands(data || [])
    } catch (error) {
      console.error('❌ Error fetching brands:', error)
    }
  }

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      brand_id: '',
      sku: '',
      suitable_for: [],
      features: '',
      warranty_months: '12',
      quantity_available: '0',
      image_url: ''
    })
    setEditingProduct(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSuitableForChange = (level, checked) => {
    setProductForm(prev => ({
      ...prev,
      suitable_for: checked 
        ? [...prev.suitable_for, level]
        : prev.suitable_for.filter(l => l !== level)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const features = productForm.features ? productForm.features.split(',').map(f => f.trim()) : []
      
      if (editingProduct) {
        // Update existing product
        const { data, error } = await supabase.rpc('update_product', {
          p_product_id: editingProduct.id,
          p_name: productForm.name,
          p_description: productForm.description,
          p_price: parseFloat(productForm.price),
          p_category_id: productForm.category_id,
          p_brand_id: productForm.brand_id,
          p_sku: productForm.sku,
          p_suitable_for: productForm.suitable_for,
          p_features: features,
          p_warranty_months: parseInt(productForm.warranty_months),
          p_quantity_available: parseInt(productForm.quantity_available)
        })

        if (error) throw error
        if (!data.success) throw new Error(data.error)

        setSuccess('Product updated successfully!')
      } else {
        // Add new product
        const { data, error } = await supabase.rpc('add_product', {
          p_name: productForm.name,
          p_description: productForm.description,
          p_price: parseFloat(productForm.price),
          p_category_id: productForm.category_id,
          p_brand_id: productForm.brand_id,
          p_sku: productForm.sku,
          p_suitable_for: productForm.suitable_for,
          p_features: features,
          p_warranty_months: parseInt(productForm.warranty_months),
          p_image_url: productForm.image_url || null,
          p_quantity_available: parseInt(productForm.quantity_available)
        })

        if (error) throw error
        if (!data.success) throw new Error(data.error)

        setSuccess('Product added successfully!')
      }

      // Refresh products list
      await fetchProducts()
      
      // Close dialog and reset form
      setShowAddDialog(false)
      resetForm()
      
    } catch (error) {
      console.error('❌ Error saving product:', error)
      setError(error.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      category_id: product.category?.id || '',
      brand_id: product.brand?.id || '',
      sku: product.sku || '',
      suitable_for: product.suitable_for || [],
      features: product.features?.join(', ') || '',
      warranty_months: product.warranty_months?.toString() || '12',
      quantity_available: product.inventory?.quantity_available?.toString() || '0',
      image_url: product.primary_image || ''
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('delete_product', {
        p_product_id: product.id
      })

      if (error) throw error
      if (!data.success) throw new Error(data.error)

      setSuccess(data.message)
      await fetchProducts()
    } catch (error) {
      console.error('❌ Error deleting product:', error)
      setError(error.message || 'Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category?.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    name="name"
                    value={productForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SKU *</label>
                  <Input
                    name="sku"
                    value={productForm.sku}
                    onChange={handleInputChange}
                    placeholder="Enter SKU"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (LKR) *</label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    name="quantity_available"
                    type="number"
                    value={productForm.quantity_available}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Warranty (months)</label>
                  <Input
                    name="warranty_months"
                    type="number"
                    value={productForm.warranty_months}
                    onChange={handleInputChange}
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={productForm.category_id} onValueChange={(value) => setProductForm(prev => ({...prev, category_id: value}))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="z-[100] max-h-60 overflow-y-auto">
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <Select value={productForm.brand_id} onValueChange={(value) => setProductForm(prev => ({...prev, brand_id: value}))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent className="z-[100] max-h-60 overflow-y-auto">
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            {brand.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Suitable For</label>
                <div className="flex gap-4 mt-2">
                  {['beginner', 'intermediate', 'professional'].map(level => (
                    <label key={level} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={productForm.suitable_for.includes(level)}
                        onChange={(e) => handleSuitableForChange(level, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Features (comma-separated)</label>
                <Textarea
                  name="features"
                  value={productForm.features}
                  onChange={handleInputChange}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  name="image_url"
                  value={productForm.image_url}
                  onChange={handleInputChange}
                  placeholder="/images/product-name.jpg"
                />
                {productForm.image_url && (
                  <div className="mt-2">
                    <img 
                      src={productForm.image_url} 
                      alt="Product preview" 
                      className="w-20 h-20 object-cover rounded-md border"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                    <div className="w-20 h-20 bg-gray-100 rounded-md border flex items-center justify-center text-gray-400 text-xs" style={{display: 'none'}}>
                      Invalid URL
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-60 overflow-y-auto">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' ? 'No products match your filters' : 'No products found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {product.primary_image ? (
                  <img
                    src={product.primary_image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400" style={{display: product.primary_image ? 'none' : 'flex'}}>
                  <ImageIcon className="w-12 h-12" />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={product.is_active ? 'default' : 'secondary'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  SKU: {product.sku}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="font-semibold">LKR {product.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`font-semibold ${product.inventory?.quantity_available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inventory?.quantity_available || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm">{product.category?.name}</span>
                  </div>
                  {product.suitable_for && product.suitable_for.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.suitable_for.map(level => (
                        <Badge key={level} variant="outline" className="text-xs">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
