import { useEffect, useState } from 'react';
import {
  Direction,
  GameState,
  Position,
  createInitialGameState,
  positionsEqual,
  queueDirection,
  tickGame,
} from './game';

const TICK_MS = 160;

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  a: 'left',
  A: 'left',
  s: 'down',
  S: 'down',
  d: 'right',
  D: 'right',
};

function App() {
  const [game, setGame] = useState<GameState>(() => createInitialGameState());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const nextDirection = KEY_TO_DIRECTION[event.key];
      if (!nextDirection) {
        if (event.key === 'Enter' && game.status === 'over') {
          setGame(createInitialGameState());
        }
        return;
      }

      event.preventDefault();
      setGame((current) => queueDirection(current, nextDirection));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game.status]);

  useEffect(() => {
    if (game.status === 'over') {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setGame((current) => tickGame(current));
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [game.status]);

  const snakeCells = new Set(game.snake.map(({ x, y }) => `${x},${y}`));
  const gridCells: Position[] = [];

  for (let y = 0; y < game.height; y += 1) {
    for (let x = 0; x < game.width; x += 1) {
      gridCells.push({ x, y });
    }
  }

  const restart = () => setGame(createInitialGameState());

  const updateDirection = (direction: Direction) => {
    setGame((current) => queueDirection(current, direction));
  };

  return (
    <main className="app-shell">
      <section className="game-card" aria-label="Snake game">
        <div className="game-header">
          <div>
            <p className="eyebrow">Classic Snake</p>
            <h1>Score: {game.score}</h1>
          </div>
          <button type="button" className="restart-button" onClick={restart}>
            Restart
          </button>
        </div>

        <p className="instructions">
          Use arrow keys or WASD. On mobile, use the touch controls below.
        </p>

        <div
          className="board"
          style={{
            gridTemplateColumns: `repeat(${game.width}, minmax(0, 1fr))`,
          }}
          role="grid"
          aria-label="Snake board"
        >
          {gridCells.map((cell) => {
            const key = `${cell.x},${cell.y}`;
            const isHead = positionsEqual(cell, game.snake[0]);
            const isFood = positionsEqual(cell, game.food);
            const isSnake = snakeCells.has(key);

            const className = [
              'cell',
              isSnake ? 'cell-snake' : '',
              isHead ? 'cell-head' : '',
              isFood ? 'cell-food' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return <div key={key} className={className} aria-hidden="true" />;
          })}
        </div>

        <div className="status-row">
          <span>Status: {game.status === 'over' ? 'Game over' : 'Running'}</span>
          {game.status === 'over' ? <span>Press restart or Enter to play again.</span> : null}
        </div>

        <div className="controls" aria-label="Touch controls">
          <button type="button" className="control-button up" onClick={() => updateDirection('up')}>
            Up
          </button>
          <button
            type="button"
            className="control-button left"
            onClick={() => updateDirection('left')}
          >
            Left
          </button>
          <button
            type="button"
            className="control-button down"
            onClick={() => updateDirection('down')}
          >
            Down
          </button>
          <button
            type="button"
            className="control-button right"
            onClick={() => updateDirection('right')}
          >
            Right
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
