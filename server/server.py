import asyncio
import websockets
import json

# Keep track of all connected clients
connected_clients = set()

async def validate_board(board_state):
    """Validate the board state sent from the frontend."""
    # Add custom validation logic here
    # For now, assume all moves are valid
    return True

async def handle_connection(websocket, path):
    # Add the newly connected client to the set
    connected_clients.add(websocket)
    print(f"A client connected. Total clients: {len(connected_clients)}")

    try:
        async for message in websocket:
            data = json.loads(message)
            print(f"Received: {data}")

            # Handle 'place_tile' and other actions
            if data['action'] == 'place_tile':
                # Assume the move is valid for now
                response = {"valid": True, "message": "Tile placed successfully.", **data}
            elif data['action'] == 'block_cell':
                response = {"valid": True, "message": "Cell blocked successfully.", **data}
            elif data['action'] == 'clear_cell':
                response = {"valid": True, "message": "Cell cleared successfully.", **data}
            else:
                response = {"valid": False, "message": "Unknown action.", **data}

            # Broadcast the response to all connected clients
            await broadcast(response)

    except websockets.ConnectionClosed:
        print("A client disconnected.")
    finally:
        # Remove the disconnected client from the set
        connected_clients.remove(websocket)
        print(f"Client removed. Total clients: {len(connected_clients)}")

async def broadcast(message):
    """Send a message to all connected clients."""
    if connected_clients:  # Only attempt to broadcast if there are connected clients
        message_json = json.dumps(message)
        await asyncio.wait([client.send(message_json) for client in connected_clients])

async def main():
    async with websockets.serve(handle_connection, "localhost", 8080):
        print("WebSocket server running at ws://localhost:8080")
        await asyncio.Future()  # Run the server forever

asyncio.run(main())
