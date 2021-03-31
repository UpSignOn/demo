import express from 'express';
import { db } from '../helpers/db-connection';
import { v4 as uuidv4 } from 'uuid';
import { passwordHash } from '../helpers/passwordHash';
import env from '../helpers/env';
import { definitions } from '../helpers/definitions';

export const demoApiRouter = express.Router();

const isTokenExpired = (created_at: Date) => {
  const expirationTime = 60 * 1000; // 1 minute
  return created_at.getTime() < new Date().getTime() - expirationTime;
};

const checkPassword = async (userId: string, password: string): Promise<boolean> => {
  try {
    if (!password) return false;
    let dbRes;
    try {
      dbRes = await db.query('SELECT password_hash FROM demo_users WHERE id=$1', [userId]);
    } catch {}
    if (!dbRes || dbRes.rowCount === 0) return false;
    const isOk: boolean = await passwordHash.isOk(password, dbRes.rows[0].password_hash);
    return isOk;
  } catch {
    return false;
  }
};

demoApiRouter.get('/config', async (req, res) => {
  try {
    const lang = req.query.lang;
    const isRaoul = env.BASE_URL.indexOf('raoul') !== -1;
    const isMonptitshop = env.BASE_URL.indexOf('monptitshop') !== -1;

    if (isRaoul) {
      return res.status(200).json(definitions.raoul.config);
    } else if (isMonptitshop) {
      return res.status(200).json(definitions.monptitshop.config);
    } else {
      return res.status(200).json(definitions.mapaye.config);
    }
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.get('/button-config', async (req, res) => {
  try {
    const buttonId = req.query.buttonId;

    let buttonConfig;
    switch (buttonId) {
      case definitions.monptitshop.button1.name: {
        buttonConfig = definitions.monptitshop.button1.config;
        break;
      }
      case definitions.monptitshop.button2.name: {
        buttonConfig = definitions.monptitshop.button2.config;
        break;
      }
      case definitions.raoul.button1.name: {
        buttonConfig = definitions.raoul.button1.config;
        break;
      }
      case definitions.raoul.button2.name: {
        buttonConfig = definitions.raoul.button2.config;
        break;
      }
      case definitions.mapaye.button1.name: {
        buttonConfig = definitions.mapaye.button1.config;
        break;
      }
      case definitions.mapaye.button2.name: {
        buttonConfig = definitions.mapaye.button2.config;
        break;
      }
      default:
        return res.status(404).end();
    }
    return res.status(200).json(buttonConfig);
  } catch (e) {
    console.error(e);
    res.status(404).end();
  }
});

demoApiRouter.post('/create-account', async (req, res) => {
  try {
    const password = req.body.password;
    if (!password) return res.status(400).end();
    const data = req.body.data || [];
    const id = uuidv4();
    const hash = await passwordHash.hash(password);
    const email1 = data.find((d: any) => d.key === 'email1');
    const login = email1?.value?.address;
    if (!login) return res.status(403).json({ message: 'email address is empty' });
    // TODO ? prevent adding a user with an email that is already registered (but allow monptitshop and raoul to their own users)
    // const existingUserSearch = await db.query('SELECT COUNT(*) FROM demo_users WHERE login=$1', [
    //   login,
    // ]);
    // if (parseInt(existingUserSearch.rows[0].count) > 0)
    //   return res.status(403).json({ message: 'Un compte avec cet email existe déjà.' });
    await db.query(
      'INSERT INTO demo_users (id, login, password_hash, data) VALUES ($1, $2, $3, $4)',
      [id, login, hash, JSON.stringify(data)],
    );
    res.status(200).json({ userId: id });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post('/export-account', async (req: any, res: any) => {
  try {
    const password = req.body.currentPassword;
    const login = req.body.currentLogin;
    const connectionToken = req.body.connectionToken;
    const newPassword = req.body.newPassword;
    if (!newPassword) return res.status(400).end();
    if ((!login || !password) && !connectionToken) return res.status(400).end();
    if (!!login && !!password && !!connectionToken) return res.status(400).end();

    let userId;
    let userData;
    if (!!login && !!password) {
      let dbRes;
      try {
        dbRes = await db.query('SELECT id, data, password_hash FROM demo_users WHERE login=$1', [
          login,
        ]);
      } catch {}
      if (!dbRes || dbRes.rowCount === 0) return res.status(401).end();
      const isPasswordOK = await passwordHash.isOk(password, dbRes.rows[0].password_hash);
      if (!isPasswordOK) return res.status(401).end();
      userId = dbRes.rows[0].id;
      userData = dbRes.rows[0].data;
    } else {
      const [id, token] = connectionToken.split(':');
      if (!id || !token) return res.status(401).end();
      let currentRes;
      try {
        currentRes = await db.query(
          'SELECT data, token_created_at FROM demo_users WHERE id=$1 AND token=$2',
          [id, token],
        );
      } catch {}
      if (!currentRes || currentRes.rowCount === 0) return res.status(401).end();
      // do not check for token expired during the export step.
      // if(isTokenExpired(currentRes.rows[0].token_created_at)) return res.status(401).end();
      await db.query('UPDATE demo_users SET token=null, token_created_at=null WHERE id=$1', [id]);
      userId = id;
      userData = currentRes.rows[0].data;
    }
    const hash = await passwordHash.hash(newPassword);
    await db.query('UPDATE demo_users SET password_hash=$1 WHERE id=$2', [hash, userId]);
    res.status(200).json({
      userId,
      userData: userData ? JSON.parse(userData) : [],
    });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post('/connect', async (req, res) => {
  try {
    const password = req.body.password;
    const id = req.body.userId;
    const buttonId = req.body.buttonId;
    if (!id) return res.status(401).end();
    if (!password) return res.status(401).end();

    const isOk = await checkPassword(id, password);
    if (!isOk) return res.status(401).end();

    const connectionToken = uuidv4();
    try {
      await db.query('UPDATE demo_users SET token=$1, token_created_at=$2 WHERE id=$3', [
        connectionToken,
        new Date(),
        id,
      ]);
    } catch {
      return res.status(400).end();
    }
    let redirectionUri;
    if (env.IS_PRODUCTION) {
      switch (buttonId) {
        default:
          redirectionUri = env.BASE_URL + '/demo/redirection/';
      }
    } else {
      redirectionUri = `${req.protocol}://${req.headers.host}/demo/redirection/`;
    }
    res.status(200).json({ connectionToken, redirectionUri });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.get('/redirection/', async (req: any, res: any) => {
  try {
    const userId = req.query.userId;
    const connectionToken = req.query.connectionToken;
    if (!userId || !connectionToken) return res.status(404).end();
    let dbRes;
    try {
      dbRes = await db.query('SELECT token_created_at FROM demo_users WHERE id=$1 AND token=$2', [
        userId,
        connectionToken,
      ]);
    } catch {}
    if (!dbRes || dbRes.rowCount !== 1) return res.status(401).end(); // TODO ERROR PAGE
    if (isTokenExpired(dbRes.rows[0].token_created_at)) return res.status(401).end(); // TODO ERROR PAGE
    await db.query('UPDATE demo_users SET token=null, token_created_at=null WHERE id=$1', [userId]);

    req.session.userId = userId;
    if (env.IS_PRODUCTION) {
      res.redirect(303, env.BASE_URL);
    } else {
      res.redirect(303, `${req.protocol}://${req.headers.host}`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post('/update-password', async (req, res) => {
  try {
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const id = req.body.userId;
    if (!id || !newPassword) return res.status(400).end();

    const isOk = await checkPassword(id, password);
    if (isOk) {
      const newPasswordHash = await passwordHash.hash(newPassword);
      await db.query('UPDATE demo_users SET password_hash=$1 WHERE id=$2', [newPasswordHash, id]);
      res.status(200).end();
    } else {
      const isNewPasswordOK = await checkPassword(id, newPassword);
      if (isNewPasswordOK) return res.status(200).end();
      return res.status(401).end();
    }
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post('/update-data', async (req, res) => {
  try {
    const id = req.body.userId;
    const password = req.body.password;
    const data = req.body.data;
    if (!id || !data) return res.status(400).end();
    if (!password) return res.status(401).end();

    const isOk = await checkPassword(id, password);
    if (!isOk) return res.status(401).end();

    await db.query('UPDATE demo_users SET data=$1 WHERE id=$2', [JSON.stringify(data), id]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post('/delete-account-and-data', async (req, res) => {
  try {
    const password = req.body.password;
    const id = req.body.userId;
    if (!id) return res.status(400).end();
    if (!password) return res.status(401).end();
    let dbRes;
    try {
      dbRes = await db.query('SELECT password_hash FROM demo_users WHERE id=$1', [id]);
    } catch {}
    if (!dbRes || dbRes.rowCount === 0) return res.status(200).json({ deletionStatus: 'DONE' });
    const isOk: boolean = await passwordHash.isOk(password, dbRes.rows[0].password_hash);
    if (!isOk) return res.status(401).end();
    await db.query('DELETE FROM demo_users WHERE id=$1', [id]);
    res.status(200).json({ deletionStatus: 'DONE' });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post('/get-account-deletion-status', async (req, res) => {
  try {
    const password = req.body.password;
    const id = req.body.userId;
    if (!id) return res.status(400).end();
    if (!password) return res.status(401).end();
    let dbRes;
    try {
      dbRes = await db.query('SELECT password_hash FROM demo_users WHERE id=$1', [id]);
    } catch {}
    if (!dbRes || dbRes.rowCount === 0) return res.status(200).json({ deletionStatus: 'DONE' });
    const isOk: boolean = await passwordHash.isOk(password, dbRes.rows[0].password_hash);
    if (!isOk) return res.status(401).end();
    res.status(200).json({ deletionStatus: 'PENDING' });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
