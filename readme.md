# Darts Performance Analytics Web Application

A comprehensive web application for analyzing darts tournament performance data, built with Next.js, TypeScript, and Supabase.

## Features

- **Dashboard**: Overview of key statistics and top performers
- **Player Analytics**: Individual player performance tracking and history
- **Team Analysis**: Team statistics and comparisons
- **Tournament Overview**: Tournament-specific insights and data
- **Advanced Analytics**: Performance distributions and trends
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: GitHub Pages / Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses a normalized database schema with the following tables:
- `tournaments`: Tournament information
- `teams`: Team data
- `players`: Player information
- `player_stats`: Individual performance statistics
- `tournament_teams`: Many-to-many relationship between tournaments and teams

## Deployment

This application is configured for static export and can be deployed to:
- GitHub Pages
- Vercel
- Netlify
- Any static hosting service

Run `npm run build` to create a production build.
