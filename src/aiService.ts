module aiService {
  /** Returns the move that the computer player should do for the given state in move. */
  export function findComputerMove(computerOrHuman: number[], boardWithSnake: BoardWithSnakes): Direction[] {
    let current = new Date().getTime();
    let res: Direction[] = []
    for (let i = 0; i < computerOrHuman.length; i++) {
      if (computerOrHuman[i] == 1 || boardWithSnake.snakes[i].dead) {
        res.push(null)
      }
      else {
        let board: Board = boardWithSnake.board;
        let snake = boardWithSnake.snakes[i]
        let head: Cell = boardWithSnake.snakes[i].headToTail[0];
        let possibleMoves = possibleDirections();
        let validMoves: Direction[] = [];
        let foodMove: Direction = null;
        for (let j = 0; j < possibleMoves.length; j++) {
          let move = possibleMoves[j]
          if (!isValid(move, board, snake)) {
            continue
          }
          if (hasFoodThisWay(head, move, board)) {
            foodMove = move;
            break
          }
          validMoves.push(move);
        }
        if (foodMove) {
          res.push(foodMove);
        } else {
          let maxScore:number = -1;
          let bestMove: Direction = null;
          for (let i=0;i<validMoves.length;i++) {
            let move: Direction = validMoves[i];
            let score: number = scoreCell(board, head.row + move.shiftX, head.col + move.shiftY);
            if (score >= maxScore) {
              maxScore = score;
              bestMove = move;
            }
          }
          res.push(bestMove)
        }
      }
    }
    //console.log(new Date().getTime() - current);
    return res;
  }

  function possibleDirections(): Direction[] {
    let possibleMoves :Direction[] = []
    possibleMoves.push({shiftX: 1, shiftY: 0}, {shiftX: -1, shiftY: 0}, {shiftX: 0, shiftY: 1}, {shiftX: 0, shiftY: -1})
    return possibleMoves;
  }

  function hasFoodThisWay(head: Cell, direction: Direction, board: Board): boolean {
    if (gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row+direction.shiftX, head.col+direction.shiftY, board)) {
      return false;
    }
    if (board[head.row+direction.shiftX][head.col+direction.shiftY] === 'FOOD') {
      return true;
    }
    if (gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row+2*direction.shiftX, head.col+2*direction.shiftY, board)) {
      return false;
    }
    if (board[head.row+2*direction.shiftX][head.col+2*direction.shiftY] === 'FOOD') {
      return true;
    }
    if (gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row+3*direction.shiftX, head.col+3*direction.shiftY, board)) {
      return false;
    }
    if (board[head.row+3*direction.shiftX][head.col+3*direction.shiftY] === 'FOOD') {
      return true;
    }
  }

  function isValid(newDirection: Direction, board: Board, snake: Snake): boolean {
    let head: Cell = snake.headToTail[0];
    let oldDirection : Direction = snake.currentDirection;
    return !gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row+newDirection.shiftX, head.col+newDirection.shiftY, board)
    && !(oldDirection.shiftX + newDirection.shiftX == 0 &&
        oldDirection.shiftY + newDirection.shiftY == 0)
  }

  function haveEnoughSpace(board:Board, row:number, col:number): boolean {
    let hasMore = true;
    let current: number[] = [];
    for (let i=0;i<board.length*board.length;i++) {
      current.push(0);
    }
    let N = board.length;
    current[encode(row, col, N)] = 1;
    while(hasMore) {
      hasMore  = false;
      for (let i=0;i<board.length*board.length;i++) {
        if (current[i]==0) {
          continue;
        }
        let thisRow = (i - i%N) / N;
        let thisCol = i % N;
        let directions: Direction[] = possibleDirections();
        for (let j=0;j<directions.length;j++) {
          let direction: Direction = directions[j];
          if (!gameLogic.isBarrierOrBorderOrOpponentOrMySelf(thisRow + direction.shiftX, thisCol+ direction.shiftY, board)) {
            let code = encode(thisRow + direction.shiftX, thisCol+ direction.shiftY, N);
            if (current[code] == 0) {
              current[code] = 1;
              hasMore = true;
            }
          }
        }
      }
      if (sizeOf(current) >= 20) {
        return true;
      }
    }
    if (sizeOf(current)  < 20) {
      return false;
    }
    return true;
  }

  function sizeOf(x: number[]): number {
    let count = 0;
    for (let i=0;i<x.length;i++) {
      if (x[i] == 1) {
        count++;
      }
    }
    return count;
  }

  function encode(row: number, col: number, N: number): number {
    return row * N + col;
  }

  function scoreCell(board: Board, row: number, col: number): number {
    if (gameLogic.isBarrierOrBorderOrOpponentOrMySelf(row, col, board)) {
      return -1;
    }
    if (!haveEnoughSpace(board, row, col)) {
      return 0;
    }
    let score: number = 0;
    for (let i=0;i<board.length;i++) {
      for (let j=0;j<board.length;j++) {
        if (i==row && j==col) {
          continue;
        }
        if (board[i][j] == 'FOOD') {
          let gap = 1.0 / (Math.abs(i - row) + Math.abs(j - col));
          score = score + gap;
        }
      }
    }
    return score;
  }
}
