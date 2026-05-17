# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

## Critical: Tailwind v4

This project uses Tailwind CSS v4. Rules declared **outside** `@layer` in `globals.css` will override layered utilities. This has caused subtle bugs — for example, `.pixel-btn` had a `transition` shorthand that silently overrode `transition-colors` on buttons. If hover/focus/color transitions seem broken, check `globals.css` for un-layered rules.

## Architecture

**Stack:** Next.js 16.2.6 App Router · React 19 · TypeScript · Tailwind v4 · Supabase (Auth + PostgreSQL + Realtime) · Stripe · Google Gemini API · Howler.js

**Key directories:**
- `app/` — pages and API routes (App Router)
- `components/game/` — board, pieces, Arman AI panel, game-over overlay
- `components/ui/` — shared UI (Navbar, PixelButton, AnimatedBackground)
- `lib/checkers/` — pure TypeScript game engine (no UI dependencies)
- `lib/supabase/` — `client.ts` (browser) and `server.ts` (RSC/route handlers)
- `hooks/` — `useBoardTheme`, `useAudio`
- `public/arman/` — real photos: `default.png`, `happy.png`, `angry.png`, `terrified.png`

## Game Engine (`lib/checkers/engine.ts`)

All game logic is pure TypeScript. Two primary functions:

- `selectPiece(state, row, col)` — returns new state with `selectedPiece` + `validMoves`. Contains the **mid-chain lock**: if the currently selected piece is at `lastMove.to`, the chain must continue — return state unchanged.
- `applyMoveToState(state, move)` — executes the move, handles captures, king promotion, checks for multi-capture continuation via `checkMultiCapture`.

**Multi-capture chain flow:**
1. `applyMoveToState` calls `checkMultiCapture` after each capture.
2. If further captures exist, `currentTurn` stays the same and `selectedPiece` is pre-set to the capturing piece.
3. The AI page detects `isChainCapture = gameState.validMoves.length > 0 && gameState.selectedPiece != null` and fires immediately with `gameState.validMoves[0]` instead of running Minimax.
4. `moveCount` (not `currentTurn`) must be in the AI `useEffect` deps to re-trigger during chains.

**Mid-chain lock (Board.tsx + engine.ts):**
```ts
// Prevents re-selecting a different piece mid-chain
if (
  gameState.selectedPiece && gameState.validMoves.length > 0 &&
  gameState.lastMove &&
  gameState.selectedPiece.row === gameState.lastMove.to.row &&
  gameState.selectedPiece.col === gameState.lastMove.to.col
) return
```

## Puzzle false-solve guard (`app/play/puzzle/[id]/page.tsx`)

`handleStateChange` fires for both piece-selection and actual moves. Use a ref to distinguish:

```ts
const lastMoveRef = useRef<unknown>(null)
// In handleStateChange:
if (!newState.lastMove || newState.lastMove === lastMoveRef.current) return
lastMoveRef.current = newState.lastMove
```

`selectPiece` spreads `...state` keeping the same `lastMove` object reference; `applyMoveToState` creates a new `lastMove` object, so reference equality correctly identifies actual moves.

## Board Themes

`hooks/useBoardTheme.ts` reads from `localStorage` synchronously on init (no flash), then syncs from Supabase for Pro users. Always pass `boardTheme={boardTheme}` to `<Board />` in every game page — forgetting this causes the theme change in `/customize` to have no effect during play.

## Navbar Auth

`Navbar` self-fetches auth state client-side via `supabase.auth.getUser()` + `onAuthStateChange` listener. This is intentional — pages don't need to pass user props. State meaning: `undefined` = still loading (render nothing in auth slot), `null` = not logged in (show Login/Sign Up), object = logged in.

## Supabase Schema (key tables)

- `profiles` — `id, username, city, elo_rating, is_pro, stripe_customer_id, board_theme jsonb, puzzle_streak, last_puzzle_date`
- `rooms` — `room_code, player1_id, player2_id, status ('waiting'|'playing'|'finished'), board_state jsonb, current_turn`
- `puzzles` — `difficulty ('easy'|'medium'|'hard'|'grandmaster'), board_state jsonb, solution_moves jsonb[], is_daily, daily_date`
- `puzzle_completions` — `user_id, puzzle_id, time_seconds, hints_used, score`

## Pro / Stripe

Stripe is in test mode. For local testing without Stripe keys, `POST /api/subscribe/demo` sets `is_pro = true` directly. The subscribe page includes a test card hint (`4242 4242 4242 4242`). The real webhook lives at `app/api/stripe/webhook/route.ts`.

## Arman AI

- 3 difficulties: easy (depth 2, random moves), normal (depth 4), arman (depth 6)
- Minimax + Alpha-Beta in `lib/checkers/minimax.ts`
- Sprite moods: `idle → default.png`, `think → terrified.png`, `attack → angry.png`, `celebrate → happy.png`, `sad → terrified.png`
- News panel in `ArmanPanel.tsx` fetches HackerNews items, summarizes with Gemini, displays as a 3-item grid
