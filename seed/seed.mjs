#!/usr/bin/env zx
/* eslint-disable no-undef */
import chunk from "lodash/fp/chunk.js";
import filter from "lodash/fp/filter.js";
import flatten from "lodash/fp/flatten.js";
import flow from "lodash/fp/flow.js";
import map from "lodash/fp/map.js";
import replace from "lodash/fp/replace.js";
import sortBy from "lodash/fp/sortBy.js";
import uniq from "lodash/fp/uniq.js";
import "zx/globals";

const albums = await fs.readJson("./seed/albums-17-12-22.json");

const genreValues = flow(
  map("genres"),
  flatten,
  uniq,
  filter((_) => _),
  filter((_) => !/([a-z]|R&B)[A-Z]/.test(_)),
  sortBy((_) => _),
  map(replace(/'/g, "''")), // Escape single quotes for Sqlite
  map((_) => `('${_}')`)
)(albums).join(",");

const genresInsertCommand = `INSERT OR REPLACE INTO Genres (Name) VALUES ${genreValues}`;
await $`wrangler d1 execute metadb --command ${genresInsertCommand} --local`;

const albumValuesChunked = chunk(200)(
  map(
    flow(
      (_) =>
        map(
          flow(
            replace(/'/g, "''"), // Escape single quotes for Sqlite
            (_) => `'${_}'`
          )
        )([
          _.url,
          _.title,
          _.artist,
          _.release_date.$date,
          _.score,
          _.critic_number,
          _.summary,
          _.record_label,
          _.image_url,
        ]),
      (_) => `(${_.join(",")})`
    )
  )(albums)
);

for (const chunk of albumValuesChunked) {
  const albumValues = chunk.join(",");
  const albumsInsertCommand = `INSERT OR REPLACE INTO Albums (Url,Title,Artist,ReleaseDate,Score,CriticNumber,Summary,RecordLabel,ImageUrl) VALUES ${albumValues}`;
  await $`wrangler d1 execute metadb --command ${albumsInsertCommand} --local`;
}

const albumGenresValuesChunked = chunk(1000)(
  flow(
    map((album) =>
      flow(
        filter((_) => _),
        filter((_) => !/([a-z]|R&B)[A-Z]/.test(_)),
        map(replace(/'/g, "''")), // Escape single quotes for Sqlite
        map((genre) => [album.url, genre])
      )(album.genres)
    ),
    flatten,
    map((_) => `(${map((_) => `'${_}'`)(_).join(",")})`)
  )(albums)
);

for (const chunk of albumGenresValuesChunked) {
  const albumGenresValues = chunk.join(",");
  const albumGenresInsertCommand = `INSERT OR REPLACE INTO AlbumGenres (AlbumUrl,GenreName) VALUES ${albumGenresValues}`;
  await $`wrangler d1 execute metadb --command ${albumGenresInsertCommand} --local`;
}

console.log("");
console.log("Done!");
