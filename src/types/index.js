// User Types
export const SkillLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate', 
  PROFESSIONAL: 'professional'
}

export const UserRole = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin'
}

// Product Types
export const ProductCategory = {
  STRING_INSTRUMENTS: 'string_instruments',
  WIND_INSTRUMENTS: 'wind_instruments',
  PERCUSSION: 'percussion',
  ELECTRONIC: 'electronic',
  ACCESSORIES: 'accessories',
  SHEET_MUSIC: 'sheet_music',
  AUDIO_EQUIPMENT: 'audio_equipment'
}

export const ProductStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock'
}

// Order Types
export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

// Sri Lankan specific data
export const SriLankanCities = [
  'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura', 
  'Polonnaruwa', 'Batticaloa', 'Trincomalee', 'Kurunegala', 'Ratnapura',
  'Matara', 'Kalutara', 'Badulla', 'Nuwara Eliya', 'Hambantota'
]
