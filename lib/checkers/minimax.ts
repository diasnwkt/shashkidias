import { Board, Move, PieceColor } from './types'
import { getAllValidMoves, applyMove, checkGameStatus, cloneBoard } from './engine'

export type Difficulty = 'easy' | 'normal' | 'arman'

const DEPTH_MAP: Record<Difficulty, number> = {
  easy: 2,
  normal: 4,
  arman: 6,
}

function evaluateBoard(board: Board, color: PieceColor): number {
  let score = 0
  const opponent: PieceColor = color === 'red' ? 'blue' : 'red'

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece) continue

      const isMe = piece.color === color
      const baseValue = piece.type === 'king' ? 3 : 1
      const sign = isMe ? 1 : -1

      // Positional bonuses
      let positional = 0
      if (piece.type === 'man') {
        // Advancement bonus
        const advancement = isMe
          ? (color === 'red' ? 7 - row : row)
          : (opponent === 'red' ? 7 - row : row)
        positional += advancement * 0.1
      }

      // Center control bonus
      const centerDist = Math.abs(col - 3.5) + Math.abs(row - 3.5)
      positional += (7 - centerDist) * 0.05

      // Back row protection
      if (piece.type === 'man') {
        const backRow = piece.color === 'red' ? 7 : 0
        if (row === backRow) positional += 0.3
      }

      score += sign * (baseValue + positional)
    }
  }

  return score
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiColor: PieceColor
): number {
  const currentColor: PieceColor = maximizing ? aiColor : (aiColor === 'red' ? 'blue' : 'red')
  const status = checkGameStatus(board, currentColor, 0)

  if (status !== 'playing') {
    if (status === 'draw') return 0
    if (status === `${aiColor}_wins`) return 1000 + depth
    return -1000 - depth
  }

  if (depth === 0) return evaluateBoard(board, aiColor)

  const moves = getAllValidMoves(board, currentColor)
  if (moves.length === 0) return maximizing ? -1000 : 1000

  if (maximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      const newBoard = applyMove(board, move)
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, aiColor)
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      const newBoard = applyMove(board, move)
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, aiColor)
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

export function getBestMove(board: Board, aiColor: PieceColor, difficulty: Difficulty): Move | null {
  const moves = getAllValidMoves(board, aiColor)
  if (moves.length === 0) return null

  // Easy mode: sometimes make random moves
  if (difficulty === 'easy' && Math.random() < 0.4) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  const depth = DEPTH_MAP[difficulty]
  let bestMove: Move | null = null
  let bestScore = -Infinity

  // Shuffle moves for variety at same score
  const shuffled = [...moves].sort(() => Math.random() - 0.5)

  for (const move of shuffled) {
    const newBoard = applyMove(board, move)
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, aiColor)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}
