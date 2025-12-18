import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrainingState, AgentParams, LastAction, EpisodeStats, ConnectionStatus } from '@/types/taxi';

interface StatisticsPanelProps {
  connectionStatus: ConnectionStatus;
  trainingState: TrainingState;
  agentParams: AgentParams;
  lastAction: LastAction | null;
  avgReward: number;
  avgSteps: number;
  episodeHistory: EpisodeStats[];
}

function StatusDot({ status }: { status: ConnectionStatus }) {
  const colors = {
    connected: 'bg-yellow-500',
    disconnected: 'bg-destructive',
    training: 'bg-green-500',
    idle: 'bg-yellow-500',
  };

  const labels = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    training: 'Training',
    idle: 'Idle',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />
      <span className="text-sm">{labels[status]}</span>
    </div>
  );
}

export function StatisticsPanel({
  connectionStatus,
  trainingState,
  agentParams,
  lastAction,
  avgReward,
  avgSteps,
  episodeHistory,
}: StatisticsPanelProps) {
  return (
    <div className="space-y-3">
      {/* Current Episode */}
      <Card>
        <CardHeader className="pb-1 py-2">
          <CardTitle className="text-xs font-medium flex items-center justify-between">
            Current Episode
            <StatusDot status={connectionStatus} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs py-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Episode:</span>
            <span className="font-mono text-xs">
              {trainingState.currentEpisode} / {trainingState.totalEpisodes || '∞'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Step:</span>
            <span className="font-mono text-xs">{trainingState.currentStep}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reward:</span>
            <span className={`font-mono text-xs ${trainingState.currentReward >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {trainingState.currentReward >= 0 ? '+' : ''}{trainingState.currentReward}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Learning Progress */}
      <Card>
        <CardHeader className="pb-1 py-2">
          <CardTitle className="text-xs font-medium">Learning Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs py-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Q-Table Size:</span>
            <span className="font-mono text-xs">{agentParams.qTableSize.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Reward (100):</span>
            <span className={`font-mono text-xs ${avgReward >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {avgReward >= 0 ? '+' : ''}{avgReward.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Steps (100):</span>
            <span className="font-mono text-xs">{avgSteps.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Episodes Done:</span>
            <span className="font-mono text-xs">{episodeHistory.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Last Action */}
      <Card>
        <CardHeader className="pb-1 py-2">
          <CardTitle className="text-xs font-medium">Last Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs py-2">
          {lastAction ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Action:</span>
                <span className="font-mono font-semibold text-xs">{lastAction.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reward:</span>
                <span className={`font-mono text-xs ${lastAction.reward >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {lastAction.reward >= 0 ? '+' : ''}{lastAction.reward}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Result:</span>
                <span className="font-mono text-[10px]">{lastAction.result}</span>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground italic text-xs">No action yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
