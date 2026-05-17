import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Board, GameState, PieceColor, PieceType } from '@/lib/checkers/types'

// ── helpers ───────────────────────────────────────────────────────────────────

function buildBoard(
  pieces: { id: string; color: PieceColor; type: PieceType; row: number; col: number }[],
): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null))
  for (const pc of pieces) board[pc.row][pc.col] = { ...pc }
  return board
}

function state(
  pieces: { id: string; color: PieceColor; type: PieceType; row: number; col: number }[],
): GameState {
  return {
    board: buildBoard(pieces),
    currentTurn: 'red',
    status: 'playing',
    moveCount: 0,
    movesSinceCapture: 0,
    selectedPiece: null,
    validMoves: [],
    lastMove: null,
    capturedRed: 0,
    capturedBlue: 0,
  }
}

function r(id: string, row: number, col: number, type: PieceType = 'man') {
  return { id, color: 'red' as PieceColor, type, row, col }
}
function b(id: string, row: number, col: number, type: PieceType = 'man') {
  return { id, color: 'blue' as PieceColor, type, row, col }
}

// Puzzle page checks from.row, from.col, to.row, to.col
function mv(fR: number, fC: number, tR: number, tC: number, capR?: number, capC?: number) {
  return {
    from: { row: fR, col: fC },
    to:   { row: tR, col: tC },
    captures: capR != null ? [{ row: capR, col: capC! }] : [],
    piece: { id: '_', color: 'red' as PieceColor, type: 'man' as PieceType, row: fR, col: fC },
  }
}

// ── puzzles ───────────────────────────────────────────────────────────────────
// All solution moves are captures → currentTurn stays 'red' for every step.
// Square validity: (row + col) % 2 === 1.
// Captures go in ALL 4 diagonals (including backwards) for men.

