"""
QLearningAgent: The AI brain that learns to drive the taxi.

This class manages:
- Q-table (learned knowledge)
- Action selection (epsilon-greedy)
- Learning from experience (Bellman update)
"""

import random
from typing import Tuple, Dict


class Agent:
    """
    THE BRAIN - Makes decisions and learns from experience.
    
    Uses Q-Learning algorithm to learn optimal actions for each state.
    """
    
    # Available actions (must match Environment)
    ACTIONS = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'PICK', 'DROP']
    
    def __init__(self, gamma: float = 0.9):
        """
        Create the agent.
        
        Args:
            gamma: Discount factor (0 to 1). Higher = care more about future.
                   This is configurable from UI.
        """
        # The Q-table: stores learned values
        # Key: (state_tuple, action_string) → Value: float
        # Example: {((1,2,3,0,0,3,0), 'EAST'): 2.5, ...}
        self.q_table: Dict[Tuple, float] = {}
        
        # Learning parameters
        self.gamma = gamma      # Discount factor (configurable)
        self.alpha = 0.1        # Learning rate (fixed)
        self.epsilon = 0.1      # Exploration rate (fixed)
    
    def get_action(self, state: tuple) -> str:
        """
        Choose an action using epsilon-greedy strategy.
        
        EQUATION 1: Epsilon-Greedy
        - With probability epsilon (10%): choose RANDOM action (explore)
        - With probability 1-epsilon (90%): choose BEST action (exploit)
        
        Args:
            state: Current state tuple from environment
                   Example: (1, 2, 3, 0, 0, 3, 0)
        
        Returns:
            str: Action to take ('NORTH', 'SOUTH', etc.)
        """
        # Generate random number between 0 and 1
        random_value = random.random()
        
        # Exploration: pick random action
        if random_value < self.epsilon:
            return random.choice(self.ACTIONS)
        
        # Exploitation: pick best known action
        return self._get_best_action(state)
    
    def update(self, state: tuple, action: str, reward: float, next_state: tuple) -> None:
        """
        Learn from experience using Bellman equation.
        
        EQUATION 3: Q-Value Update
        Q(s,a) ← Q(s,a) + α × [r + γ × max Q(s',a') - Q(s,a)]
        
        In simpler form:
        new_Q = old_Q + alpha × (target - old_Q)
        where target = reward + gamma × best_future_Q
        
        Args:
            state: State BEFORE action was taken
            action: Action that was taken
            reward: Reward received from environment
            next_state: State AFTER action was taken
        """
        # Step 1: Get old Q-value (what we currently believe)
        old_q = self._get_q_value(state, action)
        
        # Step 2: Calculate best future Q-value from next state
        best_future_q = self._get_max_q_value(next_state)
        
        # Step 3: Calculate target (what we now think Q should be)
        # target = immediate reward + discounted future value
        target = reward + self.gamma * best_future_q
        
        # Step 4: Calculate error (difference between target and old belief)
        error = target - old_q
        
        # Step 5: Update Q-value (move old_q toward target)
        new_q = old_q + self.alpha * error
        
        # Step 6: Store in Q-table
        key = (state, action)
        self.q_table[key] = new_q
    
    def reset(self) -> None:
        """
        Forget everything (clear Q-table).
        Called when starting fresh training.
        """
        self.q_table = {}
    
    def set_gamma(self, gamma: float) -> None:
        """
        Update discount factor (called from UI config).
        
        Args:
            gamma: New discount factor (0 to 1)
        """
        if 0 <= gamma <= 1:
            self.gamma = gamma
    
    def set_epsilon(self, epsilon: float) -> None:
        """
        Update exploration rate (optional, if you want UI control).
        
        Args:
            epsilon: New exploration rate (0 to 1)
        """
        if 0 <= epsilon <= 1:
            self.epsilon = epsilon
    
    def set_alpha(self, alpha: float) -> None:
        """
        Update learning rate (optional, if you want UI control).
        
        Args:
            alpha: New learning rate (0 to 1)
        """
        if 0 <= alpha <= 1:
            self.alpha = alpha
    
    def get_q_table_size(self) -> int:
        """
        Get number of state-action pairs in Q-table.
        
        Returns:
            int: Number of entries learned
        """
        return len(self.q_table)
    
    def get_parameters(self) -> Dict:
        """
        Get current learning parameters.
        
        Returns:
            dict: Current gamma, alpha, epsilon values
        """
        return {
            "gamma": self.gamma,
            "alpha": self.alpha,
            "epsilon": self.epsilon,
            "q_table_size": self.get_q_table_size()
        }
    
    def get_q_values_for_state(self, state: tuple) -> Dict[str, float]:
        """
        Get all Q-values for a specific state (useful for debugging).
        
        Args:
            state: State tuple
        
        Returns:
            dict: {action: q_value} for all actions
        """
        result = {}
        for action in self.ACTIONS:
            result[action] = self._get_q_value(state, action)
        return result
    
    def _get_best_action(self, state: tuple) -> str:
        """
        Find action with highest Q-value for this state.
        
        EQUATION 2: Argmax
        best_action = argmax Q(state, a)
                         a
        
        If multiple actions have same value, pick randomly among them.
        If state never seen, all Q-values are 0, so pick randomly.
        
        Args:
            state: Current state tuple
        
        Returns:
            str: Best action
        """
        best_actions = []
        best_value = float('-inf')
        
        for action in self.ACTIONS:
            q_value = self._get_q_value(state, action)
            
            if q_value > best_value:
                # Found new best
                best_value = q_value
                best_actions = [action]
            elif q_value == best_value:
                # Tie - add to list
                best_actions.append(action)
        
        # If multiple actions have same value, pick randomly
        return random.choice(best_actions)
    
    def _get_q_value(self, state: tuple, action: str) -> float:
        """
        Look up Q-value in table.
        Returns 0.0 if state-action pair never seen before.
        
        Args:
            state: State tuple
            action: Action string
        
        Returns:
            float: Q-value (0.0 if unknown)
        """
        key = (state, action)
        return self.q_table.get(key, 0.0)
    
    def _get_max_q_value(self, state: tuple) -> float:
        """
        Get maximum Q-value achievable from a state.
        
        This is the "best future" part of the Bellman equation:
        max Q(s', a')
         a'
        
        Args:
            state: State tuple
        
        Returns:
            float: Maximum Q-value (0.0 if state never seen)
        """
        max_value = float('-inf')
        
        for action in self.ACTIONS:
            q_value = self._get_q_value(state, action)
            if q_value > max_value:
                max_value = q_value
        
        # If all Q-values are 0 (state never seen), return 0
        if max_value == float('-inf'):
            return 0.0
        
        return max_value
    
    def explain_decision(self, state: tuple) -> str:
        """
        Explain why agent would choose a particular action.
        Useful for debugging and demonstration.
        
        Args:
            state: State tuple
        
        Returns:
            str: Human-readable explanation
        """
        # Decode state
        taxi_x, taxi_y = state[0], state[1]
        pass_x, pass_y = state[2], state[3]
        dest_x, dest_y = state[4], state[5]
        in_taxi = state[6]
        
        explanation = []
        explanation.append("=" * 50)
        explanation.append("AGENT DECISION EXPLANATION")
        explanation.append("=" * 50)
        explanation.append("")
        explanation.append("WHAT I SEE (State):")
        explanation.append(f"  - My position: ({taxi_x}, {taxi_y})")
        
        if pass_x == -1:
            if in_taxi:
                explanation.append(f"  - Passenger: IN MY TAXI")
            else:
                explanation.append(f"  - Passenger: Not spawned yet")
        else:
            explanation.append(f"  - Passenger waiting at: ({pass_x}, {pass_y})")
        
        if dest_x != -1:
            explanation.append(f"  - Destination: ({dest_x}, {dest_y})")
        
        explanation.append(f"  - Passenger in taxi: {'Yes' if in_taxi else 'No'}")
        explanation.append("")
        explanation.append("MY Q-VALUES FOR THIS STATE:")
        
        q_values = self.get_q_values_for_state(state)
        best_action = self._get_best_action(state)
        
        for action in self.ACTIONS:
            marker = " ← BEST" if action == best_action else ""
            explanation.append(f"  {action:6}: {q_values[action]:8.3f}{marker}")
        
        explanation.append("")
        explanation.append(f"DECISION: {best_action}")
        explanation.append(f"(But {self.epsilon*100:.0f}% chance I'll explore randomly)")
        explanation.append("=" * 50)
        
        return "\n".join(explanation)

