"""
Entry point for the Taxi MDP Backend Server.

Run with: python app.py
"""

from src.server import app, socketio

if __name__ == "__main__":
    print("=" * 60)
    print("TAXI MDP WEBSOCKET SERVER")
    print("=" * 60)
    print("Starting server on http://localhost:5000")
    print("WebSocket endpoint: ws://localhost:5000")
    print("=" * 60)
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)