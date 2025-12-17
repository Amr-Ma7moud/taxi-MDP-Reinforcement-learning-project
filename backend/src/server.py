"""
WebSocket Server for Taxi MDP Reinforcement Learning Simulation.

Provides real-time communication between frontend and the Q-learning agent.
Supports training speed control (1x, 10x, 100x) and live statistics.
"""

from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
import time
from typing import Optional, Dict, Any

from .environment import Environment
from .agent import Agent


# Flask app setup
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Global simulation state
simulation: Dict[str, Any] = {
    "environment": None,
    "agent": None,
    "is_training": False,
    "training_thread": None,
    "stop_training": False,
    "speed_multiplier": 1,  # 1x, 10x, 100x
    "episode": 0,
    "total_episodes": 0,
    "steps_per_episode": [],
    "rewards_per_episode": [],
}

# Speed delays in seconds (per step)
SPEED_DELAYS = {
    1: 0.5,      # 1x speed: 500ms per step
    10: 0.05,    # 10x speed: 50ms per step
    100: 0.005,  # 100x speed: 5ms per step
}


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def serialize_state(env: Environment) -> Dict:
    """
    Convert environment state to JSON-serializable format.
    
    Returns:
        dict: {
            taxi: {x, y},
            passenger: {x, y} or null,
            destination: {x, y} or null,
            is_passenger_in_taxi: bool,
            total_reward: float,
            steps: int,
            grid_size: int,
            obstacles: [[x, y], ...]
        }
    """
    state = env.get_state()
    taxi_loc, passenger_loc, dest_loc, in_taxi = state
    
    return {
        "taxi": {"x": taxi_loc[0], "y": taxi_loc[1]},
        "passenger": {"x": passenger_loc[0], "y": passenger_loc[1]} if passenger_loc else None,
        "destination": {"x": dest_loc[0], "y": dest_loc[1]} if dest_loc else None,
        "is_passenger_in_taxi": in_taxi,
        "total_reward": env.total_reward,
        "steps": env.steps,
        "grid_size": env.grid_size,
        "obstacles": [list(obs) for obs in env.obstacles]
    }


def get_agent_stats(agent: Agent) -> Dict:
    """
    Get agent statistics for frontend display.
    
    Returns:
        dict: Agent parameters and Q-table info
    """
    return {
        "gamma": agent.gamma,
        "alpha": agent.alpha,
        "epsilon": agent.epsilon,
        "q_table_size": agent.get_q_table_size()
    }


def get_training_stats() -> Dict:
    """
    Get training statistics.
    
    Returns:
        dict: Episode counts and averages
    """
    rewards = simulation["rewards_per_episode"]
    steps = simulation["steps_per_episode"]
    
    return {
        "current_episode": simulation["episode"],
        "total_episodes": simulation["total_episodes"],
        "is_training": simulation["is_training"],
        "speed_multiplier": simulation["speed_multiplier"],
        "episodes_completed": len(rewards),
        "average_reward": sum(rewards[-100:]) / len(rewards[-100:]) if rewards else 0,
        "average_steps": sum(steps[-100:]) / len(steps[-100:]) if steps else 0,
        "last_10_rewards": rewards[-10:] if rewards else [],
        "last_10_steps": steps[-10:] if steps else [],
    }


def convert_state_for_agent(env: Environment) -> tuple:
    """
    Convert environment state to agent-compatible tuple format.
    
    The agent expects: (taxi_x, taxi_y, pass_x, pass_y, dest_x, dest_y, in_taxi)
    But environment returns: (taxi_loc, passenger_loc, dest_loc, is_passenger_in_taxi)
    """
    state = env.get_state()
    taxi_loc, passenger_loc, dest_loc, in_taxi = state
    
    pass_x = passenger_loc[0] if passenger_loc else -1
    pass_y = passenger_loc[1] if passenger_loc else -1
    dest_x = dest_loc[0] if dest_loc else -1
    dest_y = dest_loc[1] if dest_loc else -1
    
    return (taxi_loc[0], taxi_loc[1], pass_x, pass_y, dest_x, dest_y, 1 if in_taxi else 0)


# ============================================================
# TRAINING LOOP
# ============================================================

