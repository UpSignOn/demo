import env from './env';
import { db } from './db-connection';
import https from 'https';
import fs from 'fs';

export const startServer = (app: any) => {
  if (env.IS_PRODUCTION) {
    // Set express trust-proxy so that secure sessions cookies can work
    app.set('trust proxy', 1);
    const options = {
      key: fs.readFileSync(env.CERTIFICATE_DIR_PATH + '/server.key'),
      cert: fs.readFileSync(env.CERTIFICATE_DIR_PATH + '/server.crt'),
    };
    const server = https.createServer(options, app).listen(env.PORT, () => {
      console.log('Production server listening', server.address());
    });
    listenForGracefulShutdown(server);
  } else {
    const server = app.listen(8888, () => {
      console.log(`Dev server listening`, server.address());
    });
    listenForGracefulShutdown(server);
  }
};

const listenForGracefulShutdown = (server: any) => {
  process.on('SIGINT', () => {
    server.close(() => {
      console.log('Graceful shutdown');
      db.gracefulShutdown().then(() => {
        process.exit();
      });
    });
  });
};
