export interface Position {
  x: number;
  y: number;
}

export interface GridState {
  gridSize: 3 | 4;
  taxi: Position;
  passenger: Position | null;
  destination: Position | null;
  obstacles: Position[];
  isPassengerInTaxi: boolean;
}

export interface AgentParams {
  gamma: number;
  alpha: number;
  epsilon: number;
  qTableSize: number;
}

export interface TrainingState {
  isTraining: boolean;
  currentEpisode: number;
  totalEpisodes: number;
  currentStep: number;
  currentReward: number;
  speedMultiplier: 1 | 10 | 100;
}

export interface EpisodeStats {
  episode: number;
  reward: number;
  steps: number;
}

export interface LastAction {
  action: string;
  reward: number;
  result: string;
}

export type Action = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'PICKUP' | 'DROPOFF';

export type ConnectionStatus = 'connected' | 'disconnected' | 'training' | 'idle' | 'connecting' | 'error';