def training_loop():
    """
    Background training loop.
    Runs episodes until stopped or target reached.
    """
    env = simulation["environment"]
    agent = simulation["agent"]
    
    while simulation["is_training"] and not simulation["stop_training"]:
        # Check if we've reached target episodes
        if simulation["total_episodes"] > 0 and simulation["episode"] >= simulation["total_episodes"]:
            break
        
        simulation["episode"] += 1
        episode_reward = 0
        episode_steps = 0
        max_steps = 200  # Prevent infinite episodes
        
        # Reset environment for new episode
        env.reset()
        
        # Emit episode start
        socketio.emit('episode_start', {
            "episode": simulation["episode"],
            "state": serialize_state(env)
        })
        
        while episode_steps < max_steps:
            if simulation["stop_training"]:
                break
            
            # Get current state for agent
            current_state = convert_state_for_agent(env)
            
            # Agent chooses action
            action = agent.get_action(current_state)
            
            # Store previous reward to calculate step reward
            prev_reward = env.total_reward
            
            # Execute action
            env.step(action)
            
            # Get new state and reward
            next_state = convert_state_for_agent(env)
            step_reward = env.total_reward - prev_reward
            
            # Agent learns
            agent.update(current_state, action, step_reward, next_state)
            
            episode_steps += 1
            episode_reward = env.total_reward
            
            # Emit step update
            socketio.emit('step_update', {
                "episode": simulation["episode"],
                "step": episode_steps,
                "action": action,
                "reward": step_reward,
                "total_reward": episode_reward,
                "state": serialize_state(env),
                "agent_stats": get_agent_stats(agent)
            })
            
            # Check if episode is done (successful dropoff)
            state = env.get_state()
            _, passenger_loc, dest_loc, in_taxi = state
            
            # Episode ends if passenger was dropped at destination
            # This is detected by: passenger was in taxi, now not, and we got +10
            if step_reward == 10:
                break
            
            # Delay based on speed
            delay = SPEED_DELAYS.get(simulation["speed_multiplier"], 0.5)
            time.sleep(delay)
        
        # Record episode stats
        simulation["steps_per_episode"].append(episode_steps)
        simulation["rewards_per_episode"].append(episode_reward)
        
        # Emit episode complete
        socketio.emit('episode_complete', {
            "episode": simulation["episode"],
            "steps": episode_steps,
            "total_reward": episode_reward,
            "training_stats": get_training_stats(),
            "agent_stats": get_agent_stats(agent)
        })
    
    # Training finished
    simulation["is_training"] = False
    simulation["stop_training"] = False
    
    socketio.emit('training_complete', {
        "episodes_completed": len(simulation["rewards_per_episode"]),
        "training_stats": get_training_stats(),
        "agent_stats": get_agent_stats(agent)
    })


# ============================================================
# WEBSOCKET EVENT HANDLERS
# ============================================================

@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    print("Client connected")
    emit('connected', {"message": "Connected to Taxi MDP server"})


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    print("Client disconnected")


@socketio.on('init')
def handle_init(data: Dict):
    """
    Initialize the simulation environment.
    
    Expected data:
        grid_size: int (3 or 4)
        obstacles: [[x, y], ...] (optional, max grid_size - 1)
    
    Emits:
        init_success: {state, agent_stats}
        error: {message}
    """
    try:
        grid_size = data.get("grid_size", 4)
        obstacles = data.get("obstacles", [])
        
        # Validate grid size
        if grid_size not in [3, 4]:
            emit('error', {"message": "Grid size must be 3 or 4"})
            return
        
        # Validate obstacles count
        max_obstacles = grid_size - 1
        if len(obstacles) > max_obstacles:
            emit('error', {"message": f"Maximum {max_obstacles} obstacles allowed for {grid_size}x{grid_size} grid"})
            return
        
        # Convert obstacles to tuples
        obstacle_tuples = [tuple(obs) for obs in obstacles]
        
        # Create environment and agent
        simulation["environment"] = Environment(grid_size, obstacle_tuples)
        simulation["agent"] = Agent(gamma=0.9)
        
        # Reset training stats
        simulation["episode"] = 0
        simulation["total_episodes"] = 0
        simulation["steps_per_episode"] = []
        simulation["rewards_per_episode"] = []
        simulation["is_training"] = False
        simulation["stop_training"] = False
        
        emit('init_success', {
            "state": serialize_state(simulation["environment"]),
            "agent_stats": get_agent_stats(simulation["agent"]),
            "message": f"Initialized {grid_size}x{grid_size} grid with {len(simulation['environment'].obstacles)} obstacles"
        })
        
    except Exception as e:
        emit('error', {"message": f"Initialization failed: {str(e)}"})


