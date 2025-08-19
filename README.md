# Music Store Sri Lanka 🎵

A modern, responsive e-commerce website for a Sri Lankan musical instrument store built with React, Tailwind CSS, and Supabase.

## Features

### Customer Features
- **User Registration & Login** with skill level assessment
- **Personalized Onboarding** - 5 questions to determine skill level (Beginner/Intermediate/Professional)
- **Product Browsing** with advanced search and filtering
- **Shopping Cart** with persistent storage
- **Secure Checkout** with Cash on Delivery
- **Product Reviews** from verified buyers
- **Personalized Recommendations** based on skill level

### Admin Features
- **Product Management** - Add, update, remove instruments
- **Order Management** - View and update order status
- **Customer Management** - View customer accounts
- **Inventory Management** - Track stock levels
- **Review Moderation** - Approve/reject customer reviews

### Staff Features
- **Order Processing** - Update order status
- **Inventory Updates** - Manage stock availability

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **UI Components**: Radix UI primitives, shadcn/ui style
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v6

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Supabase
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In your Supabase dashboard, go to the SQL Editor
3. Run the complete SQL script from \`supabase-setup.sql\` to create all tables and sample data
4. Get your project URL and anon key from Settings > API
5. Update \`src/lib/supabase.js\` with your credentials:

\`\`\`javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
\`\`\`

### 3. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:5173\`

## Database Schema

The application uses the following main tables:
- **profiles** - User information with Sri Lankan specific fields
- **categories** - Product categories (String, Wind, Percussion, etc.)
- **brands** - Musical instrument brands
- **products** - Musical instruments and accessories
- **product_images** - Product photos
- **inventory** - Stock management
- **cart_items** - Shopping cart storage
- **orders** - Customer orders
- **order_items** - Individual order line items
- **reviews** - Customer product reviews
- **onboarding_questions** - Skill assessment questions
- **onboarding_responses** - User skill assessment responses

## Key Features Implementation

### Skill Level Assessment
- 5 onboarding questions determine user skill level
- Personalized product recommendations
- Skill-appropriate product filtering

### Sri Lankan Localization
- LKR currency formatting
- Sri Lankan cities dropdown
- Local delivery information
- Traditional instrument categories

### Modern UI/UX
- Responsive design for all devices
- Smooth animations with Framer Motion
- Loading states and error handling
- Accessibility features

## Development Notes

### Authentication Setup
The Supabase MCP authentication needs to be configured properly. If you encounter authentication issues:

1. Set environment variable: \`SUPABASE_ACCESS_TOKEN=your_token\`
2. Or configure in Cursor MCP settings with the access token
3. Restart Cursor after setting the token

### Sample Data
The SQL script includes sample products, categories, and brands to get you started. You can modify or add more data as needed.

### Admin Account
After running the SQL script:
1. Sign up for an account through the website
2. In Supabase SQL Editor, run: \`UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';\`

## File Structure

\`\`\`
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components (Navbar, Footer)
│   └── features/        # Feature-specific components
├── pages/
│   ├── customer/        # Customer-facing pages
│   └── admin/           # Admin dashboard pages
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configurations
├── types/               # Type definitions
└── utils/               # Helper functions
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

---

Built with ❤️ for the Sri Lankan music community
