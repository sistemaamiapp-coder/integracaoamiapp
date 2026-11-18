-- Contas, membros e sessões do AMI Integração.
-- Senhas: salt (8 bytes hex) + SHA-256 de "salt:senha". Nada em texto puro.
CREATE TABLE app.ami_users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL,
  units jsonb NOT NULL,
  salt text NOT NULL,
  pass_hash text NOT NULL,
  added_at timestamptz NOT NULL,
  added_by text NOT NULL,
  deleted_at timestamptz
);

CREATE TABLE app.ami_members (
  id text PRIMARY KEY,
  name text NOT NULL,
  unit text NOT NULL,
  status text NOT NULL,
  ministry text NOT NULL,
  birth text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  baptized boolean NOT NULL,
  peniel boolean NOT NULL,
  wants_work boolean NOT NULL,
  joined text NOT NULL,
  address text NOT NULL,
  notes text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX ami_members_unit_idx ON app.ami_members (unit);

CREATE TABLE app.ami_sessions (
  token_digest text PRIMARY KEY,
  user_id text NOT NULL REFERENCES app.ami_users (id),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);
CREATE INDEX ami_sessions_user_idx ON app.ami_sessions (user_id);

CREATE TABLE app.ami_login_limiter (
  key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  attempt_count integer NOT NULL
);
