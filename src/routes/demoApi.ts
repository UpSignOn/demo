import express from "express";
import { db } from "../helpers/db-connection";
import { v4 as uuidv4 } from "uuid";

import { passwordHash } from "../helpers/passwordHash";
import env from "../helpers/env";
// @ts-ignore
import session from "express-session";
const SessionStore = require("../helpers/sessionStore")(session);

export const demoApiRouter = express.Router();
const sessionParams = {
  cookie: {
    path: "/",
    httpOnly: true,
    maxAge: 86400000, // one day
    sameSite: true,
    secure: env.IS_PRODUCTION
  },
  name: "demo.upsignon.session",
  secret: env.SESSION_KEY_SECRET,
  resave: false,
  saveUninitialized: false,
  unset: "destroy",
  store: new SessionStore()
};

demoApiRouter.use(session(sessionParams));


const CONFIG_VERSION = "1";

// [
//   { type: "firstname", key: "firstname", value: "FakeFirstname" },
//   { type: "lastname", key: "lastname", value: "FakeLastname" },
//   { type: "title", key: "title", value: "M" },
//   { type: "dateOfBirth", key: "dateOfBirth", value: "2000-07-14" },
//   { type: "email", key: "email1", value: "fake-perso@email.fr" },
//   { type: "email", key: "email2", value: "fake-pro@email.fr" },
//   { type: "phoneNumber", key: "phoneNumber", value: "+33911911911" },
//   {
//     type: "postalAddress",
//     key: "deliveryAddress",
//     value: [
//       {
//         streetAddress: "42, rue UpSignOn Démo\nTest",
//         postalCode: "4242",
//         city: "UpSignOn City",
//         country: "dataSmine",
//         otherInfo: "code 1984",
//       },
//       {
//         streetAddress: "24, avenue dataSmine",
//         postalCode: "2424",
//         city: "Tatooine",
//         country: "Web",
//         otherInfo: "two suns",
//       },
//     ],
//   },
//   {
//     type: "postalAddress",
//     key: "billingAddress",
//     value: [
//       {
//         streetAddress: "Billing Address",
//         postalCode: "4242",
//         city: "Comptable City",
//         country: "Pognon",
//       },
//     ],
//   },
//   { type: "iban", key: "iban", value: { IBAN: "GB82WEST12345698765432", BIC: null } },
//   {
//     type: "newsletterConsent",
//     key: "newsletterConsent",
//     value: { email: true, postal_mail: false, phone: false, sms: true },
//   },
// ],

const isTokenExpired = (created_at: Date) => {
  const expirationTime = 60 * 1000; // 1 minute
  return created_at.getTime() < new Date().getTime() - expirationTime;
};

const checkPassword = async (userId:string, password: string): Promise<boolean>=>{
  try {
    if (!password) return false;
    const dbRes = await db.query("SELECT password_hash, password_salt FROM demo_users WHERE id=$1", [userId]);
    if (dbRes.rowCount === 0) return false;
    const isOk: boolean = await passwordHash.isOk(password+dbRes.rows[0].password_salt, dbRes.rows[0].password_hash);
    return isOk;
  }catch {
    return false;
  }
}


