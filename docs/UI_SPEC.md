# Taxi MDP Frontend UI Specification

Design specification for the Taxi MDP Reinforcement Learning visualization interface.

---

## Overview

The UI visualizes a Q-learning agent learning to drive a taxi in a grid world. The agent must pick up passengers and drop them at destinations while avoiding obstacles.

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HEADER / TITLE                              │
├───────────────────────────────┬─────────────────────────────────────┤
│                               │                                     │
│                               │         STATISTICS PANEL            │
│       GRID VISUALIZATION      │                                     │
│                               ├─────────────────────────────────────┤
│                               │                                     │
│                               │         CONTROLS PANEL              │
│                               │                                     │
├───────────────────────────────┴─────────────────────────────────────┤
│                         CONFIGURATION PANEL                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Grid Visualization

The main visual component showing the taxi world.

#### Grid Layout
- **Size:** Either 3×3 or 4×4 cells
- **Cell Size:** Large enough to clearly see icons (e.g., 80-100px)
- **Coordinate System:** Origin (0,0) at bottom-left corner
  - X increases going right
  - Y increases going up

#### Cell Types & Visual Elements

| Element | Icon/Color | Description |
|---------|------------|-------------|
| Empty Cell | Light gray background | Navigable space |
| Obstacle | Dark gray/black, brick pattern | Impassable cell |
| Taxi (empty) | 🚕 Yellow car icon | Taxi without passenger |
| Taxi (with passenger) | 🚖 Green car icon | Taxi carrying passenger |
| Passenger | 🧑 Person icon | Waiting passenger location |
| Destination | 📍 Red pin / Flag | Dropoff location |

#### Visual States

1. **No Passenger Spawned:**
   - Only show taxi
   - Passenger and destination icons hidden

2. **Passenger Waiting:**
   - Show taxi at its position
   - Show passenger icon at passenger location
   - Show destination icon

