import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { AgentParams } from '@/types/taxi';

interface ConfigurationPanelProps {
  gridSize: 3 | 4;
  obstacleCount: number;
  agentParams: AgentParams;
  initialized: boolean;
  onGridSizeChange: (size: 3 | 4) => void;
  onInitialize: () => void;
  onAgentParamsChange: (params: Partial<AgentParams>) => void;
}

export function ConfigurationPanel({
  gridSize,
  obstacleCount,
  agentParams,
  initialized,
  onGridSizeChange,
  onInitialize,
  onAgentParamsChange,
}: ConfigurationPanelProps) {
  const maxObstacles = gridSize === 3 ? 2 : 3;

  return (
    <div className="space-y-3">
      {/* Environment Config */}
      <Card>
        <CardHeader className="pb-1 py-2">
          <CardTitle className="text-xs font-medium">Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 py-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Grid Size</Label>
            <RadioGroup
              value={String(gridSize)}
              onValueChange={(v) => onGridSizeChange(Number(v) as 3 | 4)}
              className="flex gap-4"
              disabled={initialized}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="grid-3" />
                <Label htmlFor="grid-3">3×3</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="grid-4" />
                <Label htmlFor="grid-4">4×4</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Obstacles (click grid to toggle)
            </Label>
            <p className="text-xs font-medium">
              {obstacleCount} / {maxObstacles} max
            </p>
          </div>

          <Button
            onClick={onInitialize}
            disabled={initialized}
            className="w-full"
            size="sm"
          >
            🔄 Initialize
          </Button>
          
          {initialized && (
            <p className="text-xs text-muted-foreground text-center">
              Environment initialized. Reset to change configuration.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Agent Parameters */}
      <Card>
        <CardHeader className="pb-1 py-2">
          <CardTitle className="text-xs font-medium">Agent Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 py-2">
          {/* Gamma */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label className="text-xs text-muted-foreground">
                Gamma (γ)
              </Label>
              <span className="text-xs font-mono">{agentParams.gamma?.toFixed(2) ?? '0.00'}</span>
            </div>
            <Slider
              value={[agentParams.gamma ?? 0.9]}
              onValueChange={([v]) => onAgentParamsChange({ gamma: v })}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          {/* Alpha */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label className="text-xs text-muted-foreground">
                Alpha (α)
              </Label>
              <span className="text-xs font-mono">{agentParams.alpha?.toFixed(2) ?? '0.00'}</span>
            </div>
            <Slider
              value={[agentParams.alpha ?? 0.1]}
              onValueChange={([v]) => onAgentParamsChange({ alpha: v })}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          {/* Epsilon */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label className="text-xs text-muted-foreground">
                Epsilon (ε)
              </Label>
              <span className="text-xs font-mono">{agentParams.epsilon?.toFixed(2) ?? '0.00'}</span>
            </div>
            <Slider
              value={[agentParams.epsilon ?? 0.1]}
              onValueChange={([v]) => onAgentParamsChange({ epsilon: v })}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
