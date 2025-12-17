"""
    i will write this documentation later
"""

import random;

class Environment:
    """
    THE WORLD - Manages simulation physics and rules.
    * Represents a grid world where a taxi picks up and drops off passengers.
    * Grid has obstacles, taxi and passenger positions.
    * Grid size either 3\*3 or 4\*4.
    """

    def __init__(self, grid_size: int, obstacles: list):
        """
        CREATE the world.
        Set up grid, obstacles, initial positions.
        """
        self.grid_size = grid_size; 
        self.obstacles = self._set_obstacles(obstacles);
        self._taxi_loc = (0, 0);
        self.dest_loc = None; # passenger destination i dont think the name means that so i COMMENTED HERE
        self.passenger_loc = None;
        self._spawn_passenger();
        self.is_passenger_in_taxi = False;
        self.total_reward = 0;
        self.actions = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'PICK', 'DROP'];
        self.steps = 0;
        try:
            from agent import Agent
            self.agent = Agent();
        except ImportError:
            self.agent = None;

    def reset(self) -> dict:
        """
            RESTART the world.
            Put taxi at random position, clear passenger.
            Called at start of new episode.
        """
        self._taxi_loc = (0,0);
        self.dest_loc = None;
        self.passenger_loc = None;
        self._spawn_passenger();
        self.is_passenger_in_taxi = False;
        self.total_reward = 0;
        self.steps = 0;
        if self.agent:
            self.agent.reset();
        return self.get_state();
    
    def step(self, action: str) -> dict:
        """
        EXECUTE an action.
        Move taxi, handle pickup/drop, calculate reward.
        This is the main "physics engine".
        """
        if action not in self.actions: 
            self.total_reward += -5;  # PENALTY for invalid action
            return self.get_state();
        if action == 'PICK':
            self._handle_pick();
        elif action == 'DROP':
            self._handle_drop();
        else:
            self._handle_movement(action);

        if not self.passenger_loc:
            self._spawn_passenger();

        self.steps += 1;
        return self.get_state();

    def get_state(self) -> tuple:
        """
        REPORT current state.
        Package all positions into tuple for agent.
        This is the agent's "eyes".
        """
        return (self._taxi_loc, self.passenger_loc, self.dest_loc, self.is_passenger_in_taxi);
    
    # ===== HELPER METHODS  =====
    def _spawn_passenger(self) -> None:
        """
        MAYBE create new passenger.
        20% chance if no passenger exists.
        """
        if self.passenger_loc is not None:
            return;
        if random.random() < 0.2:
            self.passenger_loc = self._get_random_valid_position();
            while True:
                dest = self._get_random_valid_position();
                if dest != self.passenger_loc:
                    self.dest_loc = dest;
                    return;
        return;
    
    def _set_obstacles(self, obstacles: list) -> set:
        """Set obstacles on the grid. maximum number of obstacles should be less than column - 1"""
        max_obstacles = self.grid_size - 1;
        obstacle_set = set();
        
        valid_obstacles = [];
        for obs in obstacles:
            if (0 <= obs[0] < self.grid_size and 0 <= obs[1] < self.grid_size):
                valid_obstacles.append(obs);
        
        if len(valid_obstacles) > max_obstacles:
            valid_obstacles = valid_obstacles[:max_obstacles];
        
        for obs in valid_obstacles:
            test_obstacles = obstacle_set.copy();
            test_obstacles.add(obs);
            if self._check_all_reachable(test_obstacles):
                obstacle_set.add(obs);
        
        return obstacle_set;

    def _check_all_reachable(self, test_obstacles: set) -> bool:
        """CHECK if all cells are reachable with these obstacles. Use BFS from (0,0)."""
        if (0, 0) in test_obstacles:
            return False;
        
        visited = set();
        queue = [(0, 0)];
        
        while queue:
            current = queue.pop(0);
            if current in visited:
                continue;
            visited.add(current);
            
            for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                next_pos = (current[0] + dx, current[1] + dy);
                if (0 <= next_pos[0] < self.grid_size and
                    0 <= next_pos[1] < self.grid_size and
                    next_pos not in test_obstacles and
                    next_pos not in visited):
                    queue.append(next_pos);
        
        total_cells = self.grid_size * self.grid_size;
        expected_reachable = total_cells - len(test_obstacles);
        return len(visited) == expected_reachable;

    def _is_valid_position(self, location: tuple) -> bool:
        """Check if position is inside grid and not obstacle."""
        if (0 <= location[0] < self.grid_size and
            0 <= location[1] < self.grid_size and
            location not in self.obstacles):
            return True;
        return False;

    def _get_random_valid_position(self) -> tuple:
        """Get random position that's not an obstacle."""
        while True:
            pos = (random.randint(0, self.grid_size - 1), random.randint(0, self.grid_size - 1));
            if self._is_valid_position(pos):
                return pos;

    def _handle_movement(self, action) -> tuple:
        """Process NORTH/SOUTH/EAST/WEST actions."""
        if action == 'NORTH':
            new_pos = (self._taxi_loc[0], self._taxi_loc[1] + 1);
        elif action == 'SOUTH':
            new_pos = (self._taxi_loc[0], self._taxi_loc[1] - 1);
        elif action == 'EAST':
            new_pos = (self._taxi_loc[0] + 1, self._taxi_loc[1]);
        elif action == 'WEST':
            new_pos = (self._taxi_loc[0] - 1, self._taxi_loc[1]);
        if self._is_valid_position(new_pos):
            self._taxi_loc = new_pos;
            self.total_reward += -1;
        else:
            new_pos = self._taxi_loc;
            self.total_reward += -5;

        return new_pos;

    def _handle_pick(self) -> None:
        """Process PICK action."""
        if self.is_passenger_in_taxi:
            self.total_reward += -5;
            return;

        if self._taxi_loc != self.passenger_loc:
            self.total_reward += -5;
            return;

        self.is_passenger_in_taxi = True;
        self.passenger_loc = self._taxi_loc;
        return;

    def _handle_drop(self) -> tuple:
        """Process DROP action."""
        if not self.is_passenger_in_taxi:
            self.total_reward += -5;
            return;

        if self._taxi_loc != self.dest_loc:
            self.total_reward += -5;
            return;

        self.is_passenger_in_taxi = False;
        self.passenger_loc = None;
        self.total_reward += 10;
        return;