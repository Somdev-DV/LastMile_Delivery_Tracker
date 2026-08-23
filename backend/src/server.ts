import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 Last-Mile Delivery Tracker Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`🔗 Health check available at http://localhost:${env.PORT}/api/health`);
});