demoApiRouter.get("/config", async (req, res) => {
  try {
    const lang = req.query.lang;
    return res.status(200).json({
      version: CONFIG_VERSION,
      legalTerms: [
        {
          id: "1",
          date: "2020-01-01",
          link: "https://upsignon.eu/terms-of-service/fr/20200209.pdf",
          translatedText: "CGU",
        },
      ],
      fields: [
        { type: "firstname", key: "firstname", mandatory: true },
        { type: "lastname", key: "lastname", mandatory: true },
        { type: "title", key: "title", mandatory: false },
        { type: "dateOfBirth", key: "dateOfBirth", mandatory: false },
        { type: "email", key: "email1", mandatory: true, variant: "custom", customLabel: "Email perso" },
        { type: "email", key: "email2", mandatory: false, variant: "custom", customLabel: "Email pro" },
        { type: "phoneNumber", key: "phoneNumber", mandatory: true },
        {
          type: "postalAddress",
          key: "deliveryAddress",
          mandatory: true,
          variant: "custom",
          customLabel: "Delivery address",
        },
        {
          type: "postalAddress",
          key: "billingAddress",
          mandatory: false,
          variant: "custom",
          customLabel: "Billing address",
        },
        { type: "iban", key: "iban", mandatory: false },
        { type: "newsletterConsent", key: "newsletterConsent", mandatory: false },
      ],
    });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.get("/button-config", async (req, res) => {
  try {
    const buttonId = req.query.buttonId;
    let buttonConfig;
    switch (buttonId) {
      case "SHOP": {
        buttonConfig = {
          fields: [
            { type: "firstname", key: "firstname", mandatory: true },
            { type: "lastname", key: "lastname", mandatory: true },
            { type: "title", key: "title", mandatory: false },
            { type: "dateOfBirth", key: "dateOfBirth", mandatory: false },
            { type: "email", key: "email1", mandatory: true },
            { type: "email", key: "email2", mandatory: false },
            { type: "phoneNumber", key: "phoneNumber", mandatory: true },
            { type: "postalAddress", key: "deliveryAddress", mandatory: true },
            { type: "postalAddress", key: "billingAddress", mandatory: false },
            { type: "iban", key: "iban", mandatory: false },
            { type: "newsletterConsent", key: "newsletterConsent", mandatory: false },
          ],
          forceFormDisplay: true,
          generalConfigVersion: CONFIG_VERSION,
        };
        break;
      }
      case "SHOP2": {
        buttonConfig = {
          fields: [],
          forceFormDisplay: false,
          generalConfigVersion: CONFIG_VERSION,
        };
        break;
      }
      case "RAOUL": {
        buttonConfig = {
          fields: [
            { type: "firstname", key: "firstname", mandatory: true },
            { type: "lastname", key: "lastname", mandatory: true },
            { type: "email", key: "email1", mandatory: true },
            { type: "phoneNumber", key: "phoneNumber", mandatory: true },
            { type: "dateOfBirth", key: "dateOfBirth", mandatory: false },
          ],
          forceFormDisplay: true,
          generalConfigVersion: CONFIG_VERSION,
        };
        break;
      }
      case "RAOUL2": {
        buttonConfig = {
          fields: [],
          forceFormDisplay: false,
          generalConfigVersion: CONFIG_VERSION,
        };
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

demoApiRouter.post("/create-account", async (req, res) => {
  try {
    const password = req.body.password;
    if (!password) return res.status(400).end();
    const data = req.body.data||[];
    const id = uuidv4();
    const salt = uuidv4();
    const hash = await passwordHash.hash(password+salt);
    const email1 = data.find((d:any)=>d.key === "email1");
    const login = email1?.value?.address;
    if(!login) return res.status(403).json({message: "email address is empty"});
    await db.query(
      "INSERT INTO demo_users (id, login, password_hash, password_salt, data) VALUES ($1, $2, $3, $4, $5)",
      [id, login, hash, salt, JSON.stringify(data)]);
    res.status(200).json({ userId: id });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post("/convert-account", async (req, res) => {
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
    if(!!login && !!password) {
      const dbRes = await db.query("SELECT id, data, password_hash, password_salt FROM demo_users WHERE login=$1", [login]);
      if(dbRes.rowCount === 0) return res.status(401).end();
      const isPasswordOK = await passwordHash.isOk(password+dbRes.rows[0].password_salt, dbRes.rows[0].password_hash);
      if(!isPasswordOK) return res.status(401).end();
      userId=dbRes.rows[0].id;
      userData=dbRes.rows[0].data;
    } else {
      const [id, token] = connectionToken.split(':');
      if(!id || !token) return res.status(401).end();
      const currentRes = await db.query("SELECT data, token_created_at FROM demo_users WHERE id=$1 AND token=$2", [id,token]);
      if(currentRes.rowCount === 0) return res.status(401).end();
      if(isTokenExpired(currentRes.rows[0].token_created_at)) return res.status(401).end();
      userId = id;
      userData = currentRes.rows[0].data;
    }
    const newSalt = uuidv4();
    const hash = await passwordHash.hash(newPassword+newSalt);
    await db.query("UPDATE demo_users SET password_hash=$1, password_salt=$2 WHERE id=$3", [hash, newSalt, userId]);
    res.status(200).json({
      userId,
      userData: JSON.parse(userData) || []
    });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post("/connect", async (req, res) => {
  try {
    const password = req.body.password;
    const id = req.body.userId;
    const buttonId = req.body.buttonId;
    if (!id) return res.status(401).end();
    if (!password) return res.status(401).end();

    const isOk = await checkPassword(id, password);
    if(!isOk) return res.status(401).end();

    const connectionToken = uuidv4();
    await db.query("UPDATE demo_users SET token=$1, token_created_at=$2 WHERE id=$3", [connectionToken, new Date(), id]);
    let redirectionUri;
    if(env.IS_PRODUCTION) {
      switch(buttonId) {
        default:
          redirectionUri = "https://monptitshop.upsignon.eu/demo/redirection/";
      }
    }else {
      redirectionUri = `${req.protocol}://${req.headers.host}/demo/redirection/`;
    }
    res.status(200).json({ connectionToken, redirectionUri });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.get("/redirection/", async (req:any, res:any) => {
  try {
    const userId = req.query.userId;
    const connectionToken = req.query.connectionToken;
    if(!userId ||!connectionToken) return res.status(404).end();
    const dbRes = await db.query("SELECT token_created_at FROM demo_users WHERE id=$1 AND token=$2", [userId, connectionToken]);
    if(dbRes.rowCount !==1) return res.status(401).end(); // TODO ERROR PAGE
    if(isTokenExpired(dbRes.rows[0].token_created_at)) return res.status(401).end();// TODO ERROR PAGE
    await db.query("UPDATE demo_users SET token=null, token_created_at=null WHERE id=$1", [userId]);

    req.session.userId = userId;
    if(env.IS_PRODUCTION) {
      res.redirect(303, "https://monptitshop.upsignon.eu");
    }else {
      res.redirect(303, `${req.protocol}://${req.headers.host}`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post("/update-password", async (req, res) => {
  try {
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const id = req.body.userId;
    if (!id || !newPassword) return res.status(400).end();

    const isOk = await checkPassword(id, password);
    if(!isOk) return res.status(401).end();

    const newSalt = uuidv4();
    const newPasswordHash = await passwordHash.hash(newPassword+newSalt);
    await db.query("UPDATE demo_users SET password_hash=$1, password_salt=$2 WHERE id=$3", [newPasswordHash, newSalt, id]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post("/update-data", async (req, res) => {
  try {
    const id = req.body.userId;
    const password = req.body.password;
    const data = req.body.data;
    if (!id||!data) return res.status(400).end();
    if (!password) return res.status(401).end();

    const isOk = await checkPassword(id, password);
    if(!isOk) return res.status(401).end();

    await db.query("UPDATE demo_users SET data=$1 WHERE id=$2", [JSON.stringify(data), id]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post("/delete-account-and-data", async (req, res) => {
  try {
    const password = req.body.password;
    const id = req.body.userId;
    if (!id) return res.status(400).end();
    if (!password) return res.status(401).end();
    const dbRes = await db.query("SELECT password_hash, password_salt FROM demo_users WHERE id=$1", [id]);
    if (dbRes.rowCount === 0) return res.status(200).json({ deletionStatus: "DONE" });
    const isOk:boolean  = await passwordHash.isOk(password+dbRes.rows[0].password_salt, dbRes.rows[0].password_hash);
    if (!isOk) return res.status(401).end();
    await db.query("DELETE FROM demo_users WHERE id=$1", [id]);
    res.status(200).json({ deletionStatus: "DONE" });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post("/get-account-deletion-status", async (req, res) => {
  try {
  const password = req.body.password;
  const id = req.body.userId;
  if (!id) return res.status(400).end();
  if (!password) return res.status(401).end();
  const dbRes = await db.query("SELECT password_hash, password_salt FROM demo_users WHERE id=$1", [id]);
  if (dbRes.rowCount === 0) return res.status(200).json({ deletionStatus: "DONE" });
  const isOk:boolean  = await passwordHash.isOk(password+dbRes.rows[0].password_salt, dbRes.rows[0].password_hash);
  if (!isOk) return res.status(401).end();
  res.status(200).json({ deletionStatus: "PENDING" });
  }catch(e) {
    console.error(e);
    res.status(500).end();
  }
});

demoApiRouter.post("/data", async (req:any, res:any) => {
  try {
    if (!req.session || !req.session.userId) return res.status(401).end();
    const dbRes = await db.query("SELECT data FROM demo_users WHERE id=$1",[req.session.userId]);
    if(dbRes.rowCount !== 1) return res.status(401).end();
    res
      .status(200)
      .json(JSON.parse(dbRes.rows[0].data))
      .end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
demoApiRouter.post("/disconnect", async (req:any, res:any) => {
  req.session.destroy();
  res.status(200).end();
});
