#!/usr/bin/env zx
/* eslint-disable no-loop-func */
/* eslint-disable no-undef */
import chunk from "lodash/fp/chunk.js";
import filter from "lodash/fp/filter.js";
import flow from "lodash/fp/flow.js";
import map from "lodash/fp/map.js";
import replace from "lodash/fp/replace.js";
import { retry } from "zx/experimental";
import "zx/globals";

const albums = await fs.readJson("./seed/albums-17-12-22.json");

const albumValuesChunked = chunk(200)(
  map(
    flow(
      (_) =>
        map(
          flow(
            replace(/'/g, "''"), // Escape single quotes for Sqlite
            replace(/;/g, ":"), // Replace semicolon for D1, see https://github.com/cloudflare/wrangler2/issues/2227
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
          `,${flow(
            filter((_) => _),
            filter((_) => !/([a-z]|R&B)[A-Z]/.test(_)),
            map(replace(/'/g, "''")) // Escape single quotes for Sqlite
          )(_.genres).join(",")},`,
        ]),
      (_) => `(${_.join(",")})`
    )
  )(albums)
);

for (const chunk of albumValuesChunked) {
  const albumValues = chunk.join(",");
  const albumsInsertCommand = `INSERT OR REPLACE INTO Albums (Url,Title,Artist,ReleaseDate,Score,CriticNumber,Summary,RecordLabel,ImageUrl,Genres) VALUES ${albumValues}`;
  await retry(
    10,
    () => $`wrangler d1 execute metadb --command ${albumsInsertCommand}`
  );
}

console.log("");
console.log("Done!");
