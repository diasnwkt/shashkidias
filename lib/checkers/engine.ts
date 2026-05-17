import { Board, GameState, GameStatus, Move, Piece, PieceColor, PieceType } from './types'

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null))
  let id = 0

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = { id: `b${id++}`, color: 'blue', type: 'man', row, col }
        } else if (row > 4) {
          board[row][col] = { id: `r${id++}`, color: 'red', type: 'man', row, col }
        }
      }
    }
  }
  return board
}

export function createInitialGameState(): GameState {
  const board = createInitialBoard()
  return {
    board,
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

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

function getForwardDirections(color: PieceColor): { dr: number; dc: number }[] {
  return color === 'red' ? [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }] : [{ dr: 1, dc: -1 }, { dr: 1, dc: 1 }]
}

function getAllDirections(): { dr: number; dc: number }[] {
  return [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }]
}

export function getMovesForPiece(board: Board, piece: Piece, captureOnly = false): Move[] {
  const moves: Move[] = []
  const directions = piece.type === 'king' ? getAllDirections() : getForwardDirections(piece.color)

  // Capture moves
  for (const { dr, dc } of getAllDirections()) {
    if (piece.type === 'man') {
      const enemyRow = piece.row + dr
      const enemyCol = piece.col + dc
      const landRow = piece.row + dr * 2
      const landCol = piece.col + dc * 2

      if (!isInBounds(landRow, landCol)) continue
      const enemy = board[enemyRow]?.[enemyCol]
      if (!enemy || enemy.color === piece.color) continue
      if (board[landRow][landCol] !== null) continue

      moves.push({
        from: { row: piece.row, col: piece.col },
        to: { row: landRow, col: landCol },
        captures: [{ row: enemyRow, col: enemyCol }],
        piece,
      })
    } else {
      // King capture: slide until enemy, then land any empty square after
      let r = piece.row + dr
      let c = piece.col + dc
      let foundEnemy: { row: number; col: number } | null = null

      while (isInBounds(r, c)) {
        const cell = board[r][c]
        if (cell) {
          if (cell.color === piece.color) break
          if (foundEnemy) break // two enemies in a row
          foundEnemy = { row: r, col: c }
        } else if (foundEnemy) {
          moves.push({
            from: { row: piece.row, col: piece.col },
            to: { row: r, col: c },
            captures: [foundEnemy],
            piece,
          })
        }
        r += dr
        c += dc
      }
    }
  }

  if (moves.length > 0 || captureOnly) return moves

  // Regular moves (only if no captures)
  for (const { dr, dc } of directions) {
    if (piece.type === 'man') {
      const toRow = piece.row + dr
      const toCol = piece.col + dc
      if (!isInBounds(toRow, toCol)) continue
      if (board[toRow][toCol] !== null) continue
      moves.push({
        from: { row: piece.row, col: piece.col },
        to: { row: toRow, col: toCol },
        captures: [],
        piece,
      })
    } else {
      // King slides
      let r = piece.row + dr
      let c = piece.col + dc
      while (isInBounds(r, c) && board[r][c] === null) {
        moves.push({
          from: { row: piece.row, col: piece.col },
          to: { row: r, col: c },
          captures: [],
          piece,
        })
        r += dr
        c += dc
      }
    }
  }

  return moves
}

export function getAllValidMoves(board: Board, color: PieceColor): Move[] {
  const allMoves: Move[] = []
  const captureMoves: Move[] = []

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece || piece.color !== color) continue

      const moves = getMovesForPiece(board, piece, false)
      const captures = moves.filter(m => m.captures.length > 0)
      const normal = moves.filter(m => m.captures.length === 0)

      captureMoves.push(...captures)
      allMoves.push(...normal)
    }
  }

  // Mandatory capture rule
  return captureMoves.length > 0 ? captureMoves : allMoves
}

