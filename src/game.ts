export type Position = {
  x: number;
  y: number;
};

export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameStatus = 'ready' | 'running' | 'over';

export type GameState = {
  snake: Position[];
  direction: Direction;
  pendingDirection: Direction;
  food: Position;
  score: number;
  status: GameStatus;
  width: number;
  height: number;
};

export const BOARD_WIDTH = 16;
export const BOARD_HEIGHT = 16;
export const INITIAL_DIRECTION: Direction = 'right';
export const INITIAL_SNAKE: Position[] = [
  { x: 4, y: 8 },
  { x: 3, y: 8 },
  { x: 2, y: 8 },
];

const DELTAS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function isInsideBoard(position: Position, width: number, height: number): boolean {
  return position.x >= 0 && position.x < width && position.y >= 0 && position.y < height;
}

export function getNextHead(position: Position, direction: Direction): Position {
  const delta = DELTAS[direction];
  return {
    x: position.x + delta.x,
    y: position.y + delta.y,
  };
}

export function isOppositeDirection(current: Direction, next: Direction): boolean {
  return OPPOSITES[current] === next;
}

export function getAvailableFoodPositions(
  snake: Position[],
  width: number,
  height: number,
): Position[] {
  const snakeCells = new Set(snake.map(({ x, y }) => `${x},${y}`));
  const available: Position[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const key = `${x},${y}`;
      if (!snakeCells.has(key)) {
        available.push({ x, y });
      }
    }
  }

  return available;
}

export function placeFood(
  snake: Position[],
  width: number,
  height: number,
  randomIndex = Math.random,
): Position {
  const available = getAvailableFoodPositions(snake, width, height);

  if (available.length === 0) {
    return snake[0];
  }

  const index = Math.min(
    available.length - 1,
    Math.floor(randomIndex() * available.length),
  );

  return available[index];
}

export function createInitialGameState(
  width = BOARD_WIDTH,
  height = BOARD_HEIGHT,
  randomIndex = Math.random,
): GameState {
  const snake = INITIAL_SNAKE.map((segment) => ({ ...segment }));

  return {
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: placeFood(snake, width, height, randomIndex),
    score: 0,
    status: 'ready',
    width,
    height,
  };
}

export function queueDirection(state: GameState, nextDirection: Direction): GameState {
  if (isOppositeDirection(state.direction, nextDirection)) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
  };
}

export function tickGame(state: GameState, randomIndex = Math.random): GameState {
  if (state.status === 'over') {
    return state;
  }

  const direction = isOppositeDirection(state.direction, state.pendingDirection)
    ? state.direction
    : state.pendingDirection;
  const nextHead = getNextHead(state.snake[0], direction);

  if (!isInsideBoard(nextHead, state.width, state.height)) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      status: 'over',
    };
  }

  const ateFood = positionsEqual(nextHead, state.food);
  const nextSnake = [nextHead, ...state.snake];

  if (!ateFood) {
    nextSnake.pop();
  }

  const collidedWithSelf = nextSnake
    .slice(1)
    .some((segment) => positionsEqual(segment, nextHead));

  if (collidedWithSelf) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      status: 'over',
    };
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: ateFood ? placeFood(nextSnake, state.width, state.height, randomIndex) : state.food,
    score: ateFood ? state.score + 1 : state.score,
    status: 'running',
  };
}
