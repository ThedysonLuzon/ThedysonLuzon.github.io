import { mkdir, writeFile, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("❌ Missing GITHUB_TOKEN");
  process.exit(1);
}

const query = `{
  viewer {
    login
    name
    repositories(first: 12, privacy: PUBLIC, orderBy:{field:PUSHED_AT, direction:DESC}) {
      nodes { name description stargazerCount forkCount primaryLanguage { name } url pushedAt }
    }
    pinnedItems(first: 6) {
      nodes {
        ... on Repository {
          name description stargazerCount forkCount primaryLanguage { name } url pushedAt
        }
      }
    }
  }
}`;

async function ghQL(q) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "thedysonluzon-portfolio-fetcher"
    },
    body: JSON.stringify({ query: q })
  });

  if (!res.ok) {
    console.error("GitHub API error", res.status, await res.text());
    process.exit(1);
  }
  const json = await res.json();
  if (json.errors) {
    console.error("GraphQL errors:", JSON.stringify(json.errors, null, 2));
    process.exit(1);
  }
  return json.data;
}

(async () => {
  const data = await ghQL(query);
  const { viewer } = data;

  const map = new Map();
  viewer.repositories.nodes.forEach(r => map.set(r.name, r));
  viewer.pinnedItems.nodes.forEach(r => map.set(r.name, r));

  const repos = [...map.values()]
    .filter(r => r.description)
    .slice(0, 12)
    .map(r => ({
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stargazerCount ?? 0,
      forks: r.forkCount ?? 0,
      primaryLanguage: r.primaryLanguage?.name || null,
      pushedAt: r.pushedAt
    }));

  const payload = {
    updated: new Date().toISOString(),
    login: viewer.login,
    name: viewer.name,
    repos
  };

  await mkdir("src/data", { recursive: true });
  const tmp = join(tmpdir(), `github-${Date.now()}.json`);
  await writeFile(tmp, JSON.stringify(payload, null, 2));
  await rename(tmp, "src/data/github.json");
  console.log("✅ Wrote src/data/github.json");
})();