export function applyMove(board: Board, move: Move): Board {
  const newBoard = board.map(row => [...row])

  // Remove piece from source
  newBoard[move.from.row][move.from.col] = null

  // Remove captured pieces
  for (const cap of move.captures) {
    newBoard[cap.row][cap.col] = null
  }

  // Move piece to destination
  const piece: Piece = {
    ...move.piece,
    row: move.to.row,
    col: move.to.col,
  }

  // Check for king promotion
  if (piece.type === 'man') {
    if (piece.color === 'red' && move.to.row === 0) piece.type = 'king'
    if (piece.color === 'blue' && move.to.row === 7) piece.type = 'king'
  }

  newBoard[move.to.row][move.to.col] = piece
  return newBoard
}

export function checkMultiCapture(board: Board, piece: Piece): Move[] {
  // After a capture, check if the same piece can capture again
  const updatedPiece = board[piece.row][piece.col]
  if (!updatedPiece) return []
  return getMovesForPiece(board, updatedPiece, true)
}

export function checkGameStatus(board: Board, currentTurn: PieceColor, movesSinceCapture: number): GameStatus {
  if (movesSinceCapture >= 40) return 'draw'

  const moves = getAllValidMoves(board, currentTurn)
  if (moves.length === 0) {
    return currentTurn === 'red' ? 'blue_wins' : 'red_wins'
  }

  // Check if any pieces remain
  let redCount = 0
  let blueCount = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell?.color === 'red') redCount++
      if (cell?.color === 'blue') blueCount++
    }
  }

  if (redCount === 0) return 'blue_wins'
  if (blueCount === 0) return 'red_wins'

  return 'playing'
}

export function applyMoveToState(state: GameState, move: Move): GameState {
  const newBoard = applyMove(state.board, move)
  const captured = move.captures.length > 0

  // Check for multi-capture
  let multiCaptures: Move[] = []
  if (captured) {
    const movedPiece = newBoard[move.to.row][move.to.col]
    if (movedPiece) {
      multiCaptures = checkMultiCapture(newBoard, movedPiece)
    }
  }

  const nextTurn: PieceColor = multiCaptures.length > 0 ? state.currentTurn : (state.currentTurn === 'red' ? 'blue' : 'red')
  const movesSinceCapture = captured ? 0 : state.movesSinceCapture + 1
  const status = multiCaptures.length > 0 ? 'playing' : checkGameStatus(newBoard, nextTurn, movesSinceCapture)

  return {
    ...state,
    board: newBoard,
    currentTurn: nextTurn,
    status,
    moveCount: state.moveCount + 1,
    movesSinceCapture,
    selectedPiece: multiCaptures.length > 0 ? newBoard[move.to.row][move.to.col] : null,
    validMoves: multiCaptures.length > 0 ? multiCaptures : [],
    lastMove: move,
    capturedRed: state.capturedRed + (move.captures.filter(c => state.board[c.row][c.col]?.color === 'red').length),
    capturedBlue: state.capturedBlue + (move.captures.filter(c => state.board[c.row][c.col]?.color === 'blue').length),
  }
}

export function selectPiece(state: GameState, row: number, col: number): GameState {
  const piece = state.board[row]?.[col]
  if (!piece || piece.color !== state.currentTurn || state.status !== 'playing') {
    return state
  }

  // Mid-chain lock: after a capture, selectedPiece sits exactly on lastMove.to
  // (set together by applyMoveToState). A fresh selection never has this match.
  if (
    state.selectedPiece &&
    state.validMoves.length > 0 &&
    state.lastMove &&
    state.selectedPiece.row === state.lastMove.to.row &&
    state.selectedPiece.col === state.lastMove.to.col
  ) {
    return state
  }

  const allMoves = getAllValidMoves(state.board, state.currentTurn)
  const hasMandatoryCapture = allMoves.some(m => m.captures.length > 0)
  const pieceMoves = allMoves.filter(m => m.from.row === row && m.from.col === col)

  // If there's a mandatory capture and this piece has no captures, can't select it
  if (hasMandatoryCapture && !pieceMoves.some(m => m.captures.length > 0)) {
    return state
  }

  return {
    ...state,
    selectedPiece: piece,
    validMoves: pieceMoves,
  }
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)))
}
