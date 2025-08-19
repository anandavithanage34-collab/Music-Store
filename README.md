# Harmony House - Sri Lankan Music Store

A modern e-commerce platform for musical instruments, built with React, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Complete signup, signin, and profile management
- **Onboarding System**: Skill assessment to personalize user experience
- **Product Catalog**: Browse musical instruments by category and skill level
- **Shopping Cart**: Add items and manage cart
- **User Profiles**: Manage personal information and preferences
- **Responsive Design**: Mobile-first approach with modern UI/UX

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: React Context + Hooks
- **Styling**: Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MusicWeb
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Authentication Flow

### Signup Process
1. User fills out registration form with personal details
2. Account is created in Supabase Auth
3. Profile is created in the `profiles` table
4. User is redirected to onboarding for skill assessment
5. Onboarding responses are saved to `onboarding_responses` table
6. Profile is updated with skill level and completion status

### Signin Process
1. User enters email and password
2. Supabase authenticates the user
3. User profile is fetched from the database
4. If no profile exists, one is automatically created
5. User is redirected to the homepage with full profile data

### Data Persistence
- All user data is stored in Supabase PostgreSQL database
- User profiles persist across sessions
- Onboarding responses are permanently stored
- Authentication state is managed by Supabase Auth

## Database Schema

The application uses the following main tables:

- **profiles**: User profile information and preferences
- **onboarding_questions**: Skill assessment questions
- **onboarding_responses**: User responses to assessment questions
- **products**: Musical instruments and accessories
- **categories**: Product categories
- **brands**: Musical instrument brands

## Testing the Authentication

1. **Create a new account**:
   - Navigate to `/register`
   - Fill out the form with valid information
   - Submit to create account
   - Check your email for confirmation

2. **Sign in with existing account**:
   - Navigate to `/login`
   - Use the email and password from registration
   - You should be redirected to the homepage

3. **Complete onboarding**:
   - After signup, you'll be redirected to `/onboarding`
   - Answer the skill assessment questions
   - Your skill level will be determined and saved

4. **View profile**:
   - Navigate to `/profile` to see your information
   - All data should persist after signing out and back in

## Troubleshooting

### Common Issues

1. **Profile not loading after signin**:
   - Check browser console for errors
   - Verify Supabase connection
   - Ensure RLS policies are properly configured

2. **Onboarding questions not loading**:
   - Verify `onboarding_questions` table has data
   - Check Supabase permissions

3. **Authentication errors**:
   - Verify environment variables are correct
   - Check Supabase project settings
   - Ensure email confirmation is enabled if required

### Debug Mode

Enable debug logging by checking the browser console. The authentication system includes comprehensive logging for troubleshooting.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
