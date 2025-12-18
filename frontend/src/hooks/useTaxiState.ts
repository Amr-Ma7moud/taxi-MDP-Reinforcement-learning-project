import { useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
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
  const [socket, setSocket] = useState<Socket | null>(null);
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

  // WebSocket connection effect
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to Taxi MDP server');
      setConnectionStatus('connected');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
      setInitialized(false);
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('error');
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    // Server response handlers
    newSocket.on('init_success', (data: any) => {
      const { state, agent_stats } = data;
      setGridState({
        gridSize: state.grid_size,
        taxi: { x: state.taxi.x, y: state.taxi.y },
        passenger: state.passenger ? { x: state.passenger.x, y: state.passenger.y } : null,
        destination: state.destination ? { x: state.destination.x, y: state.destination.y } : null,
        obstacles: state.obstacles.map((obs: [number, number]) => ({ x: obs[0], y: obs[1] })),
        isPassengerInTaxi: state.is_passenger_in_taxi,
      });
      setAgentParams({
        gamma: agent_stats.gamma,
        alpha: agent_stats.alpha,
        epsilon: agent_stats.epsilon,
        qTableSize: agent_stats.q_table_size,
      });
      setInitialized(true);
      setConnectionStatus('idle');
    });

    newSocket.on('step_result', (data: any) => {
      const { state, agent_stats, action, reward } = data;
      setGridState({
        gridSize: state.grid_size,
        taxi: { x: state.taxi.x, y: state.taxi.y },
        passenger: state.passenger ? { x: state.passenger.x, y: state.passenger.y } : null,
        destination: state.destination ? { x: state.destination.x, y: state.destination.y } : null,
        obstacles: state.obstacles.map((obs: [number, number]) => ({ x: obs[0], y: obs[1] })),
        isPassengerInTaxi: state.is_passenger_in_taxi,
      });
      setAgentParams({
        gamma: agent_stats.gamma,
        alpha: agent_stats.alpha,
        epsilon: agent_stats.epsilon,
        qTableSize: agent_stats.q_table_size,
      });
      setLastAction({
        action,
        reward,
        result: `Reward: ${reward}, Total: ${state.total_reward}`,
      });
    });

    newSocket.on('step_update', (data: any) => {
      const { state, agent_stats, action, reward, episode, step } = data;
      setGridState({
        gridSize: state.grid_size,
        taxi: { x: state.taxi.x, y: state.taxi.y },
        passenger: state.passenger ? { x: state.passenger.x, y: state.passenger.y } : null,
        destination: state.destination ? { x: state.destination.x, y: state.destination.y } : null,
        obstacles: state.obstacles.map((obs: [number, number]) => ({ x: obs[0], y: obs[1] })),
        isPassengerInTaxi: state.is_passenger_in_taxi,
      });
      setAgentParams({
        gamma: agent_stats.gamma,
        alpha: agent_stats.alpha,
        epsilon: agent_stats.epsilon,
        qTableSize: agent_stats.q_table_size,
      });
      setTrainingState(prev => ({
        ...prev,
        currentEpisode: episode,
        currentStep: step,
        currentReward: state.total_reward,
      }));
      setLastAction({
        action,
        reward,
        result: `Step ${step}: ${action} → ${reward}`,
      });
    });

    newSocket.on('episode_complete', (data: any) => {
      const { episode, total_reward, steps } = data;
      setEpisodeHistory(prev => [
        ...prev.slice(-99), // Keep last 100
        { episode, reward: total_reward, steps }
      ]);
    });

    newSocket.on('training_started', () => {
      setConnectionStatus('training');
    });

    newSocket.on('training_stopped', () => {
      setConnectionStatus('idle');
      setTrainingState(prev => ({ ...prev, isTraining: false }));
    });

    newSocket.on('training_complete', () => {
      setConnectionStatus('idle');
      setTrainingState(prev => ({ ...prev, isTraining: false }));
    });

    newSocket.on('reset_success', (data: any) => {
      const { state } = data;
      setGridState({
        gridSize: state.grid_size,
        taxi: { x: state.taxi.x, y: state.taxi.y },
        passenger: state.passenger ? { x: state.passenger.x, y: state.passenger.y } : null,
        destination: state.destination ? { x: state.destination.x, y: state.destination.y } : null,
        obstacles: state.obstacles.map((obs: [number, number]) => ({ x: obs[0], y: obs[1] })),
        isPassengerInTaxi: state.is_passenger_in_taxi,
      });
      setTrainingState(initialTrainingState);
      setLastAction(null);
    });

    newSocket.on('agent_configured', (data: any) => {
      const { agent_stats } = data;
      setAgentParams({
        gamma: agent_stats.gamma,
        alpha: agent_stats.alpha,
        epsilon: agent_stats.epsilon,
        qTableSize: agent_stats.q_table_size,
      });
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const initialize = useCallback((gridSize: 3 | 4, obstacles: { x: number; y: number }[]) => {
    if (!socket) return;
    const obstaclesList = obstacles.map(obs => [obs.x, obs.y]);
    socket.emit('init', { grid_size: gridSize, obstacles: obstaclesList });
  }, [socket]);

  const updateAgentParams = useCallback((params: Partial<AgentParams>) => {
    if (!socket) return;
    const socketParams: any = {};
    if (params.gamma !== undefined) socketParams.gamma = params.gamma;
    if (params.alpha !== undefined) socketParams.alpha = params.alpha;
    if (params.epsilon !== undefined) socketParams.epsilon = params.epsilon;
    socket.emit('configure_agent', socketParams);
  }, [socket]);

  const startTraining = useCallback((episodes: number) => {
    if (!socket) return;
    setTrainingState(prev => ({
      ...prev,
      isTraining: true,
      totalEpisodes: episodes,
      currentEpisode: 0,
    }));
    socket.emit('start_training', { 
      episodes, 
      speed: trainingState.speedMultiplier 
    });
  }, [socket, trainingState.speedMultiplier]);

  const stopTraining = useCallback(() => {
    if (!socket) return;
    socket.emit('stop_training');
  }, [socket]);

  const setSpeed = useCallback((speed: 1 | 10 | 100) => {
    if (!socket) return;
    setTrainingState(prev => ({ ...prev, speedMultiplier: speed }));
    socket.emit('set_speed', { speed });
  }, [socket]);

  const executeAction = useCallback((action: Action) => {
    if (!socket) return;
    // Convert frontend action names to backend action names
    const actionMap: Record<Action, string> = {
      'NORTH': 'NORTH',
      'SOUTH': 'SOUTH', 
      'EAST': 'EAST',
      'WEST': 'WEST',
      'PICKUP': 'PICK',
      'DROPOFF': 'DROP'
    };
    socket.emit('step', { action: actionMap[action] });
  }, [socket]);

  const reset = useCallback((clearQTable: boolean) => {
    if (!socket) return;
    socket.emit('reset', { reset_agent: clearQTable });
    if (clearQTable) {
      setEpisodeHistory([]);
    }
  }, [socket]);

  const toggleObstacle = useCallback((x: number, y: number) => {
    if (initialized) return; // Can't change obstacles after initialization
    
    setGridState(prev => {
      const maxObstacles = prev.gridSize === 3 ? 2 : 3;
      const existingIdx = prev.obstacles.findIndex(o => o.x === x && o.y === y);
      
      // Don't allow placing obstacle at taxi starting position (0,0)
      if (x === 0 && y === 0) return prev;
      
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
    if (initialized) return; // Can't change size after initialization
    setGridState(prev => ({
      ...prev,
      gridSize: size,
      obstacles: prev.obstacles.filter(obs => obs.x < size && obs.y < size),
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
