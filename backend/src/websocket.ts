import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import url from 'url';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  walletAddress?: string;
  isAlive?: boolean;
}

const clients = new Map<string, Set<AuthenticatedWebSocket>>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    // Parse token from query string
    const queryParams = url.parse(req.url || '', true).query;
    const token = queryParams.token as string;

    if (!token) {
      ws.close(4001, 'No authentication token provided');
      return;
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      ws.userId = decoded.userId;
      ws.walletAddress = decoded.walletAddress;
      ws.isAlive = true;

      // Add client to map
      if (!clients.has(ws.userId)) {
        clients.set(ws.userId, new Set());
      }
      clients.get(ws.userId)?.add(ws);

      console.log(`WebSocket connected: ${ws.userId}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established',
        userId: ws.userId,
      }));

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          handleWebSocketMessage(ws, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle pong (heartbeat)
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle disconnect
      ws.on('close', () => {
        if (ws.userId) {
          const userClients = clients.get(ws.userId);
          userClients?.delete(ws);
          if (userClients?.size === 0) {
            clients.delete(ws.userId);
          }
          console.log(`WebSocket disconnected: ${ws.userId}`);
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(4001, 'Invalid authentication token');
    }
  });

  // Heartbeat to detect broken connections
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // 30 seconds

  wss.on('close', () => {
    clearInterval(heartbeat);
  });
}

function handleWebSocketMessage(ws: AuthenticatedWebSocket, message: any) {
  switch (message.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    case 'subscribe':
      // Handle channel subscriptions
      console.log(`User ${ws.userId} subscribed to ${message.channel}`);
      break;

    case 'unsubscribe':
      // Handle channel unsubscriptions
      console.log(`User ${ws.userId} unsubscribed from ${message.channel}`);
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

// Send message to specific user
export function sendToUser(userId: string, data: any) {
  const userClients = clients.get(userId);
  if (userClients) {
    const message = JSON.stringify(data);
    userClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}

// Broadcast message to all connected clients
export function broadcast(data: any) {
  const message = JSON.stringify(data);
  clients.forEach((userClients) => {
    userClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  });
}

// Send message to multiple users
export function sendToUsers(userIds: string[], data: any) {
  userIds.forEach((userId) => {
    sendToUser(userId, data);
  });
}

