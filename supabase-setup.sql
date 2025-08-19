-- Sri Lankan Music Store Complete Database Setup
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'professional')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Categories
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Brands
CREATE TABLE brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  country_origin TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Products
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES categories(id) NOT NULL,
  brand_id UUID REFERENCES brands(id),
  sku TEXT UNIQUE NOT NULL,
  weight DECIMAL(8,2),
  dimensions JSONB,
  materials TEXT[],
  suitable_for TEXT[] CHECK (suitable_for <@ ARRAY['beginner', 'intermediate', 'professional']),
  features TEXT[],
  specifications JSONB DEFAULT '{}'::jsonb,
  warranty_months INTEGER DEFAULT 12,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title TEXT,
  seo_description TEXT,
  meta_tags TEXT[]
);

-- Product images
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inventory
CREATE TABLE inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL UNIQUE,
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  reorder_level INTEGER DEFAULT 5,
  reorder_quantity INTEGER DEFAULT 10,
  last_restocked TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Cart items
CREATE TABLE cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  customer_notes TEXT,
  admin_notes TEXT,
  tracking_number TEXT,
  payment_method TEXT DEFAULT 'cash_on_delivery',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded'))
);

-- Order items
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0)
);

-- Reviews
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(product_id, user_id)
);

-- Browsing history
CREATE TABLE browsing_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  view_duration INTEGER
);

-- Wishlists
CREATE TABLE wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Onboarding questions
CREATE TABLE onboarding_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  weight_beginner INTEGER DEFAULT 1,
  weight_intermediate INTEGER DEFAULT 1,
  weight_professional INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Onboarding responses
