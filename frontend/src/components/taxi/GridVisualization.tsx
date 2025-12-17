import { GridCell } from './GridCell';
import type { GridState } from '@/types/taxi';

interface GridVisualizationProps {
  gridState: GridState;
  editable?: boolean;
  onCellClick?: (x: number, y: number) => void;
}

export function GridVisualization({ gridState, editable, onCellClick }: GridVisualizationProps) {
  const { gridSize, taxi, passenger, destination, obstacles, isPassengerInTaxi } = gridState;

  const cells = [];
  
  // Render from top to bottom (y decreases) for proper visual orientation
  for (let y = gridSize - 1; y >= 0; y--) {
    for (let x = 0; x < gridSize; x++) {
      const isObstacle = obstacles.some(o => o.x === x && o.y === y);
      const isTaxi = taxi.x === x && taxi.y === y;
      const isPassengerCell = passenger && passenger.x === x && passenger.y === y && !isPassengerInTaxi;
      const isDestinationCell = destination && destination.x === x && destination.y === y;

      cells.push(
        <GridCell
          key={`${x}-${y}`}
          x={x}
          y={y}
          isObstacle={isObstacle}
          isTaxi={isTaxi}
          isPassenger={!!isPassengerCell}
          isDestination={!!isDestinationCell}
          hasPassengerInTaxi={isTaxi && isPassengerInTaxi}
          onClick={editable ? () => onCellClick?.(x, y) : undefined}
          editable={editable}
        />
      );
    }
  }

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div
        className="grid gap-1 mx-auto w-fit"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {cells}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>🚕</span> Taxi
        </div>
        <div className="flex items-center gap-1">
          <span>🚖</span> Taxi + Passenger
        </div>
        <div className="flex items-center gap-1">
          <span>🧑</span> Passenger
        </div>
        <div className="flex items-center gap-1">
          <span>📍</span> Destination
        </div>
        <div className="flex items-center gap-1">
          <span>🧱</span> Obstacle
        </div>
      </div>
    </div>
  );
}
