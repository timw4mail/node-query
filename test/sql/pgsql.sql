-- sample data to test PostgreSQL INFORMATION_SCHEMA
DROP TABLE IF EXISTS "create_join" CASCADE;
DROP TABLE IF EXISTS "create_test" CASCADE;

-- Table create_join
CREATE TABLE "create_join" (
    id integer NOT NULL,
    key text,
    val text
);

CREATE TABLE "create_test" (
    id integer NOT NULL,
    key text,
    val text
)