if __name__ == "__main__":
    print("=" * 60)
    print("AGENT TEST")
    print("=" * 60)
    
    # Create agent
    agent = Agent(gamma=0.9)
    
    print(f"\n1. Initial Parameters:")
    print(f"   Gamma (discount): {agent.gamma}")
    print(f"   Alpha (learning rate): {agent.alpha}")
    print(f"   Epsilon (exploration): {agent.epsilon}")
    print(f"   Q-table size: {agent.get_q_table_size()}")
    
    # Test action selection with empty Q-table
    print(f"\n2. Action Selection (empty Q-table):")
    test_state = (1, 2, 3, 0, 0, 3, 0)
    print(f"   State: {test_state}")
    
    actions_chosen = []
    for i in range(10):
        action = agent.get_action(test_state)
        actions_chosen.append(action)
    print(f"   10 actions chosen: {actions_chosen}")
    print(f"   (Should be random since Q-table is empty)")
    
    # Test learning
    print(f"\n3. Learning Test:")
    
    # Simulate: agent at (1,2), goes EAST to (2,2), gets -1 reward
    state = (1, 2, 3, 0, 0, 3, 0)
    action = 'EAST'
    reward = -1
    next_state = (2, 2, 3, 0, 0, 3, 0)
    
    print(f"   Before update:")
    print(f"   Q({state}, {action}) = {agent._get_q_value(state, action)}")
    
    agent.update(state, action, reward, next_state)
    
    print(f"   After update:")
    print(f"   Q({state}, {action}) = {agent._get_q_value(state, action):.4f}")
    print(f"   Q-table size: {agent.get_q_table_size()}")
    
    # Test multiple updates to same state-action
    print(f"\n4. Multiple Updates (same state-action):")
    for i in range(10):
        agent.update(state, action, reward, next_state)
    
    print(f"   After 10 more updates:")
    print(f"   Q({state}, {action}) = {agent._get_q_value(state, action):.4f}")
    
    # Test with positive reward
    print(f"\n5. Positive Reward Test (dropoff scenario):")
    
    drop_state = (3, 3, -1, -1, 3, 3, 1)  # At destination with passenger
    drop_action = 'DROP'
    drop_reward = 10
    drop_next_state = (3, 3, -1, -1, -1, -1, 0)  # After successful drop
    
    print(f"   State: At destination (3,3) with passenger")
    print(f"   Action: DROP")
    print(f"   Reward: +10")
    
    agent.update(drop_state, drop_action, drop_reward, drop_next_state)
    
    print(f"   Q(drop_state, DROP) = {agent._get_q_value(drop_state, drop_action):.4f}")
    
    # Test Q-values for state
    print(f"\n6. All Q-values for drop_state:")
    q_values = agent.get_q_values_for_state(drop_state)
    for act, val in q_values.items():
        print(f"   {act}: {val:.4f}")
    
    # Test best action selection after learning
    print(f"\n7. Best Action After Learning:")
    best = agent._get_best_action(drop_state)
    print(f"   Best action for drop_state: {best}")
    print(f"   (Should be DROP since it has highest Q-value)")
    
    # Test gamma change
    print(f"\n8. Parameter Change:")
    agent.set_gamma(0.5)
    print(f"   Changed gamma to: {agent.gamma}")
    
    # Test reset
    print(f"\n9. Reset Test:")
    print(f"   Q-table size before reset: {agent.get_q_table_size()}")
    agent.reset()
    print(f"   Q-table size after reset: {agent.get_q_table_size()}")
    
    # Test explain decision
    print(f"\n10. Decision Explanation:")
    agent.update(test_state, 'EAST', 5, next_state)
    agent.update(test_state, 'NORTH', -2, (1, 3, 3, 0, 0, 3, 0))
    agent.update(test_state, 'PICK', -5, test_state)
    print(agent.explain_decision(test_state))
    
    print("\n" + "=" * 60)
    print("ALL TESTS COMPLETE")
    print("=" * 60)