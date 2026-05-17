-- Seed puzzle data for nfactorial school checkers
-- Run this after schema.sql

-- Helper: board state format
-- board_state is the full GameState JSON
-- solution_moves is array of Move objects

insert into public.puzzles (title, description, difficulty, board_state, solution_moves, is_daily, daily_date, hint1, hint2, hint3, created_by) values

-- EASY PUZZLES
('First Blood', 'Red can capture a blue piece in one move.', 'easy',
'{
  "board": [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,{"id":"b1","color":"blue","type":"man","row":3,"col":2},null,null,null,null],[null,null,{"id":"r1","color":"red","type":"man","row":4,"col":1},null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  "currentTurn":"red","status":"playing","moveCount":0,"movesSinceCapture":0,"selectedPiece":null,"validMoves":[],"lastMove":null,"capturedRed":0,"capturedBlue":0
}',
'[{"from":{"row":4,"col":1},"to":{"row":2,"col":3},"captures":[{"row":3,"col":2}]}]',
true, '2024-01-01',
'Look for a diagonal jump.',
'The red piece at row 4, col 1 can jump over the blue piece.',
'Move from (4,1) to (2,3) by jumping over (3,2).', 'system'),

('Double Jump', 'Red can capture TWO blue pieces in one turn!', 'easy',
'{
  "board": [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,{"id":"b1","color":"blue","type":"man","row":2,"col":5},null,null],[null,null,null,null,{"id":"b2","color":"blue","type":"man","row":3,"col":4},null,null,null],[null,null,null,{"id":"r1","color":"red","type":"man","row":4,"col":3},null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  "currentTurn":"red","status":"playing","moveCount":0,"movesSinceCapture":0,"selectedPiece":null,"validMoves":[],"lastMove":null,"capturedRed":0,"capturedBlue":0
}',
'[{"from":{"row":4,"col":3},"to":{"row":2,"col":5},"captures":[{"row":3,"col":4}]},{"from":{"row":2,"col":5},"to":{"row":0,"col":7},"captures":[{"row":1,"col":6}]}]',
false, null,
'Look for pieces that can jump two in sequence.',
'Jump the piece at (3,4) first, then continue jumping.',
'From (4,3) jump to (2,5) capturing (3,4), then keep jumping.', 'system'),

('Clear the Path', 'Remove the blocking piece to advance.', 'easy',
'{
  "board": [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,{"id":"b1","color":"blue","type":"man","row":3,"col":4},null,null,null],[null,null,null,{"id":"r1","color":"red","type":"man","row":4,"col":3},null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  "currentTurn":"red","status":"playing","moveCount":0,"movesSinceCapture":0,"selectedPiece":null,"validMoves":[],"lastMove":null,"capturedRed":0,"capturedBlue":0
}',
'[{"from":{"row":4,"col":3},"to":{"row":2,"col":5},"captures":[{"row":3,"col":4}]}]',
false, null,
'Can you jump diagonally?',
'The red piece can jump the blue piece.',
'Move red from (4,3) to (2,5), jumping over (3,4).', 'system'),

-- MEDIUM PUZZLES
('Fork Attack', 'Set up a position where Arman cannot avoid losing two pieces.', 'medium',
'{
  "board": [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,{"id":"b1","color":"blue","type":"man","row":3,"col":2},null,{"id":"b2","color":"blue","type":"man","row":3,"col":6},null],[null,null,null,null,{"id":"r1","color":"red","type":"man","row":4,"col":5},null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  "currentTurn":"red","status":"playing","moveCount":0,"movesSinceCapture":0,"selectedPiece":null,"validMoves":[],"lastMove":null,"capturedRed":0,"capturedBlue":0
}',
'[{"from":{"row":4,"col":5},"to":{"row":2,"col":7},"captures":[{"row":3,"col":6}]}]',
false, null,
'Look at which blue pieces are vulnerable.',
'The piece at (3,6) is exposed. Take it.',
'Capture from (4,5) to (2,7) taking (3,6).', 'system'),

