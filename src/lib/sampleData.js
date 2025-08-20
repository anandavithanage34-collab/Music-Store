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
    video_url: 'https://www.youtube.com/watch?v=IehfYU9XETU',
    brands: { name: 'Yamaha' },
    categories: { name: 'String Instruments', slug: 'string_instruments' },
    product_images: [{
      image_url: '/images/Yamaha FG830 Acoustic Guitar.jpg',
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
    video_url: 'https://www.youtube.com/watch?v=FO--7dftNUE',
    brands: { name: 'Roland' },
    categories: { name: 'Keys', slug: 'keys' },
    product_images: [{
      image_url: '/images/Roland FP-30X Digital Piano.jpg',
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
    video_url: 'https://www.youtube.com/shorts/qUgcoelTBGI',
    brands: { name: 'Traditional Crafts LK' },
    categories: { name: 'Drums and Percussion', slug: 'drums_percussion' },
    product_images: [{
      image_url: '/images/Traditional Sri Lankan Tabla Set.jpg',
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
    video_url: 'https://www.youtube.com/watch?v=s3rNsndzotw',
    brands: { name: 'Fender' },
    categories: { name: 'Guitars and Basses', slug: 'guitars_basses' },
    product_images: [{
      image_url: '/images/Fender Player Stratocaster Electric Guitar.jpg',
      is_primary: true,
      alt_text: 'Fender Player Stratocaster Electric Guitar'
    }],
    inventory: { quantity_available: 12 }
  },
  {
    id: '5',
    name: 'Pearl Export Series Drum Kit',
    description: 'Complete 5-piece drum kit perfect for beginners and intermediate drummers. Includes cymbals and hardware.',
    price: 185000,
    category_id: '2',
    brand_id: '6',
    sku: 'DRM-PRL-EXPO-H8I9',
    suitable_for: ['beginner', 'intermediate'],
    features: ['5-piece configuration', 'Poplar shells', 'Chrome hardware', 'Cymbals included'],
    specifications: {
      shells: 'Poplar wood',
      configuration: '5-piece',
      cymbals: 'Included',
      hardware: 'Chrome'
    },
    warranty_months: 12,
    is_active: true,
    video_url: 'https://www.youtube.com/watch?v=bApo4aWHzIE',
    brands: { name: 'Pearl' },
    categories: { name: 'Drums and Percussion', slug: 'drums_percussion' },
    product_images: [{
      image_url: '/images/Pearl Export Series Drum Kit.jpg',
      is_primary: true,
      alt_text: 'Pearl Export Series Drum Kit'
    }],
    inventory: { quantity_available: 5 }
  },
  {
    id: '6',
    name: 'Audio-Technica AT2020 Studio Microphone',
    description: 'Professional cardioid condenser microphone ideal for recording vocals and instruments in studio environments.',
    price: 28000,
    category_id: '4',
    brand_id: '7',
    sku: 'STU-ATE-AT20-J9K0',
    suitable_for: ['intermediate', 'professional'],
    features: ['Cardioid pattern', 'Low noise', 'High SPL capability', 'Phantom power'],
    specifications: {
      type: 'Condenser',
      pattern: 'Cardioid',
      frequency_response: '20Hz-20kHz',
      phantom_power: '48V required'
    },
    warranty_months: 24,
    is_active: true,
    video_url: 'https://www.youtube.com/watch?v=Jp76qV9R1Fg',
    brands: { name: 'Audio-Technica' },
    categories: { name: 'Studio and Recording Equipment', slug: 'studio_recording' },
    product_images: [{
      image_url: '/images/Audio-Technica AT2020 Studio Microphone.jpg',
      is_primary: true,
      alt_text: 'Audio-Technica AT2020 Studio Microphone'
    }],
    inventory: { quantity_available: 20 }
  },
  {
    id: '7',
    name: 'Casio CT-X700 Keyboard',
    description: 'Full-size 61-key keyboard with advanced sound technology and built-in learning features.',
    price: 65000,
    category_id: '3',
    brand_id: '8',
    sku: 'KEY-CAS-CTX7-L1M2',
    suitable_for: ['beginner', 'intermediate'],
    features: ['61 keys', '600 tones', 'USB connectivity', 'Built-in lessons'],
    specifications: {
      keys: '61 full-size',
      tones: '600',
      rhythms: '195',
      connectivity: 'USB, Audio In/Out'
    },
    warranty_months: 12,
    is_active: true,
    video_url: 'https://www.youtube.com/watch?v=qs9TRLEOpss',
    brands: { name: 'Casio' },
    categories: { name: 'Keys', slug: 'keys' },
    product_images: [{
      image_url: '/images/Casio CT-X700 Keyboard.jpg',
      is_primary: true,
      alt_text: 'Casio CT-X700 Keyboard'
    }],
    inventory: { quantity_available: 18 }
  },
  {
    id: '8',
    name: 'Ibanez GSR200 Bass Guitar',
    description: 'Affordable 4-string electric bass guitar perfect for beginners. Classic design with modern playability.',
    price: 55000,
    category_id: '1',
    brand_id: '9',
    sku: 'BAS-IBA-GSR2-N3O4',
    suitable_for: ['beginner', 'intermediate'],
    features: ['4-string configuration', 'Poplar body', 'Maple neck', 'Standard electronics'],
    specifications: {
      strings: '4',
      body: 'Poplar',
      neck: 'Maple',
      frets: '22',
      scale: '34 inches'
    },
    warranty_months: 12,
    is_active: true,
    video_url: 'https://www.youtube.com/watch?v=8PJAR7rbANU',
    brands: { name: 'Ibanez' },
    categories: { name: 'Guitars and Basses', slug: 'guitars_basses' },
    product_images: [{
      image_url: '/images/Ibanez GSR200 Bass Guitar.jpg',
      is_primary: true,
      alt_text: 'Ibanez GSR200 Bass Guitar'
    }],
    inventory: { quantity_available: 10 }
  }
]

export const sampleCategories = [
  { id: '1', name: 'Guitars and Basses', slug: 'guitars_basses', description: 'Electric guitars, acoustic guitars, bass guitars and accessories', sort_order: 1, is_active: true },
  { id: '2', name: 'Drums and Percussion', slug: 'drums_percussion', description: 'Acoustic drums, electronic drums, percussion instruments', sort_order: 2, is_active: true },
  { id: '3', name: 'Keys', slug: 'keys', description: 'Pianos, keyboards, synthesizers and MIDI controllers', sort_order: 3, is_active: true },
  { id: '4', name: 'Studio and Recording Equipment', slug: 'studio_recording', description: 'Audio interfaces, microphones, monitors and recording gear', sort_order: 4, is_active: true },
  { id: '5', name: 'Traditional Sri Lankan', slug: 'traditional', description: 'Sitar, tabla, flute and traditional Sri Lankan instruments', sort_order: 5, is_active: true },
  { id: '6', name: 'Accessories', slug: 'accessories', description: 'Strings, picks, cases, stands and accessories', sort_order: 6, is_active: true }
]

export const sampleBrands = [
  { id: '1', name: 'Yamaha', is_active: true },
  { id: '2', name: 'Fender', is_active: true },
  { id: '3', name: 'Gibson', is_active: true },
  { id: '4', name: 'Roland', is_active: true },
  { id: '5', name: 'Traditional Crafts LK', is_active: true },
  { id: '6', name: 'Pearl', is_active: true },
  { id: '7', name: 'Audio-Technica', is_active: true },
  { id: '8', name: 'Casio', is_active: true },
  { id: '9', name: 'Ibanez', is_active: true }
]
