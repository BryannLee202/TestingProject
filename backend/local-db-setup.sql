-- Run this once against a local PostgreSQL server to prepare the database
-- for the YiYi Book backend.
--
-- Unlike MySQL, Postgres can't create a database and then immediately use
-- it in the same script/connection, and CREATE DATABASE / CREATE ROLE have
-- no "IF NOT EXISTS" clause - re-running this after the first successful
-- run is expected to error with "already exists", which is fine to ignore.

-- Step 1: connect to the default "postgres" maintenance database
-- (e.g. `psql -U postgres`, or pgAdmin's default connection), then run:

CREATE DATABASE bookstore;

-- Dedicated app role (avoids putting your postgres superuser password in
-- application-local.properties)
CREATE ROLE bookstore_user WITH LOGIN PASSWORD 'bookstore_pass';
GRANT ALL PRIVILEGES ON DATABASE bookstore TO bookstore_user;

-- Step 2: reconnect to the "bookstore" database itself (e.g. `\c bookstore`
-- in psql, or open a new pgAdmin query tool against it), then run:

-- Postgres 15+ no longer grants CREATE on the public schema to other roles
-- just from the DATABASE-level grant above - needed so Hibernate's
-- ddl-auto=update can create tables here.
GRANT ALL ON SCHEMA public TO bookstore_user;

-- Sanity check
SELECT rolname FROM pg_roles WHERE rolname = 'bookstore_user';
