-- Migration number: 0000 	 2022-12-17T12:15:52.660Z
DROP TABLE IF EXISTS Albums;
DROP TABLE IF EXISTS Genres;
DROP TABLE IF EXISTS AlbumGenres;

CREATE TABLE Albums (
  Url TEXT NOT NULL UNIQUE,
  Title TEXT NOT NULL,
  Artist TEXT NOT NULL,
  ReleaseDate TEXT NOT NULL,
  Score INT NOT NULL,
  CriticNumber INTEGER NOT NULL,
  Summary TEXT NOT NULL,
  RecordLabel TEXT NOT NULL,
  ImageUrl TEXT NOT NULL,
  PRIMARY KEY ('Url')
);

CREATE TABLE Genres (
  Name TEXT NOT NULL UNIQUE,
  PRIMARY KEY ('Name')
);

CREATE TABLE AlbumGenres (
  AlbumUrl TEXT NOT NULL,
  GenreName TEXT NOT NULL,
  PRIMARY KEY('AlbumUrl', 'GenreName'),
  FOREIGN KEY(AlbumUrl) REFERENCES Albums(Url),
  FOREIGN KEY(GenreName) REFERENCES Genres(Name)
);
