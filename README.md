<div align="center">
  <h1>MindShift Manifest</h1>
  <p>A premium daily mental reprogramming app with deterministic, local-first affirmation tools. No external AI or third-party services required.</p>
</div>

## Features
- Daily Invocations carousel with deterministic affirmation generation
- Add New Affirmation: create, edit, duplicate, delete with version history
- My Affirmations: search, filter (category, reminder, date), sort (newest/oldest/alpha/most used)
- Reminders: Daily, Weekly, Monthly, or custom days
- Local persistence: browser storage (no servers, no API keys)
- Backup & Restore: export/import affirmations as JSON
- Accessibility: WCAG 2.1 AA-friendly controls and labels
- Responsive design: works from mobile to desktop

## Tech Stack
- Vite + React
- TypeScript
- Tailwind (CDN)
- Vitest (unit tests)

## Getting Started
1. Install dependencies:
   - npm install
2. Run dev server:
   - npm run dev
3. Open:
   - http://localhost:3000/

## Tests
- Run tests:
  - npm run test
- Coverage:
  - npm run test:coverage

## Data Export/Import
- Export: My Affirmations → Export
- Import: My Affirmations → Import → select a JSON backup
- Imported data is validated and limited to 1000 affirmations.

## License
- MIT License (see LICENSE)

## Security & Privacy
- No API keys, no external AI models, no server calls
- All data lives in your browser storage
