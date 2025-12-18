import { cn } from '@/lib/utils';

interface GridCellProps {
  x: number;
  y: number;
  isObstacle: boolean;
  isTaxi: boolean;
  isPassenger: boolean;
  isDestination: boolean;
  hasPassengerInTaxi: boolean;
  onClick?: () => void;
  editable?: boolean;
}

export function GridCell({
  x,
  y,
  isObstacle,
  isTaxi,
  isPassenger,
  isDestination,
  hasPassengerInTaxi,
  onClick,
  editable,
}: GridCellProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative w-16 h-16 border border-border flex items-center justify-center transition-all duration-200',
        isObstacle 
          ? 'bg-muted-foreground/20 pattern-brick' 
          : 'bg-card hover:bg-accent/50',
        editable && !isObstacle && 'cursor-pointer hover:ring-2 hover:ring-primary/50',
        editable && isObstacle && 'cursor-pointer'
      )}
    >
      {/* Coordinate label */}
      <span className="absolute bottom-0.5 right-0.5 text-[8px] text-muted-foreground font-mono">
        {x},{y}
      </span>

      {/* Obstacle */}
      {isObstacle && (
        <div className="text-2xl opacity-60">🧱</div>
      )}

      {/* Destination marker (show under taxi if overlapping) */}
      {isDestination && !isObstacle && (
        <div className={cn('text-2xl', isTaxi && 'absolute opacity-50')}>
          📍
        </div>
      )}

      {/* Passenger waiting */}
      {isPassenger && !isObstacle && (
        <div className={cn('text-2xl', isTaxi && 'absolute opacity-50')}>
          🧑
        </div>
      )}

      {/* Taxi */}
      {isTaxi && !isObstacle && (
        <div className={cn(
          'text-3xl transition-transform duration-300',
          hasPassengerInTaxi && 'scale-110'
        )}>
          {hasPassengerInTaxi ? '🚖' : '🚕'}
        </div>
      )}
    </div>
  );
}
