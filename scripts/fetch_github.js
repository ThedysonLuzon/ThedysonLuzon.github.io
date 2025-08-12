// scripts/fetch_github.js
import { mkdir, writeFile, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("❌ Missing GITHUB_TOKEN");
  process.exit(1);
}

// Config
const INCLUDE_SELF_REPOS = String(process.env.INCLUDE_SELF_REPOS || 'false').toLowerCase() === 'true';

// GraphQL helpers
async function ghQL(query, variables = undefined) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "thedysonluzon-portfolio-fetcher"
    },
    body: JSON.stringify({ query, variables })
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

// Queries
const viewerQuery = /* GraphQL */ `
  query ViewerRepos {
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
  }
`;

// We’ll search for merged PRs authored by the viewer in the last 12 months.
const contribSearchQuery = /* GraphQL */ `
  query SearchMergedPRs($q: String!, $first: Int!) {
    search(query: $q, type: ISSUE, first: $first) {
      nodes {
        ... on PullRequest {
          number
          title
          url
          mergedAt
          closedAt
          repository { nameWithOwner }
          state
        }
      }
    }
  }
`;

// Main
(async () => {
  // 1) Fetch viewer, repos, and pinned
  const data = await ghQL(viewerQuery);
  const { viewer } = data;

  const map = new Map();
  viewer.repositories.nodes.forEach(r => map.set(r.name, r));
  viewer.pinnedItems.nodes.forEach(r => map.set(r.name, r));

  const repos = [...map.values()]
    .filter(r => r?.description)
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

  // 2) Fetch merged PR contributions (past 12 months)
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);
  const yyyy = since.getFullYear();
  const mm = String(since.getMonth() + 1).padStart(2, '0');
  const dd = String(since.getDate()).padStart(2, '0');
  const sinceStr = `${yyyy}-${mm}-${dd}`;

  // Build query string.
  // Otherwise include everything authored
  const baseQ = `is:pr author:${viewer.login} is:merged merged:>=${sinceStr} sort:updated-desc`;
  const q = INCLUDE_SELF_REPOS ? baseQ : `${baseQ} -user:${viewer.login}`;

  const contribData = await ghQL(contribSearchQuery, { q, first: 50 });

  const contributions = (contribData?.search?.nodes || [])
    .filter(Boolean)
    .map(node => ({
      repo: node.repository?.nameWithOwner || "",
      pr: node.number,
      title: node.title,
      url: node.url,
      date: node.mergedAt || node.closedAt || null,
      status: "merged"
    }));

  // 3) Write payload
  const payload = {
    updated: new Date().toISOString(),
    login: viewer.login,
    name: viewer.name,
    repos,
    contributions
  };

  await mkdir("src/data", { recursive: true });
  const tmp = join(tmpdir(), `github-${Date.now()}.json`);
  await writeFile(tmp, JSON.stringify(payload, null, 2));
  await rename(tmp, "src/data/github.json");
  console.log(`✅ Wrote src/data/github.json (${repos.length} repos, ${contributions.length} contributions)`);
})();
