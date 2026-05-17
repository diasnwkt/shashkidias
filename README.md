# nfactorial school — Checkers

> The most ambitious checkers platform ever built. Not just a board game — a startup prototype.

Built for the **nfactorial school 2024 challenge** by demonstrating full-stack engineering, product thinking, and business instincts in a single web application.

---

## What I Built

A modern checkers platform that goes far beyond a simple board game. Here's what makes it different:

### Game Modes
- **vs Arman AI** — Battle an 8-bit pixel-art version of Arman Seitkali. The AI uses Minimax + Alpha-Beta pruning with 3 difficulty levels (Easy, Normal, Arman Mode). While Arman "thinks," he reads live tech news from Hacker News and shares summaries powered by Gemini AI.
- **Multiplayer** — Real-time games via Supabase WebSockets. Play with a friend via share link, or use ELO matchmaking to find a rated opponent. City leaderboards (Almaty, Astana, etc).
- **Puzzle Mode** — 50+ tactical checkers studies from Easy to Grandmaster. Daily puzzle with streak tracking. Hint system (3 hints per puzzle, each costs points).
- **Local 2-Player** — Pass-and-play on one device.

### AI Coach
After every game vs Arman, Google Gemini analyzes your moves and gives a post-game breakdown: missed captures, positional mistakes, what you did well — in Arman's voice, with a bit of Kazakh flair.

### Pro Subscription ($5/month)
Stripe Test Mode integration. Subscribers unlock:
- 10 preset board themes (Midnight, Desert, Ocean, Forest, Crimson, Gold, Neon, Sakura, Arctic...)
- Custom color picker for board cells and pieces
- Animated particle effects on moves

### Audio System
- Lo-fi background music (Howler.js) during games
- 8-bit sound effects generated programmatically via Web Audio API (no files needed): piece moves, explosion on capture, king promotion jingle, victory fanfare, defeat sound

### Animations
- **Explosion effect** when a piece is captured — 12 particles fly outward with physics
- Arman sprite has 5 animated states: idle bounce, thinking, attack, celebrate, sad
- Board pieces spring-animate on selection and movement
- King promotion crown burst animation
- Animated diagonal stripe background
- Staggered leaderboard row entrance

---

## For Whom & Why It's Valuable

**Target audience:** Competitive mobile gamers and developers in Central Asia who want a quick strategy game during breaks.

**Why it's valuable:**
1. **Retention** — Daily puzzle + ELO ranking + city leaderboards give players reasons to come back every day
2. **Social** — City-based rankings create local community ("I'm #3 in Almaty")
3. **Monetization** — $5/mo Pro subscription is priced for impulse purchase; cosmetics are the least intrusive monetization model
4. **Virality** — Multiplayer invite link is the primary growth mechanism

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Animations | Framer Motion + CSS animations |
| Backend/DB | Supabase (PostgreSQL + Auth + Realtime) |
| AI | Google Gemini 1.5 Flash |
| Payments | Stripe (Test Mode) |
| Audio | Howler.js + Web Audio API |
| Deploy | Vercel |

---

## Design Philosophy

**nfactorial meets 8-bit.** Not a retro game, not a corporate dashboard. A startup product with pixel art soul.

- **UI pages** (landing, profile, leaderboard) = clean, bold, nfactorial-inspired dark design
- **Game zone** = 8-bit pixel elements (Press Start 2P font, Arman sprite, explosion particles)
- Color palette: `#003049` (base) + `#c1121f` (primary) + `#f3701e` (accent) + `#669bbc` (secondary)

---

## Setup

```bash
# Install dependencies
npm install

# Copy env template
cp .env.local.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY, STRIPE keys

# Run Supabase schema
# Copy lib/supabase/schema.sql into your Supabase SQL editor and run it
# Then run lib/supabase/puzzle-seed.sql to seed puzzles

# Start development
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Stripe Test Mode
Use card `4242 4242 4242 4242` with any future expiry and CVC to test the Pro subscription flow.

---

## Project Structure

```
app/
  page.tsx              — Landing page
  play/
    page.tsx            — Mode selector
    ai/page.tsx         — vs Arman AI
    multiplayer/        — Online PvP + lobby
    puzzle/             — Puzzle mode
    local/page.tsx      — Local 2-player
  profile/              — User stats
  leaderboard/          — ELO rankings
  subscribe/            — Pro subscription
  customize/            — Theme editor (Pro)
  api/
    ai-coach/           — Gemini game analysis
    arman-news/         — HackerNews + Gemini summaries
    stripe/             — Checkout + webhook

lib/checkers/
  engine.ts             — Full Russian checkers rules
  minimax.ts            — AI with Alpha-Beta pruning
  types.ts              — Game type definitions

components/game/
  Board.tsx             — Interactive game board
  Piece.tsx             — Piece with animations
  Explosion.tsx         — Particle explosion effect
  ArmanSprite.tsx       — 8-bit CSS pixel art character
  ArmanPanel.tsx        — Arman's speech + news feed
  GameOver.tsx          — End screen + AI Coach analysis
```

---

## What I'd Build Next

- **Tournament system** — 8-player bracket with real-time spectating
- **Replay sharing** — Export any game as a shareable animated replay
- **Mobile PWA** — Install to home screen, offline puzzle mode
- **AI difficulty expansion** — Neural network trained on real checkers games
- **Social profiles** — Follow players, challenge friends directly

---

*Made with ❤️ for nfactorial school 2024. Built in record time using Claude Code.*
