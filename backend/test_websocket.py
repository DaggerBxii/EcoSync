import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket server")
            
            # Listen for a few messages to verify AI predictions are being broadcast
            for i in range(5):
                message = await websocket.recv()
                data = json.loads(message)
                print(f"Received prediction {i+1}:")
                print(json.dumps(data, indent=2))
                print("-" * 50)
                
    except Exception as e:
        print(f"Error connecting to WebSocket: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())