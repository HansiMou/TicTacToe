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
  export let currentUpdateUI: IUpdateUI = null;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let animationEndedTimeout: ng.IPromise<any> = null;
  export let state: IState = null;
  export const boardSize = gameLogic.ROWS;
  export const gameSpeed = 1000;
  export let action: any = null;
  export let snakeOneMove: Direction = null;
  export let snakeTwoMove: Direction = null;
  export let snakeThreeMove: Direction = null;
  
  
  export function init() {
    resizeGameAreaService.setWidthToHeight(1);
    moveService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 3,
      updateUI: updateUI,
      gotMessageFromPlatform: null,
    });
    action = $interval(move, 500);
  }

  export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;
    clearAnimationTimeout();
    state = params.move.stateAfterMove;
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
      if (isMyTurn()) makeMove(gameLogic.createInitialMove());
    } else {
      // We calculate the AI move only after the animation finishes,
      // because if we call aiService now
      // then the animation will be paused until the javascript finishes.
      animationEndedTimeout = $timeout(animationEndedCallback, 500);
    }
  }

  function animationEndedCallback() {
    log.info("Animation ended");
    maybeSendComputerMove();
  }

  function clearAnimationTimeout() {
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }

  function maybeSendComputerMove() {
    // if (!isComputerTurn()) return;
    // let move = aiService.findComputerMove(currentUpdateUI.move);
    // log.info("Computer move: ", move);
    // makeMove(move);
  }

  function makeMove(move: IMove) {
    if (didMakeMove) { // Only one move per updateUI
      return;
    }
    didMakeMove = true;
    moveService.makeMove(move);
  }

  function isFirstMove() {
    return !currentUpdateUI.move.stateAfterMove;
  }

  function yourPlayerIndex() {
    return currentUpdateUI.yourPlayerIndex;
  }

  function isComputer() {
    return currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex].playerId === '';
  }

  function isComputerTurn() {
    return isMyTurn() && isComputer();
  }

  function isHumanTurn() {
    return isMyTurn() && !isComputer();
  }

  function isMyTurn() {
    return !didMakeMove && // you can only make one move per updateUI.
      currentUpdateUI.move.turnIndexAfterMove >= 0 && // game is ongoing
      currentUpdateUI.yourPlayerIndex === currentUpdateUI.move.turnIndexAfterMove; // it's my turn
  }

  export function move(): void {
    if (!isHumanTurn()) return;
    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    let nextMove: IMove = null;
    try {
      nextMove = gameLogic.createMove(
          state, [angular.copy(snakeOneMove), angular.copy(snakeTwoMove)], 100000, currentUpdateUI.move.turnIndexAfterMove);
      snakeOneMove = null;
      snakeTwoMove = null;
      snakeThreeMove = null;
    } catch (e) {
      $interval.cancel(action);
      log.error(e);
      return;
    }
    // Move is legal, make it!
    makeMove(nextMove);
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

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    return state.delta &&
        state.delta.row === row && state.delta.col === col;
  }

  export function getNumber(): number[] {
    let res: number[] = [];
    for (let i = 0; i < gameLogic.ROWS; i++) {
      res.push(i);
    }
    return res;
  }

  export function keyDown(keyCode: any): void {
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
    // y
    if (keyCode == 89) {
      if (snakeThreeMove == null) {
        snakeThreeMove = {shiftX: -1, shiftY: 0};
      }
    }
    // h
    if (keyCode == 72) {
      if (snakeThreeMove == null) {
        snakeThreeMove = {shiftX: 1, shiftY: 0};
      }
    }
    // g
    if (keyCode == 71) {
      if (snakeThreeMove == null) {
        snakeThreeMove = {shiftX: 0, shiftY: -1};
      }
    }
    // j
    if (keyCode == 74) {
      if (snakeThreeMove == null) {
        snakeThreeMove = {shiftX: 0, shiftY: 1};
      }
    }
    if (snakeOneMove != null) {
      let oldDirection = currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes[0].currentDirection;
      if ((oldDirection.shiftX) == (snakeOneMove.shiftX) &&
        (oldDirection.shiftY) == (snakeOneMove.shiftY)) {
        snakeOneMove = null;
      }
    }
    if (snakeTwoMove != null) {
      let oldDirection = currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes[1].currentDirection;
      if ((oldDirection.shiftX) == (snakeTwoMove.shiftX) &&
          (oldDirection.shiftY) == (snakeTwoMove.shiftY)) {
        snakeTwoMove = null;
      }
    }
    if (snakeThreeMove != null && currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes.length == 3) {
      let oldDirection = currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes[2].currentDirection;
      if ((oldDirection.shiftX) == (snakeThreeMove.shiftX) &&
          (oldDirection.shiftY) == (snakeThreeMove.shiftY)) {
        snakeThreeMove = null;
      }
    }
  }
}

angular.module('myApp', ['gameServices'])
  .run(function () {
    $rootScope['game'] = game;
    game.init();
  });
