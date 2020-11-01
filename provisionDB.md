psql upsignon

CREATE TABLE IF NOT EXISTS demo_users (
id varchar(36),
login varchar(60),
password_hash char(60),
token uuid,
token_created_at timestamp(0) without time zone,
data text,
created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP(0)
);

CREATE TABLE IF NOT EXISTS demo_sessions (
session_id varchar PRIMARY KEY,
session_data varchar,
expiration_time timestamp(0) NOT NULL
);
