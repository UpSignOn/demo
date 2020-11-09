import express from 'express';
import { db } from '../helpers/db-connection';
import { v4 as uuidv4 } from 'uuid';

import { passwordHash } from '../helpers/passwordHash';
import env from '../helpers/env';

export const classicFlowRouter = express.Router();

classicFlowRouter.post('/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) return res.status(401).end();
    let dbRes;
    try {
      dbRes = await db.query('SELECT id, password_hash FROM demo_users WHERE login=$1 OR id=$1', [
        email,
      ]);
    } catch {
      // do nothing
    }
    if (!dbRes || dbRes.rowCount === 0) return res.status(401).end();
    const isOK: boolean = await passwordHash.isOk(password, dbRes.rows[0].password_hash);
    if (!isOK) return res.status(401).end();
    if (req.session) req.session.userId = dbRes.rows[0].id;
    return res.status(200).end();
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
});

classicFlowRouter.post('/create', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) return res.status(401).end();

    let dbGet;
    try {
      dbGet = await db.query('SELECT id FROM demo_users WHERE login=$1 OR id=$1', [email]);
    } catch {}
    if (!dbGet || dbGet.rowCount !== 0) return res.status(409).end();
    const fakeData = [
      { type: 'firstname', key: 'firstname', value: 'Paul' },
      { type: 'lastname', key: 'lastname', value: 'Latournerie' },
      { type: 'title', key: 'title', value: 'M' },
      { type: 'dateOfBirth', key: 'dateOfBirth', value: '1980-04-26' },
      {
        type: 'email',
        key: 'email1',
        value: { address: 'paull@upsignon.eu', isValidated: false },
      },
      {
        type: 'email',
        key: 'email2',
        value: { address: 'contact@upsignon.eu', isValidated: false },
      },
      {
        type: 'phoneNumber',
        key: 'phoneNumber',
        value: { number: '+33627590702', isValidated: false },
      },
      {
        type: 'postalAddress',
        key: 'deliveryAddress',
        value: [
          {
            streetAddress: '9 rue Jacqueline Auriol',
            postalCode: '31860',
            city: 'Pins-Justaret',
            country: 'France',
            otherInfo: '',
          },
        ],
      },
      {
        type: 'postalAddress',
        key: 'billingAddress',
        value: [
          {
            streetAddress: '9 rue Jacqueline Auriol',
            postalCode: '31860',
            city: 'Pins-Justaret',
            country: 'France',
            otherInfo: '',
          },
        ],
      },
      { type: 'iban', key: 'iban', value: { IBAN: 'GB82WEST12345698765432', BIC: null } },
      {
        type: 'newsletterConsent',
        key: 'newsletterConsent',
        value: { email: true, postal_mail: false, phone: false, sms: true },
      },
    ];
    const newId = uuidv4();
    const hash = await passwordHash.hash(password);
    await db.query(
      'INSERT INTO demo_users (id, login, password_hash, data) VALUES ($1, $2, $3, $4)',
      [newId, email, hash, JSON.stringify(fakeData)],
    );
    if (req.session) req.session.userId = newId;
    return res.status(200).end();
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
});

classicFlowRouter.post('/data', async (req: any, res: any) => {
  try {
    if (!req.session || !req.session.userId) return res.status(401).end();
    let dbRes;
    try {
      dbRes = await db.query('SELECT data FROM demo_users WHERE id=$1', [req.session.userId]);
    } catch {}
    if (!dbRes || dbRes.rowCount !== 1) {
      req.session.destroy();
      return res.status(401).end();
    }
    res
      .status(200)
      .json({ data: JSON.parse(dbRes.rows[0].data) })
      .end();
  } catch (e) {
    console.error(e);
    req.session.destroy();
    res.status(500).end();
  }
});
classicFlowRouter.get('/conversion', async (req: any, res: any) => {
  try {
    if (!req.session || !req.session.userId) {
      req.session.destroy();
      return res.status(401).end();
    }
    const token = uuidv4();
    const createdAt = new Date();
    await db.query('UPDATE demo_users SET token=$1, token_created_at=$2 WHERE id=$3', [
      token,
      createdAt,
      req.session.userId,
    ]);
    if (env.IS_PRODUCTION) {
      res.redirect(
        303,
        `upsignon://protocol/?url=${encodeURIComponent(
          'https://monptitshop.upsignon.eu/demo',
        )}&buttonId=SHOP2&connectionToken=${req.session.userId}:${token}`,
      );
    } else {
      res.redirect(
        303,
        `upsignon://protocol/?url=${
          encodeURIComponent(req.protocol + '://' + req.headers.host) + '/demo'
        }&buttonId=SHOP2&connectionToken=${req.session.userId}:${token}`,
      );
    }
  } catch (e) {
    console.error(e);
    req.session.destroy();
    res.status(500).end();
  }
});

classicFlowRouter.post('/disconnect', async (req: any, res: any) => {
  req.session.destroy();
  res.status(200).end();
});
