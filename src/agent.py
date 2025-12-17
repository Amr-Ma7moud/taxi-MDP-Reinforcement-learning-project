class QLearningAgent:
    """
    THE BRAIN - Makes decisions and learns from experience.
    """
    
    def __init__(self, gamma: float = 0.9):
        """
        CREATE the brain.
        Initialize empty Q-table, set learning parameters.
        """
        pass
    
    def get_action(self, state: tuple) -> int:
        """
        DECIDE what to do.
        Given current state, return best action (or random for exploration).
        This is the main "thinking" method.
        """
        pass
    
    def update(self, state, action, reward, next_state):
        """
        LEARN from experience.
        Update Q-value based on reward received.
        This is where learning happens.
        """
        pass
    
    def reset(self):
        """
        FORGET everything.
        Clear Q-table to start fresh.
        """
        pass
    
    def set_gamma(self, gamma: float):
        """
        ADJUST how much to value future.
        Called when UI changes gamma setting.
        """
        pass
    
    def get_q_table_size(self) -> int:
        """
        REPORT learning progress.
        Return how many state-action pairs learned.
        """
        pass
    
    def _get_best_action(self, state: tuple) -> int:
        """Find action with highest Q-value for this state."""
        pass
    
    def _get_q_value(self, state: tuple, action: int) -> float:
        """Look up Q-value in table (0.0 if not found)."""
        pass
    
    def _get_max_q_value(self, state: tuple) -> float:
        """Get best possible Q-value from a state."""
        pass