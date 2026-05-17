export type PieceColor = 'red' | 'blue'
export type PieceType = 'man' | 'king'

export interface Piece {
  id: string
  color: PieceColor
  type: PieceType
  row: number
  col: number
}

export interface Move {
  from: { row: number; col: number }
  to: { row: number; col: number }
  captures: { row: number; col: number }[]
  piece: Piece
}

export type Board = (Piece | null)[][]

export type GameStatus = 'playing' | 'red_wins' | 'blue_wins' | 'draw'

export interface GameState {
  board: Board
  currentTurn: PieceColor
  status: GameStatus
  moveCount: number
  movesSinceCapture: number
  selectedPiece: Piece | null
  validMoves: Move[]
  lastMove: Move | null
  capturedRed: number
  capturedBlue: number
}

export interface MoveRecord {
  move: Move
  boardSnapshot: Board
  timestamp: number
}
