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
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Taxi MDP Reinforcement Learning
        </h1>
        <p className="text-muted-foreground mt-1">
          Q-Learning agent learning to pick up and drop off passengers
        </p>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid Visualization - Takes up more space */}
        <div className="lg:col-span-2">
          <GridVisualization
            gridState={gridState}
            editable={!initialized}
            onCellClick={toggleObstacle}
          />
        </div>

        {/* Right Panel - Stats & Controls */}
        <div className="space-y-6">
          <StatisticsPanel
            connectionStatus={connectionStatus}
            trainingState={trainingState}
            agentParams={agentParams}
            lastAction={lastAction}
            avgReward={avgReward}
            avgSteps={avgSteps}
            episodeHistory={episodeHistory}
          />
          
          <ControlsPanel
            trainingState={trainingState}
            initialized={initialized}
            onStartTraining={startTraining}
            onStopTraining={stopTraining}
            onSetSpeed={setSpeed}
            onExecuteAction={executeAction}
            onReset={reset}
          />
        </div>
      </div>

      {/* Configuration Panel - Bottom */}
      <div className="mt-6">
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
  );
};

export default Index;
