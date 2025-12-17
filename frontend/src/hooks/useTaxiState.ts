import { useState, useCallback } from 'react';
import type { GridState, AgentParams, TrainingState, EpisodeStats, LastAction, Action, ConnectionStatus } from '@/types/taxi';

const initialGridState: GridState = {
  gridSize: 4,
  taxi: { x: 0, y: 0 },
  passenger: { x: 3, y: 3 },
  destination: { x: 0, y: 3 },
  obstacles: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
  isPassengerInTaxi: false,
};

const initialAgentParams: AgentParams = {
  gamma: 0.9,
  alpha: 0.1,
  epsilon: 0.1,
  qTableSize: 0,
};

const initialTrainingState: TrainingState = {
  isTraining: false,
  currentEpisode: 0,
  totalEpisodes: 1000,
  currentStep: 0,
  currentReward: 0,
  speedMultiplier: 1,
};

export function useTaxiState() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [gridState, setGridState] = useState<GridState>(initialGridState);
  const [agentParams, setAgentParams] = useState<AgentParams>(initialAgentParams);
  const [trainingState, setTrainingState] = useState<TrainingState>(initialTrainingState);
  const [episodeHistory, setEpisodeHistory] = useState<EpisodeStats[]>([]);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Calculate averages
  const avgReward = episodeHistory.length > 0
    ? episodeHistory.slice(-100).reduce((sum, e) => sum + e.reward, 0) / Math.min(episodeHistory.length, 100)
    : 0;
  
  const avgSteps = episodeHistory.length > 0
    ? episodeHistory.slice(-100).reduce((sum, e) => sum + e.steps, 0) / Math.min(episodeHistory.length, 100)
    : 0;

  const initialize = useCallback((gridSize: 3 | 4, obstacles: { x: number; y: number }[]) => {
    setGridState(prev => ({
      ...prev,
      gridSize,
      obstacles,
      taxi: { x: 0, y: 0 },
      passenger: { x: gridSize - 1, y: gridSize - 1 },
      destination: { x: 0, y: gridSize - 1 },
      isPassengerInTaxi: false,
    }));
    setInitialized(true);
    setConnectionStatus('idle');
  }, []);

  const updateAgentParams = useCallback((params: Partial<AgentParams>) => {
    setAgentParams(prev => ({ ...prev, ...params }));
  }, []);

  const startTraining = useCallback((episodes: number) => {
    setTrainingState(prev => ({
      ...prev,
      isTraining: true,
      totalEpisodes: episodes,
      currentEpisode: 0,
    }));
    setConnectionStatus('training');
  }, []);

  const stopTraining = useCallback(() => {
    setTrainingState(prev => ({ ...prev, isTraining: false }));
    setConnectionStatus('idle');
  }, []);

  const setSpeed = useCallback((speed: 1 | 10 | 100) => {
    setTrainingState(prev => ({ ...prev, speedMultiplier: speed }));
  }, []);

  const executeAction = useCallback((action: Action) => {
    // Placeholder - will be replaced with socket emit
    setLastAction({
      action,
      reward: -1,
      result: `Executed ${action}`,
    });
  }, []);

  const reset = useCallback((clearQTable: boolean) => {
    setGridState(prev => ({
      ...prev,
      taxi: { x: 0, y: 0 },
      passenger: { x: prev.gridSize - 1, y: prev.gridSize - 1 },
      destination: { x: 0, y: prev.gridSize - 1 },
      isPassengerInTaxi: false,
    }));
    setTrainingState(initialTrainingState);
    setLastAction(null);
    if (clearQTable) {
      setEpisodeHistory([]);
      setAgentParams(prev => ({ ...prev, qTableSize: 0 }));
    }
  }, []);

  const toggleObstacle = useCallback((x: number, y: number) => {
    if (initialized) return;
    
    setGridState(prev => {
      const maxObstacles = prev.gridSize === 3 ? 2 : 3;
      const existingIdx = prev.obstacles.findIndex(o => o.x === x && o.y === y);
      
      if (existingIdx >= 0) {
        return {
          ...prev,
          obstacles: prev.obstacles.filter((_, i) => i !== existingIdx),
        };
      } else if (prev.obstacles.length < maxObstacles) {
        return {
          ...prev,
          obstacles: [...prev.obstacles, { x, y }],
        };
      }
      return prev;
    });
  }, [initialized]);

  const setGridSize = useCallback((size: 3 | 4) => {
    if (initialized) return;
    setGridState(prev => ({
      ...prev,
      gridSize: size,
      obstacles: [],
    }));
  }, [initialized]);

  return {
    // State
    connectionStatus,
    gridState,
    agentParams,
    trainingState,
    episodeHistory,
    lastAction,
    initialized,
    avgReward,
    avgSteps,
    
    // Actions
    initialize,
    updateAgentParams,
    startTraining,
    stopTraining,
    setSpeed,
    executeAction,
    reset,
    toggleObstacle,
    setGridSize,
  };
}
