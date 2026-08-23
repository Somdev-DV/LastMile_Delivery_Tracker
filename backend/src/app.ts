import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

export const createApp = () => {
  const app = express();

  // Security & HTTP Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    })
  );
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount API routes
  app.use('/api', routes);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
