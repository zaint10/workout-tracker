# Workout Tracker

A mobile-friendly workout tracking webapp for tracking Pull/Push day splits.

## Features

- 📱 Mobile-first design
- 💪 Pull Day & Push Day tracking
- 📝 Exercise library management
- ⚖️ Weight tracking with max weight history
- 📓 Notes for each exercise (e.g., "only 4 clean reps")
- 🔄 Quick view of last workouts
- 💾 Local storage persistence (no account needed)

## Workout Split

### Pull Day
- Back exercises
- 1 Bicep exercise
- 1 Rear Delt exercise (3 sets x 12 reps)
- 1 Leg exercise (4 sets: 12, 10, 8, 6 reps)

### Push Day
- 2 Chest exercises
- 2 Shoulder exercises
- 1 Tricep exercise (3 sets x 12 reps)
- 1 Leg exercise (4 sets: 12, 10, 8, 6 reps)

## Set/Rep Schemes

- **Standard (4 sets)**: 12, 10, 8, 6 reps
- **Isolation (3 sets)**: 12, 12, 12 reps

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/zaint10/workout-tracker.git
cd workout-tracker

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Click "Deploy"

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Click "Deploy site"

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Local Storage (browser)

## Usage

1. **First Time**: Add your exercises to the library
2. **Start Workout**: Select Pull Day or Push Day
3. **Select Exercises**: Pick exercises for today or repeat last workout
4. **Log Weights**: Update weight only if it changed
5. **Add Notes**: Optional notes for reps quality
6. **Finish**: Save your workout

## License

MIT
