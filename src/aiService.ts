module aiService {
  /** Returns the move that the computer player should do for the given state in move. */
  export function findComputerMove(computerOrHuman: number[], boardWithSnake: BoardWithSnakes): Direction[] {
    let res: Direction[] = []
    for (let i = 0; i < computerOrHuman.length; i++) {
      if (computerOrHuman[i] == 1 || boardWithSnake.snakes[i].dead) {
        res.push(null)
      }
      else {
        let board: Board = boardWithSnake.board;
        let snake = boardWithSnake.snakes[i]
        let head: Cell = boardWithSnake.snakes[i].headToTail[0];
        let tempDirection: Direction = {shiftX: 1, shiftY: 0};
        let count: number = 0;

        let possibleMoves :Direction[] = []
        possibleMoves.push({shiftX: 1, shiftY: 0}, {shiftX: -1, shiftY: 0}, {shiftX: 0, shiftY: 1}, {shiftX: 0, shiftY: -1})
        for (let j = 0; j < possibleMoves.length; j++) {
          let move = possibleMoves[j]
          if (!isValid(move, board, snake)) {
            continue
          }
          if (hasFoodThisWay(head, move, board)) {
            tempDirection = move
            console.log('find food')
            break
          }
          tempDirection = move
        }
        console.log(tempDirection)
        res.push(tempDirection)
      }
    }
    return res;
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
    let head: Cell = snake.headToTail[0]
    let oldDirection : Direction = snake.currentDirection
    return !gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row+newDirection.shiftX, head.col+newDirection.shiftY, board)
    && !(oldDirection.shiftX + newDirection.shiftX == 0 &&
        oldDirection.shiftY + newDirection.shiftY == 0)
  }
}
