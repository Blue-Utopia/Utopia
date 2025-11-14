import { Express } from 'express';
import authRoutes from './auth';
import uploadRoutes from './upload';
import twilioRoutes from './twilio';

export function setupRoutes(app: Express) {
  app.use('/api/auth', authRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/twilio', twilioRoutes);
}

