import { db } from './db-connection';
const oneDay = 86400; // seconds

export default function (session: any): any {
  const Store = session.Store;

  function getTimestampSeconds(date?: any) {
    if (!date) {
      return Math.floor(Date.now() / 1000);
    }
    return Math.floor(new Date(date).getTime() / 1000);
  }

  function dbCleanup() {
    const now = getTimestampSeconds();
    db.query('DELETE FROM demo_sessions WHERE to_timestamp($1) > expiration_time', [
      now,
    ]).catch(() => {});
  }

  function PostgreSQLStore(this: any) {
    Store.call(this, {});
    dbCleanup();
    setInterval(dbCleanup, oneDay * 1000);
  }

  // Inherit from Store
  PostgreSQLStore.prototype = Object.create(Store.prototype);
  PostgreSQLStore.prototype.constructor = PostgreSQLStore;

  PostgreSQLStore.prototype.get = function (
    sid: string,
    cb: (err?: Error | null, session?: any) => void,
  ) {
    const now = getTimestampSeconds();
    db.query(
      'SELECT session_data FROM demo_sessions WHERE session_id = $1::text AND to_timestamp($2) <= expiration_time',
      [sid, now],
    )
      .then(function (res) {
        if (res.rowCount === 0) {
          return cb();
        }
        return cb(null, JSON.parse(res.rows[0].session_data));
      })
      .catch(cb);
  };

  PostgreSQLStore.prototype.set = function (
    sid: string,
    session: { cookie: { maxAge: number } },
    cb: (err?: Error) => void,
  ) {
    const maxAge = Math.floor(session.cookie.maxAge / 1000);
    const now = getTimestampSeconds();
    const expiration_time = maxAge ? now + maxAge : now + oneDay;

    db.query(
      'INSERT INTO demo_sessions (session_id, session_data, expiration_time) VALUES ($1, $2, to_timestamp($3)) ON CONFLICT (session_id) DO UPDATE SET session_data=$2, expiration_time=to_timestamp($3)',
      [sid, JSON.stringify(session), expiration_time],
    )
      .then(function () {
        cb();
      })
      .catch(cb);
  };

  PostgreSQLStore.prototype.destroy = function (sid: string, cb: (err?: Error) => void) {
    db.query('DELETE FROM demo_sessions WHERE session_id = $1', [sid])
      .then(function () {
        if (cb) cb();
      })
      .catch(cb);
  };

  PostgreSQLStore.prototype.touch = function (
    sid: string,
    session: { cookie: { expires: number } },
    cb: (err?: Error) => void,
  ) {
    if (session && session.cookie && session.cookie.expires) {
      const now = getTimestampSeconds();
      const cookieExpires = getTimestampSeconds(session.cookie.expires);
      db.query(
        'UPDATE demo_sessions SET expiration_time=to_timestamp($1) WHERE session_id = $2 AND to_timestamp($3) <= expiration_time',
        [cookieExpires, sid, now],
      )
        .then(function () {
          cb();
        })
        .catch(cb);
    } else {
      cb();
    }
  };

  return PostgreSQLStore;
}
