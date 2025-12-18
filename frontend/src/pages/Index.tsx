import { useTaxiState } from '@/hooks/useTaxiState';
import { GridVisualization } from '@/components/taxi/GridVisualization';
import { StatisticsPanel } from '@/components/taxi/StatisticsPanel';
import { ControlsPanel } from '@/components/taxi/ControlsPanel';
import { ConfigurationPanel } from '@/components/taxi/ConfigurationPanel';

const Index = () => {
  const {
    connectionStatus,
    gridState,
    agentParams,
    trainingState,
    episodeHistory,
    lastAction,
    initialized,
    avgReward,
    avgSteps,
    initialize,
    updateAgentParams,
    startTraining,
    stopTraining,
    setSpeed,
    executeAction,
    reset,
    toggleObstacle,
    setGridSize,
  } = useTaxiState();

  const handleInitialize = () => {
    initialize(gridState.gridSize, gridState.obstacles);
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      {/* Header */}
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Taxi MDP Reinforcement Learning
            </h1>
            <p className="text-muted-foreground text-sm">
              Q-Learning agent learning to pick up and drop off passengers
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500' :
              connectionStatus === 'training' ? 'bg-blue-500' :
              connectionStatus === 'idle' ? 'bg-green-400' :
              'bg-red-500'
            }`} />
            <span className="capitalize text-muted-foreground">
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               connectionStatus === 'training' ? 'Training' :
               connectionStatus === 'idle' ? 'Ready' :
               connectionStatus === 'error' ? 'Error' :
               'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Connection Error Alert */}
      {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <h3 className="text-red-800 font-medium text-sm">Backend Server Not Available</h3>
          <p className="text-red-600 text-xs mt-1">
            Please start: <code className="bg-red-100 text-red-800 px-1 rounded">cd backend && python app.py</code>
          </p>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 xl:gap-6 max-h-[calc(100vh-120px)]">
        {/* Grid Visualization */}
        <div className="xl:col-span-2">
          <GridVisualization
            gridState={gridState}
            editable={!initialized}
            onCellClick={toggleObstacle}
          />
        </div>

        {/* Statistics Panel */}
        <div className="xl:max-h-full xl:overflow-y-auto">
          <StatisticsPanel
            connectionStatus={connectionStatus}
            trainingState={trainingState}
            agentParams={agentParams}
            lastAction={lastAction}
            avgReward={avgReward}
            avgSteps={avgSteps}
            episodeHistory={episodeHistory}
          />
        </div>

        {/* Controls & Configuration Panel */}
        <div className="space-y-4 xl:max-h-full xl:overflow-y-auto">
          <ControlsPanel
            trainingState={trainingState}
            initialized={initialized}
            onStartTraining={startTraining}
            onStopTraining={stopTraining}
            onSetSpeed={setSpeed}
            onExecuteAction={executeAction}
            onReset={reset}
          />
          
          <ConfigurationPanel
            gridSize={gridState.gridSize}
            obstacleCount={gridState.obstacles.length}
            agentParams={agentParams}
            initialized={initialized}
            onGridSizeChange={setGridSize}
            onInitialize={handleInitialize}
            onAgentParamsChange={updateAgentParams}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
