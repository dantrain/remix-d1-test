import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { omit } from "lodash";

type Context = {
  DB: D1Database;
};

export const loader: LoaderFunction = async ({ request, context }) => {
  const ctx = context as Context;

  const url = new URL(request.url);
  const minScore = +(url.searchParams.get("min") ?? 70);
  const maxScore = +(url.searchParams.get("max") ?? 100);
  const reviews = +(url.searchParams.get("reviews") ?? 10);
  const genres = url.searchParams.get("genres")?.split(",") ?? [];
  const skip = +(url.searchParams.get("skip") ?? 0);

  const query = `SELECT * FROM Albums
    WHERE
      Score >= ?1
      AND Score <= ?2
      AND CriticNumber >= ?3
      ${
        genres.length
          ? `AND (${genres
              .map((_, i) => `Genres LIKE ?${i + 6}`)
              .join(" OR ")})`
          : ""
      }
    ORDER BY ReleaseDate DESC
    LIMIT ?4
    OFFSET ?5`;

  const binding = [
    minScore,
    maxScore,
    reviews,
    200,
    skip,
    ...genres.map((_) => `%,${_},%`),
  ];

  const data = await ctx.DB.prepare(query)
    .bind(...binding)
    .all();

  return json({ data });
};

export default function Index() {
  const { data } = useLoaderData();

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
        {JSON.stringify(
          { ...omit(data, "results"), results: data.results },
          null,
          4
        )}
      </pre>
    </div>
  );
}