@socketio.on('configure_agent')
def handle_configure_agent(data: Dict):
    """
    Configure agent parameters.
    
    Expected data:
        gamma: float (0-1, discount factor)
        alpha: float (0-1, learning rate)
        epsilon: float (0-1, exploration rate)
    
    Emits:
        agent_configured: {agent_stats}
        error: {message}
    """
    if not simulation["agent"]:
        emit('error', {"message": "Agent not initialized. Call init first."})
        return
    
    try:
        agent = simulation["agent"]
        
        if "gamma" in data:
            agent.set_gamma(float(data["gamma"]))
        if "alpha" in data:
            agent.set_alpha(float(data["alpha"]))
        if "epsilon" in data:
            agent.set_epsilon(float(data["epsilon"]))
        
        emit('agent_configured', {
            "agent_stats": get_agent_stats(agent),
            "message": "Agent parameters updated"
        })
        
    except Exception as e:
        emit('error', {"message": f"Configuration failed: {str(e)}"})


@socketio.on('step')
def handle_step(data: Dict):
    """
    Execute a single step (manual mode).
    
    Expected data:
        action: str ('NORTH', 'SOUTH', 'EAST', 'WEST', 'PICK', 'DROP')
               or 'auto' for agent to choose
    
    Emits:
        step_result: {action, reward, state, agent_stats}
        error: {message}
    """
    if not simulation["environment"] or not simulation["agent"]:
        emit('error', {"message": "Simulation not initialized. Call init first."})
        return
    
    if simulation["is_training"]:
        emit('error', {"message": "Cannot manual step while training. Stop training first."})
        return
    
    try:
        env = simulation["environment"]
        agent = simulation["agent"]
        
        # Get current state for agent
        current_state = convert_state_for_agent(env)
        
        # Determine action
        action = data.get("action", "auto")
        if action == "auto":
            action = agent.get_action(current_state)
        
        # Validate action
        valid_actions = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'PICK', 'DROP']
        if action not in valid_actions:
            emit('error', {"message": f"Invalid action. Must be one of: {valid_actions}"})
            return
        
        # Store previous reward
        prev_reward = env.total_reward
        
        # Execute action
        env.step(action)
        
        # Get new state and reward
        next_state = convert_state_for_agent(env)
        step_reward = env.total_reward - prev_reward
        
        # Agent learns from this experience
        agent.update(current_state, action, step_reward, next_state)
        
        emit('step_result', {
            "action": action,
            "reward": step_reward,
            "total_reward": env.total_reward,
            "state": serialize_state(env),
            "agent_stats": get_agent_stats(agent)
        })
        
    except Exception as e:
        emit('error', {"message": f"Step failed: {str(e)}"})


@socketio.on('start_training')
def handle_start_training(data: Dict):
    """
    Start automated training.
    
    Expected data:
        episodes: int (number of episodes, 0 for infinite)
        speed: int (1, 10, or 100)
    
    Emits:
        training_started: {message, training_stats}
        error: {message}
    """
    if not simulation["environment"] or not simulation["agent"]:
        emit('error', {"message": "Simulation not initialized. Call init first."})
        return
    
    if simulation["is_training"]:
        emit('error', {"message": "Training already in progress"})
        return
    
    try:
        episodes = data.get("episodes", 0)
        speed = data.get("speed", 1)
        
        # Validate speed
        if speed not in [1, 10, 100]:
            emit('error', {"message": "Speed must be 1, 10, or 100"})
            return
        
        simulation["total_episodes"] = episodes
        simulation["speed_multiplier"] = speed
        simulation["is_training"] = True
        simulation["stop_training"] = False
        
        # Start training thread
        simulation["training_thread"] = threading.Thread(target=training_loop)
        simulation["training_thread"].daemon = True
        simulation["training_thread"].start()
        
        emit('training_started', {
            "message": f"Training started at {speed}x speed",
            "training_stats": get_training_stats()
        })
        
    except Exception as e:
        emit('error', {"message": f"Failed to start training: {str(e)}"})


@socketio.on('stop_training')
def handle_stop_training():
    """
    Stop automated training.
    
    Emits:
        training_stopped: {message, training_stats}
    """
    if not simulation["is_training"]:
        emit('error', {"message": "No training in progress"})
        return
    
    simulation["stop_training"] = True
    
    emit('training_stopped', {
        "message": "Training stop requested",
        "training_stats": get_training_stats()
    })


@socketio.on('set_speed')
def handle_set_speed(data: Dict):
    """
    Change training speed during training.
    
    Expected data:
        speed: int (1, 10, or 100)
    
    Emits:
        speed_changed: {speed, message}
        error: {message}
    """
    speed = data.get("speed", 1)
    
    if speed not in [1, 10, 100]:
        emit('error', {"message": "Speed must be 1, 10, or 100"})
        return
    
    simulation["speed_multiplier"] = speed
    
    emit('speed_changed', {
        "speed": speed,
        "message": f"Speed changed to {speed}x"
    })


