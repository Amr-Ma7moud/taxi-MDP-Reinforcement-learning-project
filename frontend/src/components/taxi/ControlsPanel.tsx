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
    <div className="space-y-4">
      {/* Speed Control */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Speed</CardTitle>
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
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Training</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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

      {/* Manual Controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Manual Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Direction Pad */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExecuteAction('NORTH')}
              disabled={!initialized || isTraining}
              className="w-14"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExecuteAction('WEST')}
                disabled={!initialized || isTraining}
                className="w-14"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-14" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExecuteAction('EAST')}
                disabled={!initialized || isTraining}
                className="w-14"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExecuteAction('SOUTH')}
              disabled={!initialized || isTraining}
              className="w-14"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Pickup / Drop */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExecuteAction('PICKUP')}
              disabled={!initialized || isTraining}
              className="flex-1"
            >
              <Hand className="w-4 h-4 mr-1" />
              Pick Up
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExecuteAction('DROPOFF')}
              disabled={!initialized || isTraining}
              className="flex-1"
            >
              <Package className="w-4 h-4 mr-1" />
              Drop Off
            </Button>
          </div>

          {/* Agent Decide */}
          <Button
            variant="secondary"
            onClick={() => onExecuteAction('NORTH')} // Will be 'auto' with socket
            disabled={!initialized || isTraining}
            className="w-full"
          >
            <Bot className="w-4 h-4 mr-1" />
            Let Agent Decide
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
