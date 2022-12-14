-- Migration number: 0000 	 2022-12-17T12:15:52.660Z
DROP TABLE IF EXISTS Albums;

CREATE TABLE Albums (
  Url TEXT NOT NULL UNIQUE,
  Title TEXT NOT NULL,
  Artist TEXT NOT NULL,
  ReleaseDate INT NOT NULL,
  Score INT NOT NULL,
  CriticNumber INTEGER NOT NULL,
  Summary TEXT NOT NULL,
  RecordLabel TEXT NOT NULL,
  ImageUrl TEXT NOT NULL,
  Genres TEXT NOT NULL,
  PRIMARY KEY ('Url')
);

CREATE INDEX IF NOT EXISTS Albums_ReleaseDate ON Albums (ReleaseDate DESC);