@socketio.on('reset')
def handle_reset(data: Dict = None):
    """
    Reset the simulation.
    
    Expected data:
        reset_agent: bool (if true, also reset Q-table)
    
    Emits:
        reset_success: {state, agent_stats, training_stats}
        error: {message}
    """
    if not simulation["environment"]:
        emit('error', {"message": "Simulation not initialized. Call init first."})
        return
    
    # Stop training if running
    if simulation["is_training"]:
        simulation["stop_training"] = True
        time.sleep(0.1)  # Wait for training to stop
    
    data = data or {}
    reset_agent = data.get("reset_agent", False)
    
    try:
        # Reset environment
        simulation["environment"].reset()
        
        # Reset agent if requested
        if reset_agent and simulation["agent"]:
            simulation["agent"].reset()
        
        # Reset training stats
        simulation["episode"] = 0
        simulation["steps_per_episode"] = []
        simulation["rewards_per_episode"] = []
        simulation["is_training"] = False
        simulation["stop_training"] = False
        
        emit('reset_success', {
            "state": serialize_state(simulation["environment"]),
            "agent_stats": get_agent_stats(simulation["agent"]) if simulation["agent"] else None,
            "training_stats": get_training_stats(),
            "message": "Simulation reset" + (" (agent Q-table cleared)" if reset_agent else "")
        })
        
    except Exception as e:
        emit('error', {"message": f"Reset failed: {str(e)}"})


@socketio.on('get_state')
def handle_get_state():
    """
    Get current simulation state.
    
    Emits:
        current_state: {state, agent_stats, training_stats}
        error: {message}
    """
    if not simulation["environment"]:
        emit('error', {"message": "Simulation not initialized. Call init first."})
        return
    
    emit('current_state', {
        "state": serialize_state(simulation["environment"]),
        "agent_stats": get_agent_stats(simulation["agent"]) if simulation["agent"] else None,
        "training_stats": get_training_stats()
    })


@socketio.on('get_q_values')
def handle_get_q_values(data: Dict = None):
    """
    Get Q-values for current or specified state.
    
    Expected data:
        state: [taxi_x, taxi_y, pass_x, pass_y, dest_x, dest_y, in_taxi] (optional)
               If not provided, uses current environment state
    
    Emits:
        q_values: {state, values: {action: value}}
        error: {message}
    """
    if not simulation["agent"]:
        emit('error', {"message": "Agent not initialized. Call init first."})
        return
    
    try:
        data = data or {}
        
        if "state" in data:
            state = tuple(data["state"])
        else:
            state = convert_state_for_agent(simulation["environment"])
        
        q_values = simulation["agent"].get_q_values_for_state(state)
        
        emit('q_values', {
            "state": list(state),
            "values": q_values,
            "best_action": simulation["agent"]._get_best_action(state)
        })
        
    except Exception as e:
        emit('error', {"message": f"Failed to get Q-values: {str(e)}"})


@socketio.on('get_full_q_table')
def handle_get_full_q_table():
    """
    Get the full Q-table (for visualization).
    Warning: Can be large!
    
    Emits:
        full_q_table: {q_table: {state_str: {action: value}}, size}
        error: {message}
    """
    if not simulation["agent"]:
        emit('error', {"message": "Agent not initialized. Call init first."})
        return
    
    try:
        agent = simulation["agent"]
        
        # Convert Q-table to serializable format
        # Group by state
        q_table_by_state = {}
        for (state, action), value in agent.q_table.items():
            state_key = str(state)
            if state_key not in q_table_by_state:
                q_table_by_state[state_key] = {}
            q_table_by_state[state_key][action] = value
        
        emit('full_q_table', {
            "q_table": q_table_by_state,
            "size": agent.get_q_table_size()
        })
        
    except Exception as e:
        emit('error', {"message": f"Failed to get Q-table: {str(e)}"})


# ============================================================
# HTTP ENDPOINTS (for health check)
# ============================================================

@app.route('/')
def index():
    """Health check endpoint."""
    return {
        "status": "running",
        "service": "Taxi MDP Backend",
        "websocket": "Connect via Socket.IO"
    }


@app.route('/health')
def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "simulation_initialized": simulation["environment"] is not None,
        "is_training": simulation["is_training"]
    }


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("=" * 60)
    print("TAXI MDP WEBSOCKET SERVER")
    print("=" * 60)
    print("Starting server on http://localhost:5000")
    print("WebSocket endpoint: ws://localhost:5000")
    print("=" * 60)
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