('King Race', 'Get a king before your opponent.', 'medium',
'{
  "board": [[null,null,null,null,null,null,null,null],[null,null,{"id":"r1","color":"red","type":"man","row":1,"col":2},null,null,null,null,null],[null,null,null,{"id":"b1","color":"blue","type":"man","row":2,"col":3},null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  "currentTurn":"red","status":"playing","moveCount":0,"movesSinceCapture":0,"selectedPiece":null,"validMoves":[],"lastMove":null,"capturedRed":0,"capturedBlue":0
}',
'[{"from":{"row":1,"col":2},"to":{"row":0,"col":1},"captures":[]}]',
false, null,
'How close is red to becoming a king?',
'Red is one step from the back row!',
'Move red from (1,2) to (0,1) to become a king.', 'system'),

('Sacrifice and Gain', 'Sometimes you must give one to take two.', 'medium',
'{
  "board": [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,{"id":"b1","color":"blue","type":"man","row":2,"col":3},null,{"id":"b2","color":"blue","type":"man","row":2,"col":5},null,null],[null,null,{"id":"r2","color":"red","type":"man","row":3,"col":2},null,null,null,null,null],[null,null,null,{"id":"r1","color":"red","type":"man","row":4,"col":3},null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  "currentTurn":"red","status":"playing","moveCount":0,"movesSinceCapture":0,"selectedPiece":null,"validMoves":[],"lastMove":null,"capturedRed":0,"capturedBlue":0
}',
'[{"from":{"row":3,"col":2},"to":{"row":1,"col":4},"captures":[{"row":2,"col":3}]}]',
false, null,
'Think about what happens after red captures.',
'After (3,2) captures (2,3), where can you jump next?',
'Jump from (3,2) over (2,3) to (1,4), then jump (2,5) to (0,6).' , 'system'),

-- HARD PUZZLES
('Triple Threat', 'Three captures in one sequence!', 'hard',
'{
  "board": [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"id":"b3","color":"blue","type":"man","row":1,"col":6},null],[null,null,null,null,{"id":"b2","color":"blue","type":"man","row":2,"col":4},null,null,null],[null,null,null,{"id":"b1","color":"blue","type":"man","row":3,"col":2},null,null,null,null],[null,null,{"id":"r1","color":"red","type":"man","row":4,"col":1},null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  "currentTurn":"red","status":"playing","moveCount":0,"movesSinceCapture":0,"selectedPiece":null,"validMoves":[],"lastMove":null,"capturedRed":0,"capturedBlue":0
}',
'[{"from":{"row":4,"col":1},"to":{"row":2,"col":3},"captures":[{"row":3,"col":2}]},{"from":{"row":2,"col":3},"to":{"row":0,"col":5},"captures":[{"row":1,"col":4}]},{"from":{"row":0,"col":5},"to":{"row":2,"col":7},"captures":[{"row":1,"col":6}]}]',
false, null,
'Count how many blue pieces are lined up.',
'There are 3 captures available in sequence.',
'Jump (3,2), then (2,4), then (1,6) in sequence.', 'arman'),

('King Dominance', 'Use the king to capture multiple pieces.', 'hard',
'{
  "board": [[null,{"id":"r1","color":"red","type":"king","row":0,"col":1},null,null,null,null,null,null],[null,null,{"id":"b1","color":"blue","type":"man","row":1,"col":2},null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,{"id":"b2","color":"blue","type":"man","row":3,"col":4},null,null,null],[null,null,null,null,null,{"id":"b3","color":"blue","type":"man","row":4,"col":5},null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  "currentTurn":"red","status":"playing","moveCount":0,"movesSinceCapture":0,"selectedPiece":null,"validMoves":[],"lastMove":null,"capturedRed":0,"capturedBlue":0
}',
'[{"from":{"row":0,"col":1},"to":{"row":2,"col":3},"captures":[{"row":1,"col":2}]}]',
false, null,
'Kings can move diagonally in any direction.',
'The king can start a chain capture.',
'Jump from (0,1) over (1,2) to (2,3), then keep chaining.', 'system'),

-- GRANDMASTER
('Arman Challenge #1', 'The hardest puzzle Arman could design. 5 captures.', 'grandmaster',
'{
  "board": [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"id":"b5","color":"blue","type":"man","row":1,"col":6},null],[null,null,null,null,{"id":"b4","color":"blue","type":"man","row":2,"col":4},null,null,null],[null,null,{"id":"b3","color":"blue","type":"man","row":3,"col":2},null,{"id":"b2","color":"blue","type":"man","row":3,"col":6},null,null,null],[null,{"id":"b1","color":"blue","type":"man","row":4,"col":2},null,null,null,null,null,null],[null,null,{"id":"r1","color":"red","type":"king","row":5,"col":0},null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  "currentTurn":"red","status":"playing","moveCount":0,"movesSinceCapture":0,"selectedPiece":null,"validMoves":[],"lastMove":null,"capturedRed":0,"capturedBlue":0
}',
'[{"from":{"row":5,"col":0},"to":{"row":3,"col":2},"captures":[{"row":4,"col":1}]}]',
false, null,
'This is a king. It can go in ALL diagonal directions.',
'Start by capturing the lowest piece.',
'The king at (5,0) starts a 4+ capture chain. Begin with (4,1).', 'arman');