const PUZZLES = [

  // ── EASY ──────────────────────────────────────────────────────────────────

  {
    title: 'First Strike',
    description: 'One blue piece — take it.',
    difficulty: 'easy',
    hint1: 'Red can jump diagonally over a blue piece.',
    hint2: 'Look at the piece on row 4, col 3.',
    hint3: 'Move red from (5,4) to (3,2) capturing the blue at (4,3).',
    // r(5,4) b(4,3) → land(3,2)   all (r+c)%2=1 ✓
    board_state: state([r('r1', 5, 4), b('b1', 4, 3)]),
    solution_moves: [mv(5, 4, 3, 2, 4, 3)],
  },

  {
    title: 'Left Lane',
    description: 'Clear the lane with a single jump.',
    difficulty: 'easy',
    hint1: 'There is exactly one capture available.',
    hint2: 'Red at (5,6) has an enemy diagonally forward-left.',
    hint3: 'Move red (5,6)→(3,4) capturing the blue at (4,5).',
    // (5+6)=11✓ (4+5)=9✓ (3+4)=7✓
    board_state: state([r('r1', 5, 6), b('b1', 4, 5)]),
    solution_moves: [mv(5, 6, 3, 4, 4, 5)],
  },

  {
    title: 'Quick Combo',
    description: 'Two blues on a diagonal — chain both captures.',
    difficulty: 'easy',
    hint1: 'After the first capture you land in range of a second blue.',
    hint2: 'Start at (5,4) and jump left twice.',
    hint3: 'Chain: (5,4)→(3,2)→(1,0) capturing (4,3) then (2,1).',
    // (5+4)=9✓ (4+3)=7✓ (3+2)=5✓ (2+1)=3✓ (1+0)=1✓
    board_state: state([r('r1', 5, 4), b('b1', 4, 3), b('b2', 2, 1)]),
    solution_moves: [mv(5, 4, 3, 2, 4, 3), mv(3, 2, 1, 0, 2, 1)],
  },

  {
    title: 'Corner Rush',
    description: 'Two blues on a right-slanting diagonal — chain them.',
    difficulty: 'easy',
    hint1: 'Both blues are set up for two consecutive jumps.',
    hint2: 'Start at (7,2) and jump right-up twice.',
    hint3: 'Chain: (7,2)→(5,4)→(3,6) capturing (6,3) then (4,5).',
    // (7+2)=9✓ (6+3)=9✓ (5+4)=9✓ (4+5)=9✓ (3+6)=9✓
    board_state: state([r('r1', 7, 2), b('b1', 6, 3), b('b2', 4, 5)]),
    solution_moves: [mv(7, 2, 5, 4, 6, 3), mv(5, 4, 3, 6, 4, 5)],
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────

  {
    title: 'Double Cross',
    description: 'A two-jump chain that changes direction.',
    difficulty: 'medium',
    hint1: 'After the first capture, look in the other direction.',
    hint2: 'From (5,0) jump right, then look left.',
    hint3: 'Chain: (5,0)→(3,2)→(1,0) capturing (4,1) then (2,1).',
    // (5+0)=5✓ (4+1)=5✓ (3+2)=5✓ (2+1)=3✓ (1+0)=1✓
    board_state: state([r('r1', 5, 0), b('b1', 4, 1), b('b2', 2, 1)]),
    solution_moves: [mv(5, 0, 3, 2, 4, 1), mv(3, 2, 1, 0, 2, 1)],
  },

  {
    title: 'Forced March',
    description: 'Three blues on a diagonal — sweep all in one chain.',
    difficulty: 'medium',
    hint1: 'Three blues line up for a single extended chain.',
    hint2: 'Start from (7,0) and jump right three times.',
    hint3: 'Chain: (7,0)→(5,2)→(3,4)→(1,6) clearing all three blues.',
    // (7+0)=7✓ (6+1)=7✓ (5+2)=7✓ (4+3)=7✓ (3+4)=7✓ (2+5)=7✓ (1+6)=7✓
    board_state: state([r('r1', 7, 0), b('b1', 6, 1), b('b2', 4, 3), b('b3', 2, 5)]),
    solution_moves: [mv(7, 0, 5, 2, 6, 1), mv(5, 2, 3, 4, 4, 3), mv(3, 4, 1, 6, 2, 5)],
  },

  {
    title: 'The Zigzag',
    description: 'Captures that alternate direction — left then right.',
    difficulty: 'medium',
    hint1: 'The captures don\'t go straight — they zigzag.',
    hint2: 'First jump goes left-up, second goes right-up.',
    hint3: 'Chain: (5,6)→(3,4)→(1,6) capturing (4,5) then (2,5).',
    // from(3,4): dr=-1,dc=+1 → enemy(2,5), land(1,6) — (2+5)=7✓ (1+6)=7✓
    board_state: state([r('r1', 5, 6), b('b1', 4, 5), b('b2', 2, 5)]),
    solution_moves: [mv(5, 6, 3, 4, 4, 5), mv(3, 4, 1, 6, 2, 5)],
  },

  {
    title: 'Pick the Right One',
    description: 'Two reds can capture — only one leads to a double jump.',
    difficulty: 'medium',
    hint1: 'One red can chain two captures; the other is a dead end.',
    hint2: 'The red at (7,4) only takes one blue before stopping.',
    hint3: 'Use red at (5,6): (5,6)→(3,4)→(1,6) capturing (4,5) then (2,5).',
    // r1(5,6) chains b1(4,5)→b2(2,5): (5,6)→(3,4)→(1,6) ✓
    // r2(7,4) can capture b3(6,3)→(5,2); from (5,2): no blues nearby → dead end
    // (7+4)=11✓ (6+3)=9✓ (5+2)=7✓
    board_state: state([
      r('r1', 5, 6), r('r2', 7, 4),
      b('b1', 4, 5), b('b2', 2, 5), b('b3', 6, 3),
    ]),
    solution_moves: [mv(5, 6, 3, 4, 4, 5), mv(3, 4, 1, 6, 2, 5)],
  },

  // ── HARD ──────────────────────────────────────────────────────────────────

  {
    title: 'Full Sweep',
    description: 'Three blues on a left diagonal — clear them in one chain.',
    difficulty: 'hard',
    hint1: 'Three blues form a straight diagonal chain.',
    hint2: 'Start at (7,6) and jump left three times.',
    hint3: 'Chain: (7,6)→(5,4)→(3,2)→(1,0) capturing all three blues.',
    // (7+6)=13✓ (6+5)=11✓ (5+4)=9✓ (4+3)=7✓ (3+2)=5✓ (2+1)=3✓ (1+0)=1✓
    board_state: state([r('r1', 7, 6), b('b1', 6, 5), b('b2', 4, 3), b('b3', 2, 1)]),
    solution_moves: [mv(7, 6, 5, 4, 6, 5), mv(5, 4, 3, 2, 4, 3), mv(3, 2, 1, 0, 2, 1)],
  },

  {
    title: 'Find the Chain',
    description: 'Two reds, four blues — only one red leads to a triple capture.',
    difficulty: 'hard',
    hint1: 'One red chains three captures. The other hits a dead end after one.',
    hint2: 'The red at (7,0) takes only one blue then stops.',
    hint3: 'Use red at (7,6): chain (7,6)→(5,4)→(3,6)→(1,4) through blues at (6,5),(4,5),(2,5).',
    // r1(7,6) chains b1(6,5)→b2(4,5)→b3(2,5) via (5,4)→(3,6)→(1,4)
    // Verify: (5+4)=9✓ (4+5)=9✓ (3+6)=9✓ (2+5)=7✓ (1+4)=5✓
    // r2(7,0) captures b4(6,1)→(5,2); from(5,2): b2(4,5)? dr=-1,dc=+1→(4,3) no blue. Dead end. ✓
    // (7+0)=7✓ (6+1)=7✓ (5+2)=7✓
    board_state: state([
      r('r1', 7, 6), r('r2', 7, 0),
      b('b1', 6, 5), b('b2', 4, 5), b('b3', 2, 5),
      b('b4', 6, 1),
    ]),
    solution_moves: [mv(7, 6, 5, 4, 6, 5), mv(5, 4, 3, 6, 4, 5), mv(3, 6, 1, 4, 2, 5)],
  },

  // ── GRANDMASTER ───────────────────────────────────────────────────────────

  {
    title: 'The Grand Slam',
    description: 'The chain starts backwards. Find the hidden triple capture.',
    difficulty: 'grandmaster',
    hint1: 'The only available capture goes DOWN the board — don\'t ignore backwards jumps.',
    hint2: 'Red captures b1 at (4,3) by jumping backwards to (5,2).',
    hint3: 'Chain: (3,4)→(5,2)→(3,0)→(1,2) capturing (4,3),(4,1),(2,1) — all via one piece.',
    // r1(3,4): ONLY capture is BACKWARD: dr=+1,dc=-1 → enemy(4,3)=b1, land(5,2). (5+2)=7✓
    // Forward captures from (3,4): dr=-1,dc±1 → (2,3) and (2,5) — no blues there.
    // From (5,2): b2(4,1): dr=-1,dc=-1 → (4,1)=b2, land(3,0). (3+0)=3✓ ✓
    // From (3,0): b3(2,1): dr=-1,dc=+1 → (2,1)=b3, land(1,2). (1+2)=3✓ ✓
    board_state: state([
      r('r1', 3, 4),
      b('b1', 4, 3), b('b2', 4, 1), b('b3', 2, 1),
    ]),
    solution_moves: [
      mv(3, 4, 5, 2, 4, 3),
      mv(5, 2, 3, 0, 4, 1),
      mv(3, 0, 1, 2, 2, 1),
    ],
  },

]

// ── route ─────────────────────────────────────────────────────────────────────

export async function POST() {
  try {
    const supabase = await createClient()

    await supabase.from('puzzles').delete().eq('is_daily', false)

    const rows = PUZZLES.map(p => ({
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      is_daily: false,
      hint1: p.hint1,
      hint2: p.hint2,
      hint3: p.hint3,
      board_state: p.board_state,
      solution_moves: p.solution_moves,
      created_by: 'system',
    }))

    const { error } = await supabase.from('puzzles').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      seeded: rows.length,
      puzzles: rows.map(p => `${p.difficulty}: ${p.title}`),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
