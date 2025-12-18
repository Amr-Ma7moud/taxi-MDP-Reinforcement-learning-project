# Taxi MDP Reinforcement Learning Project

A Q-learning agent learning to drive a taxi in a grid world, with real-time WebSocket communication between backend and frontend.

## Architecture

- **Backend**: Python Flask-SocketIO server running the Q-learning simulation
- **Frontend**: React + TypeScript + Tailwind UI for visualization and control
- **Communication**: WebSocket (Socket.IO) for real-time updates

## Quick Start

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies (choose one option):
   ```bash
   # Option A: Virtual environment (recommended)
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r req.txt
   
   # Option B: Global install with system packages (Arch Linux)
   pip install -r req.txt --break-system-packages
   
   # Option C: Use pipx for isolated install
   pipx install flask flask-socketio flask-cors eventlet
   ```

3. Run the server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser

## How to Use

1. **Start both servers** (backend on :5000, frontend on :5173)
2. **Configure grid**: Choose 3×3 or 4×4, click cells to add obstacles
3. **Initialize**: Click "Initialize" to create environment
4. **Train or control manually**: Use training controls or arrow keys
5. **Watch the agent learn!** Real-time stats show Q-learning progress

## Features

- 🚕 Interactive taxi simulation with obstacles
- 🧠 Q-learning agent with configurable parameters
- ⚡ Speed controls (1x, 10x, 100x)
- 📊 Real-time statistics and learning progress
- 🎮 Manual control mode for testing
- 🔄 WebSocket communication for instant updates

## Documentation

- [API.md](backend/API.md) - WebSocket API reference
- [UI_SPEC.md](docs/UI_SPEC.md) - UI design specification

## Troubleshooting

**Backend won't start**:
- Install dependencies: `pip install flask flask-socketio flask-cors eventlet`
- Run from backend folder: `cd backend && python app.py`

**Frontend can't connect**:
- Ensure backend is running on port 5000
- Check browser console for connection errors

**Permission errors**:
- Use virtual environment or `--break-system-packages`
