import express from 'express';
import { startServer } from './helpers/serverProcess';
import { demoApiRouter } from './routes/demoApi';
import { classicFlowRouter } from './routes/classicFlow';
import session from 'express-session';
import env from './helpers/env';
import sessionStoreModule from './helpers/sessionStore';

const SessionStore = sessionStoreModule(session);

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '3Mb' }));
app.use(express.urlencoded({ extended: true }));

const sessionParams = {
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 86400000, // one day
    sameSite: true,
    secure: env.IS_PRODUCTION,
  },
  name: 'demo.upsignon.session',
  secret: env.SESSION_KEY_SECRET,
  resave: false,
  saveUninitialized: false,
  unset: 'destroy',
  store: new SessionStore(),
};

// @ts-ignore
app.use(session(sessionParams));

app.use('/demo', demoApiRouter);
app.use('/classic', classicFlowRouter);
app.use('/', express.static(env.PUBLIC_PATH));

if (module === require.main) {
  startServer(app);
}

module.exports = app;
