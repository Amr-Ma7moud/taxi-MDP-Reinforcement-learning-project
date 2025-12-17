# Taxi MDP Backend API Documentation

WebSocket-based API for the Taxi MDP Reinforcement Learning simulation.

## Connection

**WebSocket URL:** `ws://localhost:5000`  
**Protocol:** Socket.IO

### JavaScript Example
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to Taxi MDP server");
});
```

---

## Events Overview

### Client → Server (Commands)

| Event | Description |
|-------|-------------|
| `init` | Initialize simulation environment |
| `configure_agent` | Set agent learning parameters |
| `step` | Execute a single action (manual mode) |
| `start_training` | Begin automated training |
| `stop_training` | Stop automated training |
| `set_speed` | Change training speed |
| `reset` | Reset simulation |
| `get_state` | Request current state |
| `get_q_values` | Get Q-values for a state |
| `get_full_q_table` | Get entire Q-table |

### Server → Client (Events)

| Event | Description |
|-------|-------------|
| `connected` | Connection confirmed |
| `init_success` | Environment initialized |
| `agent_configured` | Agent parameters updated |
| `step_result` | Result of manual step |
| `step_update` | Real-time step during training |
| `episode_start` | New episode began |
| `episode_complete` | Episode finished |
| `training_started` | Training began |
| `training_stopped` | Training stopped |
| `training_complete` | All episodes finished |
| `speed_changed` | Speed multiplier updated |
| `reset_success` | Simulation reset |
| `current_state` | Current state snapshot |
| `q_values` | Q-values for state |
| `full_q_table` | Complete Q-table |
| `error` | Error occurred |

---

## Event Details

### `init`

Initialize the simulation environment.

**Client sends:**
```json
{
  "grid_size": 4,
  "obstacles": [[1, 1], [2, 2]]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `grid_size` | `int` | Yes | Grid size (3 or 4 only) |
| `obstacles` | `array` | No | List of [x, y] obstacle positions. Max `grid_size - 1` obstacles |

**Server responds with `init_success`:**
```json
{
  "state": {
    "taxi": {"x": 0, "y": 0},
    "passenger": {"x": 2, "y": 1},
    "destination": {"x": 3, "y": 3},
    "is_passenger_in_taxi": false,
    "total_reward": 0,
    "steps": 0,
    "grid_size": 4,
    "obstacles": [[1, 1], [2, 2]]
  },
  "agent_stats": {
    "gamma": 0.9,
    "alpha": 0.1,
    "epsilon": 0.1,
    "q_table_size": 0
  },
  "message": "Initialized 4x4 grid with 2 obstacles"
}
```

---

### `configure_agent`

Update agent learning parameters.

**Client sends:**
```json
{
  "gamma": 0.95,
  "alpha": 0.2,
  "epsilon": 0.15
}
```

| Field | Type | Required | Range | Description |
|-------|------|----------|-------|-------------|
| `gamma` | `float` | No | 0.0-1.0 | Discount factor (future reward importance) |
| `alpha` | `float` | No | 0.0-1.0 | Learning rate |
| `epsilon` | `float` | No | 0.0-1.0 | Exploration rate |

**Server responds with `agent_configured`:**
```json
{
  "agent_stats": {
    "gamma": 0.95,
    "alpha": 0.2,
    "epsilon": 0.15,
    "q_table_size": 150
  },
  "message": "Agent parameters updated"
}
```

---

### `step`

Execute a single action in manual mode.

**Client sends:**
```json
{
  "action": "NORTH"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | `string` | Yes | One of: `NORTH`, `SOUTH`, `EAST`, `WEST`, `PICK`, `DROP`, or `auto` (agent chooses) |

**Server responds with `step_result`:**
```json
{
  "action": "NORTH",
  "reward": -1,
  "total_reward": -5,
  "state": { /* state object */ },
  "agent_stats": { /* agent stats object */ }
}
```

**Reward values:**
| Scenario | Reward |
|----------|--------|
| Successful movement | -1 |
| Movement blocked (wall/obstacle) | -5 |
| Successful passenger pickup | 0 |
| Failed pickup (wrong location) | -5 |
| Successful dropoff at destination | +10 |
| Failed dropoff (wrong location) | -5 |
| Invalid action | -5 |

---

### `start_training`

Begin automated training.

**Client sends:**
```json
{
  "episodes": 1000,
  "speed": 10
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `episodes` | `int` | No | Number of episodes (0 = infinite) |
| `speed` | `int` | Yes | Speed multiplier: `1`, `10`, or `100` |

**Speed delays:**
| Speed | Delay per step |
|-------|---------------|
| 1x | 500ms |
| 10x | 50ms |
| 100x | 5ms |

**Server responds with `training_started`:**
```json
{
  "message": "Training started at 10x speed",
  "training_stats": { /* training stats object */ }
}
```

**During training, server emits:**

1. `episode_start` - When each episode begins
2. `step_update` - After each step (action taken)
3. `episode_complete` - When episode finishes

---

### `stop_training`

Stop automated training.

**Client sends:** (no data required)

**Server responds with `training_stopped`:**
```json
{
  "message": "Training stop requested",
  "training_stats": { /* training stats object */ }
}
```

---

### `set_speed`

Change training speed during training.

**Client sends:**
```json
{
  "speed": 100
}
```

**Server responds with `speed_changed`:**
```json
{
  "speed": 100,
  "message": "Speed changed to 100x"
}
```

---

### `reset`

Reset the simulation.

**Client sends:**
```json
{
  "reset_agent": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reset_agent` | `bool` | No | If true, clears Q-table (default: false) |

**Server responds with `reset_success`:**
```json
{
  "state": { /* state object */ },
  "agent_stats": { /* agent stats object */ },
  "training_stats": { /* training stats object */ },
  "message": "Simulation reset (agent Q-table cleared)"
}
```

---

### `get_state`

Request current simulation state.

**Client sends:** (no data required)

**Server responds with `current_state`:**
```json
{
  "state": { /* state object */ },
  "agent_stats": { /* agent stats object */ },
  "training_stats": { /* training stats object */ }
}
```

---

### `get_q_values`

Get Q-values for a specific state.

**Client sends:**
```json
{
  "state": [1, 2, 3, 0, 3, 3, 0]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `state` | `array` | No | State tuple: [taxi_x, taxi_y, pass_x, pass_y, dest_x, dest_y, in_taxi]. If omitted, uses current state |

**Server responds with `q_values`:**
```json
{
  "state": [1, 2, 3, 0, 3, 3, 0],
  "values": {
    "NORTH": 2.5,
    "SOUTH": -1.2,
    "EAST": 3.8,
    "WEST": 0.5,
    "PICK": -5.0,
    "DROP": -5.0
  },
  "best_action": "EAST"
}
```

---

### `get_full_q_table`

Get the entire Q-table (for visualization).

**Client sends:** (no data required)

**Server responds with `full_q_table`:**
```json
{
  "q_table": {
    "(1, 2, 3, 0, 3, 3, 0)": {
      "NORTH": 2.5,
      "EAST": 3.8
    },
    "(2, 2, 3, 0, 3, 3, 0)": {
      "SOUTH": 1.2
    }
  },
  "size": 1250
}
```

⚠️ **Warning:** Can be large after extensive training!

---

## Data Objects

### State Object
```json
{
  "taxi": {"x": 1, "y": 2},
  "passenger": {"x": 3, "y": 0},
  "destination": {"x": 3, "y": 3},
  "is_passenger_in_taxi": false,
  "total_reward": -15,
  "steps": 12,
  "grid_size": 4,
  "obstacles": [[1, 1]]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `taxi` | `object` | Taxi position {x, y} |
| `passenger` | `object\|null` | Passenger position or null if not spawned |
| `destination` | `object\|null` | Destination position or null |
| `is_passenger_in_taxi` | `bool` | Whether passenger is in taxi |
| `total_reward` | `float` | Cumulative episode reward |
| `steps` | `int` | Steps taken in current episode |
| `grid_size` | `int` | Grid dimensions (3 or 4) |
| `obstacles` | `array` | List of obstacle positions |

### Agent Stats Object
```json
{
  "gamma": 0.9,
  "alpha": 0.1,
  "epsilon": 0.1,
  "q_table_size": 1250
}
```

| Field | Type | Description |
|-------|------|-------------|
| `gamma` | `float` | Discount factor |
| `alpha` | `float` | Learning rate |
| `epsilon` | `float` | Exploration rate |
| `q_table_size` | `int` | Number of state-action pairs learned |

### Training Stats Object
```json
{
  "current_episode": 150,
  "total_episodes": 1000,
  "is_training": true,
  "speed_multiplier": 10,
  "episodes_completed": 149,
  "average_reward": 3.5,
  "average_steps": 25.3,
  "last_10_rewards": [5, 2, -3, 8, 4, 6, 1, 7, 3, 9],
  "last_10_steps": [20, 25, 35, 18, 22, 19, 30, 17, 28, 21]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `current_episode` | `int` | Current episode number |
| `total_episodes` | `int` | Target episodes (0 = infinite) |
| `is_training` | `bool` | Whether training is active |
| `speed_multiplier` | `int` | Current speed (1, 10, or 100) |
| `episodes_completed` | `int` | Episodes finished |
| `average_reward` | `float` | Average reward (last 100 episodes) |
| `average_steps` | `float` | Average steps (last 100 episodes) |
| `last_10_rewards` | `array` | Recent episode rewards |
| `last_10_steps` | `array` | Recent episode step counts |

---

## Error Handling

All errors emit an `error` event:
```json
{
  "message": "Grid size must be 3 or 4"
}
```

Common errors:
- `"Simulation not initialized. Call init first."`
- `"Agent not initialized. Call init first."`
- `"Grid size must be 3 or 4"`
- `"Maximum N obstacles allowed for NxN grid"`
- `"Cannot manual step while training. Stop training first."`
- `"Training already in progress"`
- `"Speed must be 1, 10, or 100"`
- `"Invalid action. Must be one of: [...]"`

---

## HTTP Endpoints

For health checks (not WebSocket):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check with status |

---

## Example Flow

```javascript
// 1. Connect
const socket = io("http://localhost:5000");

// 2. Initialize
socket.emit("init", { grid_size: 4, obstacles: [[1, 1]] });
socket.on("init_success", (data) => console.log("Initialized:", data));

// 3. Configure agent (optional)
socket.emit("configure_agent", { gamma: 0.95 });

// 4. Start training
socket.emit("start_training", { episodes: 500, speed: 10 });

// 5. Listen for updates
socket.on("step_update", (data) => {
  updateGrid(data.state);
  updateStats(data.agent_stats);
});

socket.on("episode_complete", (data) => {
  console.log(`Episode ${data.episode} done: ${data.total_reward} reward`);
});

// 6. Change speed mid-training
socket.emit("set_speed", { speed: 100 });

// 7. Stop when desired
socket.emit("stop_training");
```
