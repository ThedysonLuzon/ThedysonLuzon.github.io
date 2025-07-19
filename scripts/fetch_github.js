import fs from 'fs';
import fetch from 'node-fetch';

const query = `
{
  viewer {
    login
    name
    repositories(first: 10, privacy: PUBLIC, orderBy:{field: PUSHED_AT, direction: DESC}) {
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
    pinnedItems(first:6) {
      nodes {
        ... on Repository {
          name
          description
          stargazerCount
          primaryLanguage { name }
          url
        }
      }
    }
  }
}
`;

async function run() {
  const r = await fetch('https://api.github.com/graphql', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': `Bearer ${process.env.GH_GRAPHQL_TOKEN}`
    },
    body: JSON.stringify({ query })
  });

  if(!r.ok){
    console.error('GitHub API error', r.status, await r.text());
    process.exit(1);
  }
  const json = await r.json();

  const { viewer } = json.data;
  // Merge pinned + recent (dedupe by name)
  const repoMap = new Map();
  viewer.repositories.nodes.forEach(n=>repoMap.set(n.name, n));
  viewer.pinnedItems.nodes.forEach(n=>repoMap.set(n.name, n));

  const repos = Array.from(repoMap.values())
    .filter(r => r.description)      // filter empty
    .slice(0,12);

  const payload = {
    updated: new Date().toISOString(),
    login: viewer.login,
    name: viewer.name,
    repos: repos.map(r => ({
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stargazerCount,
      forks: r.forkCount ?? 0,
      primaryLanguage: r.primaryLanguage?.name || null,
      pushedAt: r.pushedAt
    }))
  };

  fs.mkdirSync('src/data',{recursive:true});
  fs.writeFileSync('src/data/github.json', JSON.stringify(payload,null,2));
  console.log('Wrote src/data/github.json');
}
run();
