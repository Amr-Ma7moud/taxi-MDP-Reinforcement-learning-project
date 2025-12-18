import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Play, Square, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Hand, Package, Bot } from 'lucide-react';
import type { TrainingState, Action } from '@/types/taxi';
import { useState } from 'react';

interface ControlsPanelProps {
  trainingState: TrainingState;
  initialized: boolean;
  onStartTraining: (episodes: number) => void;
  onStopTraining: () => void;
  onSetSpeed: (speed: 1 | 10 | 100) => void;
  onExecuteAction: (action: Action) => void;
  onReset: (clearQTable: boolean) => void;
}

export function ControlsPanel({
  trainingState,
  initialized,
  onStartTraining,
  onStopTraining,
  onSetSpeed,
  onExecuteAction,
  onReset,
}: ControlsPanelProps) {
  const [episodes, setEpisodes] = useState(1000);
  const [clearQTable, setClearQTable] = useState(false);

  const { isTraining, speedMultiplier } = trainingState;

  return (
    <div className="space-y-3">
      {/* Speed Control */}
      <Card>
        <CardHeader className="pb-1 py-2">
          <CardTitle className="text-xs font-medium">Speed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {([1, 10, 100] as const).map((speed) => (
              <Button
                key={speed}
                variant={speedMultiplier === speed ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSetSpeed(speed)}
                className="flex-1"
              >
                {speed}x
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Controls */}
      <Card>
        <CardHeader className="pb-1 py-2">
          <CardTitle className="text-xs font-medium">Training</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 py-2">
          <div className="space-y-1">
            <Label htmlFor="episodes" className="text-xs text-muted-foreground">
              Episodes (0 = infinite)
            </Label>
            <Input
              id="episodes"
              type="number"
              min={0}
              value={episodes}
              onChange={(e) => setEpisodes(parseInt(e.target.value) || 0)}
              disabled={isTraining}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => onStartTraining(episodes)}
              disabled={!initialized || isTraining}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
            <Button
              variant="outline"
              onClick={onStopTraining}
              disabled={!isTraining}
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onReset(clearQTable)}
              disabled={isTraining}
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <div className="flex items-center gap-2">
              <Checkbox
                id="clearQTable"
                checked={clearQTable}
                onCheckedChange={(checked) => setClearQTable(!!checked)}
                disabled={isTraining}
              />
              <Label htmlFor="clearQTable" className="text-xs text-muted-foreground">
                Clear Q-Table
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
