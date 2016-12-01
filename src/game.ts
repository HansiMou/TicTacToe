interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
};

interface Translations {
  [index: string]: SupportedLanguages;
}

module game {
  // Global variables are cleared when getting updateUI.
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console, e.g.,
  // game.currentUpdateUI
  export const ALLTIME = 120*1000;
  export const GameSpeed = 500;
  export const BoardSize = gameLogic.ROWS;
  export const ComputerOrHuman = [1, -1];
  export const NumberOfFood = gameLogic.NumberOfFood;
  export const NumberOfBarrier = gameLogic.NumberOfBarrier;
  export const ThirdComputerPlayer = false;

  export let currentUpdateUI: IUpdateUI = null;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let state: IState = null;
  export let action: any = null;
  export let snakeOneMove: Direction = null;
  export let snakeTwoMove: Direction = null;
  export let snakeThreeMove: Direction = null;
  export let RemainingTime = ALLTIME;
  export let reset = true;
  export let loseInfo = '';

  export function init() {
    resizeGameAreaService.setWidthToHeight(1);
    moveService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 3,
      updateUI: updateUI,
      gotMessageFromPlatform: null,
    });
  }

  export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;
    state = params.move.stateAfterMove;
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
    }
  }

  function makeMove(move: IMove) {
    reset = false;
    if (didMakeMove) { // Only one move per updateUI
      return;
    }
    didMakeMove = true;
    moveService.makeMove(move);
  }

  function isFirstMove() {
    return !currentUpdateUI.move.stateAfterMove;
  }

  export function move(): void {
    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    computerMove()
    let nextMove: IMove = null;
    try {
      let tmpMove = [angular.copy(snakeOneMove), angular.copy(snakeTwoMove)];
      if (ThirdComputerPlayer) {
        tmpMove.push(angular.copy(snakeThreeMove));
      }
      nextMove = gameLogic.createMove(
          state, tmpMove, RemainingTime-=GameSpeed, currentUpdateUI.move.turnIndexAfterMove);
      snakeOneMove = null;
      snakeTwoMove = null;
      snakeThreeMove = null;
    } catch (e) {
      $interval.cancel(action);
      currentUpdateUI.end = true;
      log.error(e);
      return;
    }
    // Move is legal, make it!
    makeMove(nextMove);
  }

  function computerMove(): void {
      let computerMoves:Direction[] = aiService.findComputerMove(ComputerOrHuman, state.boardWithSnakes);
      if (ComputerOrHuman[0] == -1) {
        snakeOneMove = computerMoves[0];
      }
      if (ComputerOrHuman[1] == -1) {
        snakeTwoMove = computerMoves[1];
      }
      if (ComputerOrHuman[2] == -1) {
        snakeThreeMove = computerMoves[2];
      }
  }

  function resetEverything(): void {
    $interval.cancel(action);
    action = null;
    RemainingTime = ALLTIME;
    reset = true;
    currentUpdateUI.move.stateAfterMove = null;
    currentUpdateUI.end = false;
    updateUI(currentUpdateUI);
  }

  export function isFood(row: number, col: number): boolean {
    return state.boardWithSnakes.board[row][col] === 'FOOD';
  }

  export function isBarrier(row: number, col: number): boolean {
    return state.boardWithSnakes.board[row][col] === 'BARRIER';
  }

  export function isSnakeOne(row: number, col: number): boolean {
    return state.boardWithSnakes.board[row][col] === 'SNAKE1';
  }
  
  export function isSnakeTwo(row: number, col: number): boolean {
    return state.boardWithSnakes.board[row][col] === 'SNAKE2';
  }

  export function isSnakeThree(row: number, col: number): boolean {
    return state.boardWithSnakes.board[row][col] === 'SNAKE3';
  }
  
  export function isDeadSnake(row: number, col: number) {
    return state.boardWithSnakes.board[row][col] === 'STONE';
  }

  export function getNumber(): number[] {
    let res: number[] = [];
    for (let i = 0; i < gameLogic.ROWS; i++) {
      res.push(i);
    }
    return res;
  }
  
  export function getSnakeLength(index: number): number {
    if (isFirstMove()) {
      return 1;
    } else {
      return currentUpdateUI.move.stateAfterMove.boardWithSnakes.snakes[index].headToTail.length;
    }
  }
  
  export function changeFoodNumber() {
    gameLogic.NumberOfFood = NumberOfFood;
    resetEverything();
  }

  export function changeBarrierNumber() {
    gameLogic.NumberOfBarrier = NumberOfBarrier;
    resetEverything();
  }

  export function changePlayerNumber() {
    if (ThirdComputerPlayer) {
      ComputerOrHuman.push(-1);
      gameLogic.NumberOfPlayer = 3;
    } else {
      ComputerOrHuman.pop();
      gameLogic.NumberOfPlayer = 2;
    }
    resetEverything();
  }

  export function changeGameSpeed() {
    if (action) {
      $interval.cancel(action);
      action = $interval(move, GameSpeed);
    }
  }

  export function isDraw(): boolean {
    if (currentUpdateUI.end == true) {
      return gameLogic.getWinner(currentUpdateUI.move.stateAfterMove.boardWithSnakes) === '';
    }
    return false;
  }

  export function isFinished(): boolean {
    return currentUpdateUI.end;
  }

  export function getWinnerColor(): string {
    let winner = gameLogic.getWinner(currentUpdateUI.move.stateAfterMove.boardWithSnakes);
    if (winner === '1') {
      return 'blue';
    } else if (winner === '2') {
      return 'red';
    } else {
      return 'orange';
    }
  }

  export function isSnakeDead(index: number): boolean {
    if (isFirstMove()) {
      return false;
    } else {
      return currentUpdateUI.move.stateAfterMove.boardWithSnakes.snakes[index].dead;
    }
  }

  export function getSnakeLoseInfo(index: number): string {
    if (isFirstMove()) {
      return '';
    } else {
      return currentUpdateUI.move.stateAfterMove.boardWithSnakes.snakes[index].loseInfo;
    }
  }

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    if (isFirstMove() || !currentUpdateUI.stateBeforeMove || reset) {
      return true;
    }
    return false;
  }

  export function shouldSlowlyDisappear(row: number, col: number): boolean {
    return false;
  }

  export function keyDown(keyCode: any): void {
    // Enter to start the game or stop the game
    if (keyCode == 13) {
      if (currentUpdateUI.end) {
        resetEverything();
      } else if (action == null) {
        action = $interval(move, GameSpeed);
      } else {
        $interval.cancel(action);
        action = null;
      }
    }

    // 'r' to restart the game
    if (keyCode == 82) {
      resetEverything();
      if (action) {
        $interval.cancel(action);
        action = null;
      }
    }

    if (ComputerOrHuman[0] == 1) {
      // up arrow
      if (keyCode == 38) {
        if (snakeOneMove == null) {
          snakeOneMove = {shiftX: -1, shiftY: 0};
        }
      }
      // down arrow
      if (keyCode == 40) {
        if (snakeOneMove == null) {
          snakeOneMove = {shiftX: 1, shiftY: 0};
        }
      }
      // left arrow
      if (keyCode == 37) {
        if (snakeOneMove == null) {
          snakeOneMove = {shiftX: 0, shiftY: -1};
        }
      }
      // right arrow
      if (keyCode == 39) {
        if (snakeOneMove == null) {
          snakeOneMove = {shiftX: 0, shiftY: 1};
        }
      }
    }
    if (ComputerOrHuman[1] == 1) {
      // w
      if (keyCode == 87) {
        if (snakeTwoMove == null) {
          snakeTwoMove = {shiftX: -1, shiftY: 0};
        }
      }
      // s
      if (keyCode == 83) {
        if (snakeTwoMove == null) {
          snakeTwoMove = {shiftX: 1, shiftY: 0};
        }
      }
      // a
      if (keyCode == 65) {
        if (snakeTwoMove == null) {
          snakeTwoMove = {shiftX: 0, shiftY: -1};
        }
      }
      // d
      if (keyCode == 68) {
        if (snakeTwoMove == null) {
          snakeTwoMove = {shiftX: 0, shiftY: 1};
        }
      }
    }
    if (currentUpdateUI.stateBeforeMove) {
      if (ComputerOrHuman[0] == 1 && snakeOneMove != null) {
        let oldDirection = currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes[0].currentDirection;
        if ((oldDirection.shiftX) == (snakeOneMove.shiftX) &&
            (oldDirection.shiftY) == (snakeOneMove.shiftY)) {
          snakeOneMove = null;
        }
      }

      if (ComputerOrHuman[1] == 1 && snakeTwoMove != null) {
        let oldDirection = currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes[1].currentDirection;
        if ((oldDirection.shiftX) == (snakeTwoMove.shiftX) &&
            (oldDirection.shiftY) == (snakeTwoMove.shiftY)) {
          snakeTwoMove = null;
        }
      }
    }
  }
}

angular.module('myApp', ['gameServices'])
  .run(function () {
    $rootScope['game'] = game;
    game.init();
  });
