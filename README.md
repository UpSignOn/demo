# UpSignOn Demo

This repo is a working example of how you can add UpSignOn compatibility to your project.

If you don't know what UpSignOn is, check: https://upsignon.eu/en/sites/
The technical documentation can be found here: https://upsignon.github.io/documentation/index.html

## What is this repo ?

This is our actual demo. It implements the stuff described in the documentation, but not everything.

This codebase powers our 2 demo websites with which you can play:

- https://monptitshop.upsignon.eu/
- https://raoul.upsignon.eu

## Stack

- Server written with Node.js and Express.
- PostgreSQL database
  - TABLE demo_users
    - id (uuid)
    - login (text, used for standard login/password connection, will store emails in this case)
    - password_hash (text, stores a salted hash of user password generated with bcrypt)
    - token (uuid, used in UpSignOn connection flow)
    - token_created_at (date, used to validate token)
    - data (text, stores stringified JSON object)
    - created_at (date)
  - TABLE demo_session
    - session_id
    - session_data
    - expiration_time
- Front : vanilla JS => do not use for your project ;)
