# Running Training Planner

A web application for planning and tracking running workouts with weekly mileage summaries.

## Features

- **Calendar View**: View all weeks from January 5, 2026 to April 26, 2026
- **Workout Planning**: Plan workouts with type (Easy Run, Tempo, Intervals, Long Run, Rest) and planned mileage
- **Workout Tracking**: Mark workouts as complete and input actual distance run
- **Weekly Summaries**: See completed vs planned miles for each week with progress indicators
- **Data Persistence**: All data is saved to browser localStorage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Add a Workout**: Click on any day within the date range (Jan 5 - Apr 26, 2026) to add a workout
2. **Edit a Workout**: Click on an existing workout card to edit it
3. **Mark Complete**: Check the "Completed" checkbox on a workout card
4. **Enter Actual Distance**: After marking a workout complete, enter the actual distance you ran
5. **View Weekly Progress**: Each week shows a summary with planned miles, completed miles, and progress percentage

## Technology Stack

- React 18 with TypeScript
- Vite for build tooling
- date-fns for date manipulation
- localStorage for data persistence