3. **Passenger in Taxi:**
   - Show taxi with "occupied" indicator (green color)
   - Hide passenger icon (they're in the taxi)
   - Keep destination visible

4. **Successful Dropoff:**
   - Brief celebration animation (confetti, flash)
   - Reset to new episode state

#### Animation Suggestions
- Smooth taxi movement between cells (200-300ms transition)
- Pickup animation (passenger "jumps" into taxi)
- Dropoff animation (passenger "exits" at destination)
- Obstacle bump animation (shake) on failed movement

---

### 2. Statistics Panel

Real-time training statistics display.

#### Episode Information
```
┌─────────────────────────────┐
│ CURRENT EPISODE             │
│ ══════════════════════════  │
│ Episode:     150 / 1000     │
│ Step:        23             │
│ Reward:      -8             │
│ Status:      ● Training     │
└─────────────────────────────┘
```

#### Learning Progress
```
┌─────────────────────────────┐
│ LEARNING PROGRESS           │
│ ══════════════════════════  │
│ Q-Table Size:    1,250      │
│ Avg Reward:      +3.5       │
│ Avg Steps:       25.3       │
│ Episodes Done:   149        │
└─────────────────────────────┘
```

#### Charts (Optional but Recommended)

1. **Reward Chart**
   - Line graph showing reward per episode
   - Rolling average line (last 100 episodes)
   - X-axis: Episode number
   - Y-axis: Total reward

2. **Steps Chart**
   - Line graph showing steps per episode
   - Should decrease as agent learns
   - X-axis: Episode number
   - Y-axis: Steps taken

#### Last Action Display
```
┌─────────────────────────────┐
│ LAST ACTION                 │
│ ══════════════════════════  │
│ Action:   EAST              │
│ Reward:   -1                │
│ Result:   Moved to (2, 1)   │
└─────────────────────────────┘
```

---

### 3. Controls Panel

Training and manual control buttons.

#### Speed Control
```
┌─────────────────────────────────────────┐
│ SPEED                                   │
│ ┌───────┐ ┌────────┐ ┌─────────┐        │
│ │  1x   │ │  10x   │ │  100x   │        │
│ └───────┘ └────────┘ └─────────┘        │
│     ○         ●          ○              │
└─────────────────────────────────────────┘
```

- Radio button group (only one active)
- Active speed should be highlighted
- Can change speed during training

#### Training Controls
```
┌─────────────────────────────────────────┐
│ TRAINING                                │
│                                         │
│ Episodes: [________1000________]        │
│           (0 = infinite)                │
│                                         │
│ ┌──────────────┐  ┌──────────────┐      │
│ │ ▶ START      │  │ ⏹ STOP       │      │
│ └──────────────┘  └──────────────┘      │
│                                         │
│ ┌──────────────┐                        │
│ │ 🔄 RESET     │  ☐ Clear Q-Table       │
│ └──────────────┘                        │
└─────────────────────────────────────────┘
```

- **Start:** Begins automated training
- **Stop:** Stops training (disabled when not training)
- **Reset:** Resets episode, optionally clears Q-table
- **Episodes Input:** Number field (0 = train forever)

#### Manual Controls (When Not Training)
```
┌─────────────────────────────────────────┐
│ MANUAL CONTROL                          │
│                                         │
│         ┌───────┐                       │
│         │   ▲   │                       │
│         │ NORTH │                       │
│         └───────┘                       │
│ ┌───────┐       ┌───────┐               │
│ │   ◀   │       │   ▶   │               │
│ │ WEST  │       │ EAST  │               │
│ └───────┘       └───────┘               │
│         ┌───────┐                       │
│         │   ▼   │                       │
│         │ SOUTH │                       │
│         └───────┘                       │
│                                         │
│ ┌──────────────┐  ┌──────────────┐      │
│ │ 🖐 PICK UP   │  │ 📤 DROP OFF  │      │
│ └──────────────┘  └──────────────┘      │
│                                         │
│ ┌──────────────────────────────────┐    │
│ │ 🤖 LET AGENT DECIDE (Auto Step)  │    │
│ └──────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

- Directional pad for movement
- PICK/DROP buttons
- "Let Agent Decide" executes one agent-chosen action
- **Disabled during training**

---

### 4. Configuration Panel

Environment and agent setup.

#### Environment Config
```
┌─────────────────────────────────────────┐
│ ENVIRONMENT                             │
│                                         │
│ Grid Size:  ○ 3×3    ● 4×4              │
│                                         │
│ Obstacles (click grid to toggle):       │
│ Current: 2 / 3 max                      │
│                                         │
│ ┌──────────────────┐                    │
│ │ 🔄 INITIALIZE    │                    │
│ └──────────────────┘                    │
└─────────────────────────────────────────┘
```

- Grid size toggle (3 or 4)
- Obstacle count indicator
- Allow clicking grid cells to toggle obstacles (before init)
- Initialize button creates the environment

#### Agent Config
```
┌─────────────────────────────────────────┐
│ AGENT PARAMETERS                        │
│                                         │
│ Gamma (γ) - Discount Factor:            │
│ ├──────────────●───────┤ 0.90           │
│ 0.0                    1.0              │
│                                         │
│ Alpha (α) - Learning Rate:              │
│ ├────●─────────────────┤ 0.10           │
│ 0.0                    1.0              │
│                                         │
│ Epsilon (ε) - Exploration:              │
│ ├────●─────────────────┤ 0.10           │
│ 0.0                    1.0              │
│                                         │
│ ┌──────────────────┐                    │
│ │ 💾 APPLY         │                    │
│ └──────────────────┘                    │
└─────────────────────────────────────────┘
```

- Sliders for each parameter
- Real-time value display
- Apply button sends changes to server
- Can modify during training

---

## User Flows

### Flow 1: Initial Setup

```
1. User opens application
   └─→ Connect to WebSocket server
       └─→ On connected, enable configuration panel

2. User selects grid size (3×3 or 4×4)
   └─→ Update max obstacles display (2 or 3)

3. User optionally clicks grid cells to place obstacles
   └─→ Validate: max obstacles, ensure all cells reachable

4. User clicks "Initialize"
   └─→ emit('init', {grid_size, obstacles})
   └─→ On 'init_success':
       ├─→ Render grid with initial state
       ├─→ Enable controls
       └─→ Display agent stats
```

### Flow 2: Manual Mode

```
1. User clicks direction button (e.g., NORTH)
   └─→ emit('step', {action: 'NORTH'})

2. On 'step_result':
   ├─→ Update grid (animate taxi movement)
   ├─→ Show reward feedback (+1, -5, etc.)
   ├─→ Update statistics
   └─→ If reward == 10, show success animation

3. Or user clicks "Let Agent Decide"
   └─→ emit('step', {action: 'auto'})
   └─→ Same handling as above
```

### Flow 3: Training Mode

```
1. User sets episodes (e.g., 1000) and speed (e.g., 10x)
2. User clicks "Start Training"
   └─→ emit('start_training', {episodes: 1000, speed: 10})
   └─→ Disable manual controls
   └─→ Enable stop button

3. On 'step_update' (continuous):
   ├─→ Update grid visualization
   ├─→ Update step counter
   └─→ Update current reward

4. On 'episode_complete':
   ├─→ Log episode to chart
   ├─→ Update averages
   └─→ Reset grid for next episode

5. User can:
   ├─→ Click speed buttons to change speed
   │   └─→ emit('set_speed', {speed: 100})
   └─→ Click "Stop" to halt training
       └─→ emit('stop_training')

6. On 'training_complete':
   └─→ Re-enable manual controls
   └─→ Show training summary
```

### Flow 4: Reset

```
1. User clicks "Reset"
2. If "Clear Q-Table" checkbox is checked:
   └─→ emit('reset', {reset_agent: true})
   Otherwise:
   └─→ emit('reset', {reset_agent: false})

3. On 'reset_success':
   ├─→ Reset grid to initial state
   ├─→ Clear episode stats (optionally keep Q-table)
   └─→ Update displays
```

---

## State Management

### Frontend State

```javascript
const state = {
  // Connection
  connected: false,
  
  // Environment
  gridSize: 4,
  obstacles: [],
  initialized: false,
  
  // Grid State (from server)
  taxi: { x: 0, y: 0 },
  passenger: null,        // or {x, y}
  destination: null,      // or {x, y}
  isPassengerInTaxi: false,
  
  // Training
  isTraining: false,
  currentEpisode: 0,
  totalEpisodes: 0,
  currentStep: 0,
  currentReward: 0,
  speedMultiplier: 1,
  
  // Agent
  agentParams: {
    gamma: 0.9,
    alpha: 0.1,
    epsilon: 0.1,
    qTableSize: 0
  },
  
  // History (for charts)
  rewardHistory: [],
  stepHistory: []
};
```

### Event Listeners Setup

```javascript
// Connection
socket.on('connected', handleConnected);
socket.on('disconnect', handleDisconnect);
socket.on('error', handleError);

// Initialization
socket.on('init_success', handleInitSuccess);
socket.on('agent_configured', handleAgentConfigured);

// Training
socket.on('training_started', handleTrainingStarted);
socket.on('step_update', handleStepUpdate);
socket.on('episode_start', handleEpisodeStart);
socket.on('episode_complete', handleEpisodeComplete);
socket.on('training_stopped', handleTrainingStopped);
socket.on('training_complete', handleTrainingComplete);

// Manual
socket.on('step_result', handleStepResult);

// State
socket.on('current_state', handleCurrentState);
socket.on('reset_success', handleResetSuccess);
socket.on('speed_changed', handleSpeedChanged);

// Q-values (optional)
socket.on('q_values', handleQValues);
```

---

## Visual Feedback

### Success Indicators
- ✅ Green flash on successful pickup
- 🎉 Celebration animation on successful dropoff (+10 reward)
- 📈 Upward arrow when average reward increases

### Error Indicators
- ❌ Red flash on failed action (-5 reward)
- 🚫 Shake animation when hitting wall/obstacle
- 📉 Downward arrow when average reward decreases

### Status Indicators
- 🟢 Green dot: Connected & Training
- 🟡 Yellow dot: Connected & Idle
- 🔴 Red dot: Disconnected
- 🔵 Blue dot: Manual mode

---

## Responsive Design

### Desktop (1200px+)
- Full layout as shown above
- Side-by-side grid and panels

### Tablet (768px - 1199px)
- Grid above, panels below
- Two columns for panels

### Mobile (< 768px)
- Single column layout
- Collapsible panels
- Simplified controls (buttons only, no sliders)

---

## Accessibility

1. **Keyboard Navigation:**
   - Arrow keys for manual movement
   - P for pickup, D for drop
   - Space to toggle training
   - 1/2/3 for speed selection

2. **Screen Readers:**
   - Announce state changes
   - Describe grid layout
   - Report rewards and actions

3. **Color Blindness:**
   - Don't rely on color alone
   - Use icons and patterns
   - Provide high contrast option

---

## Technology Recommendations

### Framework Options
- **React** + Socket.IO client
- **Vue.js** + Socket.IO client
- **Svelte** + Socket.IO client
- Vanilla JS (if simple implementation needed)

### Charting Libraries
- Chart.js (simple, lightweight)
- Recharts (React-friendly)
- D3.js (advanced customization)

### Styling
- Tailwind CSS (utility-first)
- CSS Modules
- Styled Components (React)

### Socket.IO Client
```bash
npm install socket.io-client
```

```javascript
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");
```

---

## Sample Grid Rendering (Pseudo-code)

```jsx
function Grid({ gridSize, taxi, passenger, destination, obstacles }) {
  const cells = [];
  
  // Render from top to bottom (y decreases)
  for (let y = gridSize - 1; y >= 0; y--) {
    for (let x = 0; x < gridSize; x++) {
      const isObstacle = obstacles.some(o => o[0] === x && o[1] === y);
      const isTaxi = taxi.x === x && taxi.y === y;
      const isPassenger = passenger && passenger.x === x && passenger.y === y;
      const isDestination = destination && destination.x === x && destination.y === y;
      
      cells.push(
        <Cell 
          key={`${x}-${y}`}
          x={x} y={y}
          isObstacle={isObstacle}
          isTaxi={isTaxi}
          isPassenger={isPassenger}
          isDestination={isDestination}
          hasPassengerInTaxi={isTaxi && isPassengerInTaxi}
        />
      );
    }
  }
  
  return <div className="grid">{cells}</div>;
}
```

---

## Q-Value Visualization (Advanced Feature)

Optional feature to show Q-values on the grid:

```
┌─────────────────┐
│  ↑ 2.5          │
│← 0.3  → 3.8     │  ← Show arrows with Q-values
│  ↓ -1.2         │
└─────────────────┘
```

- Show Q-values for current state as arrows on taxi cell
- Arrow thickness or color intensity = Q-value magnitude
- Best action highlighted

Request Q-values:
```javascript
socket.emit('get_q_values'); // Uses current state
```

---

## Error Handling UI

```
┌─────────────────────────────────────────┐
│ ⚠️  ERROR                              │
│                                         │
│ Grid size must be 3 or 4                │
│                                         │
│              [ OK ]                     │
└─────────────────────────────────────────┘
```

- Show modal/toast for errors
- Auto-dismiss after 5 seconds or on click
- Log errors to console for debugging
