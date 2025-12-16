import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';

import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext } from './context';
import { setupWebSocket } from './websocket';
import { setupRoutes } from './routes';

dotenv.config();

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  setupWebSocket(wss);

  // Middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }));
  
  app.use(morgan('dev'));
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Ensure uploads directory exists (match the path used in multer)
  // Multer uses: path.join(__dirname, '../../uploads') from routes/upload.ts
  // When compiled, __dirname is backend/dist, so '../../uploads' = backend/uploads
  // When running from src, __dirname is backend/src, so '../../uploads' = backend/uploads
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  }
  
  console.log('Serving static files from:', uploadsDir);
  console.log('Uploads directory exists:', fs.existsSync(uploadsDir));
  
  // Serve uploaded files statically with proper CORS headers
  // Use a custom middleware to set CORS headers before serving static files
  app.use('/uploads', (req, res, next): void => {
    // Get the origin from the request
    const origin = req.headers.origin;
    // Allow requests from any localhost port or the configured CORS_ORIGIN
    // In development, allow all localhost origins
    const allowedOrigin = origin && (
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') ||
      origin === CORS_ORIGIN
    ) ? origin : CORS_ORIGIN;
    
    // Set CORS headers for all requests to /uploads
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // These headers help with cross-origin resource sharing
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });
  
  // Now serve static files with additional headers
  app.use('/uploads', express.static(uploadsDir, {
    setHeaders: (res, filePath) => {
      // Set CORS headers again in setHeaders (static middleware runs after our middleware)
      const origin = (res as any).req?.headers?.origin;
      const allowedOrigin = origin && (
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin === CORS_ORIGIN
      ) ? origin : CORS_ORIGIN;
      
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      
      // Cache images for 1 year
      if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png') || filePath.endsWith('.gif') || filePath.endsWith('.webp')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    },
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Setup REST routes
  setupRoutes(app);

  // Apollo GraphQL Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        path: error.path,
      };
    },
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => createContext(req),
    })
  );

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || 'Internal server error',
        code: err.code || 'INTERNAL_ERROR',
      },
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

