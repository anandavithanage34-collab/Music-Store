// Sample data for development when Supabase isn't connected
export const sampleProducts = [
  {
    id: '1',
    name: 'Yamaha FG830 Acoustic Guitar',
    description: 'Premium acoustic guitar perfect for beginners and intermediate players. Solid sitka spruce top with rosewood back and sides.',
    price: 45000,
    category_id: '1',
    brand_id: '1',
    sku: 'STR-YAM-FG83-A1B2',
    suitable_for: ['beginner', 'intermediate'],
    features: ['Solid sitka spruce top', 'Rosewood back and sides', 'Die-cast tuners', 'Natural finish'],
    specifications: {
      body_style: 'Dreadnought',
      top_wood: 'Solid Sitka Spruce',
      back_sides: 'Rosewood',
      neck: 'Nato',
      fretboard: 'Rosewood',
      scale_length: '25.6 inches'
    },
    warranty_months: 24,
    is_active: true,
    brands: { name: 'Yamaha' },
    categories: { name: 'String Instruments', slug: 'string_instruments' },
    product_images: [{
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      is_primary: true,
      alt_text: 'Yamaha FG830 Acoustic Guitar'
    }],
    inventory: { quantity_available: 25 }
  },
  {
    id: '2',
    name: 'Roland FP-30X Digital Piano',
    description: 'Portable digital piano with weighted keys and premium sound quality. Perfect for home practice and stage performance.',
    price: 125000,
    category_id: '4',
    brand_id: '4',
    sku: 'ELE-ROL-FP30-C3D4',
    suitable_for: ['beginner', 'intermediate', 'professional'],
    features: ['88 weighted keys', 'Bluetooth connectivity', 'Built-in speakers', 'Portable design'],
    specifications: {
      keys: '88 weighted',
      sounds: '40+',
      bluetooth: true,
      pedals: '3 included',
      speakers: 'Built-in'
    },
    warranty_months: 12,
    is_active: true,
    brands: { name: 'Roland' },
    categories: { name: 'Electronic', slug: 'electronic' },
    product_images: [{
      image_url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=600&q=80',
      is_primary: true,
      alt_text: 'Roland FP-30X Digital Piano'
    }],
    inventory: { quantity_available: 15 }
  },
  {
    id: '3',
    name: 'Traditional Sri Lankan Tabla Set',
    description: 'Authentic handcrafted tabla set made by master craftsmen in Sri Lanka. Perfect for classical and fusion music.',
    price: 35000,
    category_id: '5',
    brand_id: '9',
    sku: 'TRA-TCL-TABL-E5F6',
    suitable_for: ['intermediate', 'professional'],
    features: ['Handcrafted', 'Premium leather', 'Tuning hammer included', 'Carrying case'],
    specifications: {
      material: 'Sheesham wood',
      head: 'Goat skin',
      size: '5.5 inch'
    },
    warranty_months: 6,
    is_active: true,
    brands: { name: 'Traditional Crafts LK' },
    categories: { name: 'Traditional Sri Lankan', slug: 'traditional' },
    product_images: [{
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      is_primary: true,
      alt_text: 'Traditional Sri Lankan Tabla Set'
    }],
    inventory: { quantity_available: 8 }
  },
  {
    id: '4',
    name: 'Fender Player Stratocaster Electric Guitar',
    description: 'Classic electric guitar with modern enhancements. The legendary Stratocaster sound loved by professionals worldwide.',
    price: 95000,
    category_id: '1',
    brand_id: '2',
    sku: 'STR-FEN-STRA-G7H8',
    suitable_for: ['intermediate', 'professional'],
    features: ['Alder body', 'Maple neck', 'Player Series pickups', 'Modern C neck shape'],
    specifications: {
      body: 'Alder',
      neck: 'Maple',
      fretboard: 'Pau Ferro',
      pickups: 'Player Series Alnico 5',
      bridge: '2-Point Synchronized Tremolo'
    },
    warranty_months: 12,
    is_active: true,
    brands: { name: 'Fender' },
    categories: { name: 'String Instruments', slug: 'string_instruments' },
    product_images: [{
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      is_primary: true,
      alt_text: 'Fender Player Stratocaster'
    }],
    inventory: { quantity_available: 12 }
  }
]

export const sampleCategories = [
  { id: '1', name: 'String Instruments', slug: 'string_instruments', description: 'Guitars, bass, violin, sitar and other string instruments' },
  { id: '2', name: 'Wind Instruments', slug: 'wind_instruments', description: 'Flutes, saxophones, trumpets and wind instruments' },
  { id: '3', name: 'Percussion', slug: 'percussion', description: 'Drums, tabla, traditional percussion instruments' },
  { id: '4', name: 'Electronic', slug: 'electronic', description: 'Keyboards, synthesizers, electronic drums' },
  { id: '5', name: 'Traditional Sri Lankan', slug: 'traditional', description: 'Sitar, tabla, flute and traditional Sri Lankan instruments' },
  { id: '6', name: 'Accessories', slug: 'accessories', description: 'Strings, picks, cases, stands and accessories' }
]

export const sampleBrands = [
  { id: '1', name: 'Yamaha' },
  { id: '2', name: 'Fender' },
  { id: '3', name: 'Gibson' },
  { id: '4', name: 'Roland' },
  { id: '5', name: 'Traditional Crafts LK' }
]