CREATE TABLE onboarding_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES onboarding_questions(id) NOT NULL,
  answer TEXT NOT NULL,
  points_beginner INTEGER DEFAULT 0,
  points_intermediate INTEGER DEFAULT 0,
  points_professional INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_suitable_for ON products USING GIN(suitable_for);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_inventory_quantity ON inventory(quantity_available);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_verified ON reviews(is_verified);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_browsing_history_user ON browsing_history(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE browsing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own browsing history" ON browsing_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own onboarding responses" ON onboarding_responses FOR ALL USING (auth.uid() = user_id);

-- Sample Data

-- Insert Categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('String Instruments', 'string_instruments', 'Guitars, bass, violin, sitar and other string instruments', 1),
('Wind Instruments', 'wind_instruments', 'Flutes, saxophones, trumpets and wind instruments', 2),
('Percussion', 'percussion', 'Drums, tabla, traditional percussion instruments', 3),
('Electronic', 'electronic', 'Keyboards, synthesizers, electronic drums', 4),
('Traditional Sri Lankan', 'traditional', 'Sitar, tabla, flute and traditional Sri Lankan instruments', 5),
('Accessories', 'accessories', 'Strings, picks, cases, stands and accessories', 6),
('Audio Equipment', 'audio_equipment', 'Amplifiers, microphones, speakers', 7);

-- Insert Brands
INSERT INTO brands (name, description, country_origin) VALUES
('Yamaha', 'World-renowned Japanese musical instrument manufacturer', 'Japan'),
('Fender', 'Iconic American guitar and amplifier brand', 'USA'),
('Gibson', 'Premium American guitar manufacturer', 'USA'),
('Roland', 'Leading electronic musical instrument company', 'Japan'),
('Casio', 'Electronic keyboards and digital pianos', 'Japan'),
('Ibanez', 'Japanese guitar manufacturer known for innovation', 'Japan'),
('Pearl', 'Professional drum sets and percussion', 'Japan'),
('Shure', 'Professional audio equipment and microphones', 'USA'),
('Traditional Crafts LK', 'Authentic Sri Lankan traditional instruments', 'Sri Lanka'),
('Lanka Music', 'Local manufacturer of quality instruments', 'Sri Lanka');

-- Insert Sample Products
INSERT INTO products (name, description, price, category_id, brand_id, sku, suitable_for, features, specifications, warranty_months) 
SELECT 
  'Yamaha FG830 Acoustic Guitar',
  'Premium acoustic guitar perfect for beginners and intermediate players. Solid sitka spruce top with rosewood back and sides.',
  45000.00,
  (SELECT id FROM categories WHERE slug = 'string_instruments'),
  (SELECT id FROM brands WHERE name = 'Yamaha'),
  'STR-YAM-FG83-A1B2',
  ARRAY['beginner', 'intermediate'],
  ARRAY['Solid sitka spruce top', 'Rosewood back and sides', 'Die-cast tuners', 'Natural finish'],
  '{"body_style": "Dreadnought", "top_wood": "Solid Sitka Spruce", "back_sides": "Rosewood", "neck": "Nato", "fretboard": "Rosewood", "scale_length": "25.6 inches"}'::jsonb,
  24;

INSERT INTO products (name, description, price, category_id, brand_id, sku, suitable_for, features, specifications, warranty_months) 
SELECT 
  'Roland FP-30X Digital Piano',
  'Portable digital piano with weighted keys and premium sound quality. Perfect for home practice and stage performance.',
  125000.00,
  (SELECT id FROM categories WHERE slug = 'electronic'),
  (SELECT id FROM brands WHERE name = 'Roland'),
  'ELE-ROL-FP30-C3D4',
  ARRAY['beginner', 'intermediate', 'professional'],
  ARRAY['88 weighted keys', 'Bluetooth connectivity', 'Built-in speakers', 'Portable design'],
  '{"keys": "88 weighted", "sounds": "40+", "bluetooth": true, "pedals": "3 included", "speakers": "Built-in"}'::jsonb,
  12;

INSERT INTO products (name, description, price, category_id, brand_id, sku, suitable_for, features, specifications, warranty_months) 
SELECT 
  'Traditional Sri Lankan Tabla Set',
  'Authentic handcrafted tabla set made by master craftsmen in Sri Lanka. Perfect for classical and fusion music.',
  35000.00,
  (SELECT id FROM categories WHERE slug = 'traditional'),
  (SELECT id FROM brands WHERE name = 'Traditional Crafts LK'),
  'TRA-TCL-TABL-E5F6',
  ARRAY['intermediate', 'professional'],
  ARRAY['Handcrafted', 'Premium leather', 'Tuning hammer included', 'Carrying case'],
  '{"material": "Sheesham wood", "head": "Goat skin", "size": "5.5 inch"}'::jsonb,
  6;

INSERT INTO products (name, description, price, category_id, brand_id, sku, suitable_for, features, specifications, warranty_months) 
SELECT 
  'Fender Player Stratocaster Electric Guitar',
  'Classic electric guitar with modern enhancements. The legendary Stratocaster sound loved by professionals worldwide.',
  95000.00,
  (SELECT id FROM categories WHERE slug = 'string_instruments'),
  (SELECT id FROM brands WHERE name = 'Fender'),
  'STR-FEN-STRA-G7H8',
  ARRAY['intermediate', 'professional'],
  ARRAY['Alder body', 'Maple neck', 'Player Series pickups', 'Modern C neck shape'],
  '{"body": "Alder", "neck": "Maple", "fretboard": "Pau Ferro", "pickups": "Player Series Alnico 5", "bridge": "2-Point Synchronized Tremolo"}'::jsonb,
  12;

INSERT INTO products (name, description, price, category_id, brand_id, sku, suitable_for, features, specifications, warranty_months) 
SELECT 
  'Pearl Export Series Drum Kit',
  'Complete 5-piece drum kit perfect for beginners and intermediate drummers. Includes cymbals and hardware.',
  85000.00,
  (SELECT id FROM categories WHERE slug = 'percussion'),
  (SELECT id FROM brands WHERE name = 'Pearl'),
  'PER-PEA-EXPO-I9J0',
  ARRAY['beginner', 'intermediate'],
  ARRAY['5-piece configuration', 'Poplar shells', 'Chrome hardware', 'Cymbals included'],
  '{"shells": "6-ply poplar", "sizes": "22x16 BD, 10x7 TT, 12x8 TT, 16x14 FT, 14x5.5 SD", "finish": "Jet Black"}'::jsonb,
  12;

-- Insert Product Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
  'Yamaha FG830 Acoustic Guitar',
  true,
  0
FROM products p WHERE p.sku = 'STR-YAM-FG83-A1B2';

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=600&q=80',
  'Roland FP-30X Digital Piano',
  true,
  0
FROM products p WHERE p.sku = 'ELE-ROL-FP30-C3D4';

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
  'Traditional Sri Lankan Tabla Set',
  true,
  0
FROM products p WHERE p.sku = 'TRA-TCL-TABL-E5F6';

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
  'Fender Player Stratocaster',
  true,
  0
FROM products p WHERE p.sku = 'STR-FEN-STRA-G7H8';

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1571327073757-af17cf2c2bdb?auto=format&fit=crop&w=600&q=80',
  'Pearl Export Drum Kit',
  true,
  0
FROM products p WHERE p.sku = 'PER-PEA-EXPO-I9J0';

-- Insert Inventory
INSERT INTO inventory (product_id, quantity_available, reorder_level, reorder_quantity)
SELECT id, 25, 5, 10 FROM products;

-- Insert Onboarding Questions
INSERT INTO onboarding_questions (question, options, weight_beginner, weight_intermediate, weight_professional, sort_order) VALUES
('How long have you been playing musical instruments?', 
 '[
   {"text": "I''m completely new to music", "points": {"beginner": 5, "intermediate": 0, "professional": 0}},
   {"text": "Less than 1 year", "points": {"beginner": 4, "intermediate": 1, "professional": 0}},
   {"text": "1-3 years", "points": {"beginner": 2, "intermediate": 4, "professional": 0}},
   {"text": "3-7 years", "points": {"beginner": 0, "intermediate": 3, "professional": 2}},
   {"text": "7+ years", "points": {"beginner": 0, "intermediate": 1, "professional": 5}}
 ]'::jsonb, 1, 1, 1, 1),

('What best describes your musical goals?',
 '[
   {"text": "Learn to play for fun and relaxation", "points": {"beginner": 5, "intermediate": 1, "professional": 0}},
   {"text": "Play with friends and family", "points": {"beginner": 3, "intermediate": 3, "professional": 0}},
   {"text": "Join a band or perform locally", "points": {"beginner": 1, "intermediate": 4, "professional": 1}},
   {"text": "Pursue music professionally or teach", "points": {"beginner": 0, "intermediate": 2, "professional": 4}},
   {"text": "Already performing/teaching professionally", "points": {"beginner": 0, "intermediate": 0, "professional": 5}}
 ]'::jsonb, 1, 1, 1, 2),

('How comfortable are you with music theory?',
 '[
   {"text": "I don''t know any music theory", "points": {"beginner": 5, "intermediate": 0, "professional": 0}},
   {"text": "I know basic notes and chords", "points": {"beginner": 3, "intermediate": 2, "professional": 0}},
   {"text": "I understand scales and key signatures", "points": {"beginner": 1, "intermediate": 4, "professional": 1}},
   {"text": "I''m comfortable with advanced theory", "points": {"beginner": 0, "intermediate": 2, "professional": 3}},
   {"text": "I can analyze and compose complex pieces", "points": {"beginner": 0, "intermediate": 0, "professional": 5}}
 ]'::jsonb, 1, 1, 1, 3),

('What''s your experience with different instruments?',
 '[
   {"text": "I''ve never played any instrument", "points": {"beginner": 5, "intermediate": 0, "professional": 0}},
   {"text": "I play one instrument at a basic level", "points": {"beginner": 4, "intermediate": 1, "professional": 0}},
   {"text": "I play 1-2 instruments reasonably well", "points": {"beginner": 1, "intermediate": 4, "professional": 1}},
   {"text": "I play multiple instruments competently", "points": {"beginner": 0, "intermediate": 2, "professional": 3}},
   {"text": "I''m proficient in many instruments", "points": {"beginner": 0, "intermediate": 0, "professional": 5}}
 ]'::jsonb, 1, 1, 1, 4),

('What''s your budget range for musical instruments?',
 '[
   {"text": "Under LKR 25,000 (starter instruments)", "points": {"beginner": 4, "intermediate": 1, "professional": 0}},
   {"text": "LKR 25,000 - 75,000 (quality beginner to intermediate)", "points": {"beginner": 3, "intermediate": 3, "professional": 0}},
   {"text": "LKR 75,000 - 200,000 (professional quality)", "points": {"beginner": 1, "intermediate": 3, "professional": 2}},
   {"text": "LKR 200,000 - 500,000 (high-end instruments)", "points": {"beginner": 0, "intermediate": 1, "professional": 4}},
   {"text": "Over LKR 500,000 (premium/vintage instruments)", "points": {"beginner": 0, "intermediate": 0, "professional": 5}}
 ]'::jsonb, 1, 1, 1, 5);

-- Functions
CREATE OR REPLACE FUNCTION calculate_product_rating(product_uuid UUID)
RETURNS TABLE(average_rating DECIMAL, total_reviews INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(rating::DECIMAL), 2), 0) as average_rating,
    COUNT(*)::INTEGER as total_reviews
  FROM reviews 
  WHERE product_id = product_uuid AND is_approved = true;
END;
$$ LANGUAGE plpgsql;

-- Inventory update function
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE inventory 
    SET quantity_reserved = quantity_reserved + NEW.quantity
    WHERE product_id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE inventory 
    SET quantity_reserved = quantity_reserved - OLD.quantity
    WHERE product_id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_inventory_on_order
  AFTER INSERT OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_inventory_on_order();

-- Updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create admin user (you'll need to sign up first, then update the role)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
