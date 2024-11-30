import asyncio
import websockets
import json

async def send_commands():
    uri = "ws://localhost:8080"  # Connect to the WebSocket server
    async with websockets.connect(uri) as websocket:
        # Example commands
        commands = [
            {"action": "place_tile", "row": 0, "col": 0, "value": 1, "color": "red"},
            {"action": "place_tile", "row": 1, "col": 1, "value": 2, "color": "green"},
            {"action": "block_cell", "row": 2, "col": 2},
            # {"action": "clear_cell", "row": 1, "col": 1},
        ]

        for command in commands:
            await websocket.send(json.dumps(command))
            print(f"Sent: {command}")
            response = await websocket.recv()
            print(f"Received: {response}")
            await asyncio.sleep(1)  # Pause between commands

asyncio.run(send_commands())
