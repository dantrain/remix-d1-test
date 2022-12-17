import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

type Context = {
  DB: D1Database;
};

export const loader: LoaderFunction = async ({ context }) => {
  const ctx = context as Context;

  const data = await ctx.DB.prepare(
    `SELECT Url, Title, Artist, ReleaseDate, Score, CriticNumber, Summary, RecordLabel, ImageUrl, GROUP_CONCAT(Name) Genres
    FROM Albums
    JOIN AlbumGenres ON AlbumGenres.AlbumUrl = Albums.Url
    JOIN Genres ON Genres.name = AlbumGenres.GenreName
    GROUP BY Url
    ORDER BY ReleaseDate DESC
    LIMIT 200`
  ).all();

  return json({ data });
};

export default function Index() {
  const data = useLoaderData();

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <h1>Remix D1 Test</h1>
      <pre style={{ background: "#eee", padding: "1em", overflow: "hidden" }}>
        {JSON.stringify(data, null, 4)}
      </pre>
    </div>
  );
}
