import express from "express";
import { db } from "../helpers/db-connection";
import { v4 as uuidv4 } from "uuid";

import { passwordHash } from "../helpers/passwordHash";

export const classicFlowRouter = express.Router();

classicFlowRouter.post("/login", async(req, res)=>{
  try {
    const email = req.body.email;
    const password = req.body.password;
    if(!email || !password) return res.status(401).end();
    const dbRes = await db.query("SELECT id, password_hash FROM demo_users WHERE login=$1 OR id=$1", [email]);
    if(dbRes.rowCount === 0) return res.status(401).end();
    const isOK:boolean = await passwordHash.isOk(password, dbRes.rows[0].password_hash);
    if (!isOK) return res.status(401).end();
    // @ts-ignore
    req.session.userId = dbRes.rows[0].id;
    return res.status(200).end();
  }catch(e){
    console.error(e);
    return res.status(500).end();
  }
});

classicFlowRouter.post("/create", async(req, res)=>{
  try {
    const email = req.body.email;
    const password = req.body.password;
    if(!email || !password) return res.status(401).end();

    var dbGet = await db.query("SELECT id FROM demo_users WHERE login=$1 OR id=$1", [email]);
    if(dbGet.rowCount!== 0) return res.status(409).end();
    var fakeData = [
      { type: "firstname", key: "firstname", value: "FakeFirstname" },
      { type: "lastname", key: "lastname", value: "FakeLastname" },
      { type: "title", key: "title", value: "M" },
      { type: "dateOfBirth", key: "dateOfBirth", value: "2000-07-14" },
      { type: "email", key: "email1", value: {address: "fake-perso@email.fr", isValidated: false} },
      { type: "email", key: "email2", value: {address: "fake-pro@email.fr", isValidated: false} },
      { type: "phoneNumber", key: "phoneNumber", value: {number: "+33911911911", isValidated: false} },
      {
        type: "postalAddress",
        key: "deliveryAddress",
        value: [
          {
            streetAddress: "42, rue UpSignOn Démo\nTest",
            postalCode: "4242",
            city: "UpSignOn City",
            country: "dataSmine",
            otherInfo: "code 1984",
          },
          {
            streetAddress: "24, avenue dataSmine",
            postalCode: "2424",
            city: "Tatooine",
            country: "Web",
            otherInfo: "two suns",
          },
        ],
      },
      {
        type: "postalAddress",
        key: "billingAddress",
        value: [
          {
            streetAddress: "Billing Address",
            postalCode: "4242",
            city: "Comptable City",
            country: "BillingCity",
          },
        ],
      },
      { type: "iban", key: "iban", value: { IBAN: "GB82WEST12345698765432", BIC: null } },
      {
        type: "newsletterConsent",
        key: "newsletterConsent",
        value: { email: true, postal_mail: false, phone: false, sms: true },
      },
    ];
    var newId = uuidv4();
    var hash = await passwordHash.hash(password);
    await db.query("INSERT INTO demo_users (id, login, password_hash, data) VALUES ($1, $2, $3, $4)", [newId, email, hash, JSON.stringify(fakeData)]);
    // @ts-ignore
    req.session.userId = newId;
    return res.status(200).end();
  }catch(e){
    console.error(e);
    return res.status(500).end();
  }
});


classicFlowRouter.post("/data", async (req:any, res:any) => {
  try {
    if (!req.session || !req.session.userId) return res.status(401).end();
    const token=uuidv4();
    const createdAt = new Date();
    const dbRes = await db.query("UPDATE demo_users SET token=$1, token_created_at=$2 WHERE id=$3 RETURNING data",[token, createdAt, req.session.userId]);
    if(dbRes.rowCount !== 1) return res.status(401).end();
    res
      .status(200)
      .json({data: JSON.parse(dbRes.rows[0].data), connectionToken: `${req.session.userId}:${token}`})
      .end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
classicFlowRouter.post("/disconnect", async (req:any, res:any) => {
  req.session.destroy();
  res.status(200).end();
});
