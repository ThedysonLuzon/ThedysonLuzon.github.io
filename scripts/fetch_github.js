// scripts/fetch_github.js
// Fetch GitHub data via GraphQL and write src/data/github.json

import { mkdir, writeFile } from 'node:fs/promises';

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_GRAPHQL_TOKEN;
if (!TOKEN) {
  console.error('❌ Missing GITHUB_TOKEN / GH_GRAPHQL_TOKEN env var');
  process.exit(1);
}

const query = `
{
  viewer {
    login
    name
    repositories(first: 12, privacy: PUBLIC, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        name
        description
        stargazerCount
        forkCount
        primaryLanguage { name }
        url
        pushedAt
      }
    }
    pinnedItems(first: 6) {
      nodes {
        ... on Repository {
          name
          description
          stargazerCount
          forkCount
          primaryLanguage { name }
          url
          pushedAt
        }
      }
    }
  }
}
`;

async function main() {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'thedysonluzon-portfolio-fetcher'
    },
    body: JSON.stringify({ query })
  });

  if (!res.ok) {
    console.error('GitHub API error', res.status, await res.text());
    process.exit(1);
  }

  const body = await res.json();
  if (body.errors) {
    console.error('GraphQL errors:', JSON.stringify(body.errors, null, 2));
    process.exit(1);
  }

  const { viewer } = body.data;

  // Merge pinned + recent, dedupe by name
  const repoMap = new Map();
  viewer.repositories.nodes.forEach((n) => repoMap.set(n.name, n));
  viewer.pinnedItems.nodes.forEach((n) => repoMap.set(n.name, n));

  const repos = Array.from(repoMap.values())
    .filter((r) => r?.description)
    .slice(0, 12);

  const payload = {
    updated: new Date().toISOString(),
    login: viewer.login,
    name: viewer.name,
    repos: repos.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stargazerCount || 0,
      forks: r.forkCount || 0,
      primaryLanguage: r.primaryLanguage?.name || null,
      pushedAt: r.pushedAt
    }))
  };

  await mkdir('src/data', { recursive: true });
  await writeFile('src/data/github.json', JSON.stringify(payload, null, 2));
  console.log('✅ Wrote src/data/github.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
