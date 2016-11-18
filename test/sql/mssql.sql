DROP TABLE IF EXISTS [create_join];
DROP TABLE IF EXISTS [create_test];

-- Table create_join
CREATE TABLE [create_join] (
    [id] INTEGER,
    [key] VARCHAR(255),
    [val] NVARCHAR(2048)
);

CREATE TABLE [create_test] (
    [id] INTEGER,
    [key] VARCHAR(255),
    [val] NVARCHAR(2048)
);