/**
 * LeetHub → GitHub solutions fetcher.
 * Reads public repos like ayushsinha008/leetcode-codes (LeetHub v2 layout).
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'unknown';

export interface LeetCodeStats {
  easy: number;
  medium: number;
  hard: number;
  solved: number;
}

export interface LeetCodeProblem {
  slug: string;
  number: string;
  title: string;
  difficulty: Difficulty;
  folderPath: string;
  githubUrl: string;
  leetcodeUrl?: string;
  codeFiles: Array<{ name: string; path: string; language: string }>;
  hasReadme: boolean;
}

export interface ProblemDetail extends LeetCodeProblem {
  readmeHtml: string;
  solutions: Array<{ name: string; language: string; code: string }>;
}

const DEFAULT_REPOS: Record<'ayush' | 'diwakar', string> = {
  ayush: 'ayushsinha008/leetcode-codes',
  diwakar: 'diwakar-1/leetcode-codes'
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const memoryCache = new Map<string, { at: number; problems: LeetCodeProblem[]; stats: LeetCodeStats }>();

function userKey(user: string): 'ayush' | 'diwakar' {
  return (user || '').toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
}

export function getStoredLeetCodeRepo(user: string): string {
  const key = userKey(user);
  try {
    const saved = localStorage.getItem(`fusion_leetcode_repo_${key}`);
    if (saved && saved.trim()) return normalizeRepo(saved);
  } catch {}
  return DEFAULT_REPOS[key];
}

export function setStoredLeetCodeRepo(user: string, repo: string): string {
  const key = userKey(user);
  const normalized = normalizeRepo(repo);
  try {
    localStorage.setItem(`fusion_leetcode_repo_${key}`, normalized);
  } catch {}
  return normalized;
}

/** Accepts owner/repo or full GitHub URL */
export function normalizeRepo(raw: string): string {
  let value = (raw || '').trim().replace(/\.git$/i, '');
  const urlMatch = value.match(/github\.com[/:]([^/\s]+)\/([^/\s?#]+)/i);
  if (urlMatch) return `${urlMatch[1]}/${urlMatch[2]}`;
  value = value.replace(/^\/+|\/+$/g, '');
  return value;
}

function titleFromSlug(slug: string): { number: string; title: string } {
  const m = slug.match(/^(\d+)-(.+)$/);
  if (!m) return { number: '', title: slug.replace(/-/g, ' ') };
  const title = m[2]
    .split('-')
    .map(w => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
  return { number: String(parseInt(m[1], 10)), title };
}

function langFromFilename(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    java: 'Java',
    py: 'Python',
    cpp: 'C++',
    c: 'C',
    js: 'JavaScript',
    ts: 'TypeScript',
    go: 'Go',
    rs: 'Rust',
    kt: 'Kotlin',
    swift: 'Swift',
    cs: 'C#',
    rb: 'Ruby',
    php: 'PHP',
    scala: 'Scala',
    sql: 'SQL'
  };
  return map[ext] || ext.toUpperCase() || 'Code';
}

function isSolutionFile(name: string): boolean {
  if (!name || name === 'README.md' || name === 'stats.json') return false;
  return /\.(java|py|cpp|c|js|ts|go|rs|kt|swift|cs|rb|php|scala|sql)$/i.test(name);
}

async function ghJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchRaw(ownerRepo: string, path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${ownerRepo}/main/${path}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) {
      // try master branch (older LeetHub)
      const res2 = await fetch(`https://raw.githubusercontent.com/${ownerRepo}/master/${path}`, {
        signal: AbortSignal.timeout(12000)
      });
      if (!res2.ok) return '';
      return await res2.text();
    }
    return await res.text();
  } catch {
    return '';
  }
}

function parseStats(raw: any): LeetCodeStats {
  const lc = raw?.leetcode || raw || {};
  return {
    easy: Number(lc.easy || 0),
    medium: Number(lc.medium || 0),
    hard: Number(lc.hard || 0),
    solved: Number(lc.solved || 0)
  };
}

function difficultyFromStats(statsRaw: any, slug: string): Difficulty {
  const entry = statsRaw?.leetcode?.sha?.[slug] || statsRaw?.sha?.[slug];
  const d = String(entry?.difficulty || '').toLowerCase();
  if (d === 'easy' || d === 'medium' || d === 'hard') return d;
  return 'unknown';
}

export async function fetchLeetCodeCatalog(
  ownerRepo: string,
  opts?: { force?: boolean }
): Promise<{ problems: LeetCodeProblem[]; stats: LeetCodeStats; error?: string }> {
  const repo = normalizeRepo(ownerRepo);
  if (!repo.includes('/')) {
    return { problems: [], stats: { easy: 0, medium: 0, hard: 0, solved: 0 }, error: 'Invalid repo. Use owner/repo' };
  }

  const cached = memoryCache.get(repo);
  if (!opts?.force && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { problems: cached.problems, stats: cached.stats };
  }

  const [owner, name] = repo.split('/');

  let statsRaw: any = null;
  try {
    const statsText = await fetchRaw(repo, 'stats.json');
    if (statsText) statsRaw = JSON.parse(statsText);
  } catch {}
  const stats = parseStats(statsRaw);

  // Prefer ONE recursive tree call (avoids GitHub API rate limits from N folder requests)
  let tree = await ghJson<{ tree?: Array<{ path: string; type: string }>; message?: string; truncated?: boolean }>(
    `https://api.github.com/repos/${owner}/${name}/git/trees/main?recursive=1`
  );
  if (!tree?.tree) {
    tree = await ghJson<{ tree?: Array<{ path: string; type: string }>; message?: string }>(
      `https://api.github.com/repos/${owner}/${name}/git/trees/master?recursive=1`
    );
  }

  // Fallback: stats.json sha map keys = problem folders
  if (!tree?.tree) {
    const shaMap = statsRaw?.leetcode?.sha || statsRaw?.sha || {};
    const slugs = Object.keys(shaMap).filter(k => /^\d+-/.test(k));
    if (!slugs.length) {
      return {
        problems: [],
        stats,
        error: `Could not load ${repo}. Repo missing, private, or GitHub rate-limited. Try Refresh in a minute.`
      };
    }
    const problemsFromStats: LeetCodeProblem[] = slugs.map(slug => {
      const { number, title } = titleFromSlug(slug);
      const files = Object.keys(shaMap[slug] || {}).filter(f => isSolutionFile(f));
      return {
        slug,
        number,
        title,
        difficulty: difficultyFromStats(statsRaw, slug),
        folderPath: slug,
        githubUrl: `https://github.com/${repo}/tree/main/${slug}`,
        leetcodeUrl: `https://leetcode.com/problems/${slug.replace(/^\d+-/, '')}/`,
        codeFiles: files.map(f => ({
          name: f,
          path: `${slug}/${f}`,
          language: langFromFilename(f)
        })),
        hasReadme: Object.prototype.hasOwnProperty.call(shaMap[slug] || {}, 'README.md')
      };
    });
    problemsFromStats.sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
    if (!stats.solved) stats.solved = problemsFromStats.length;
    memoryCache.set(repo, { at: Date.now(), problems: problemsFromStats, stats });
    return { problems: problemsFromStats, stats };
  }

  const folders = new Set<string>();
  const filesByFolder = new Map<string, string[]>();

  for (const item of tree.tree) {
    if (!item.path) continue;
    const parts = item.path.split('/');
    if (parts.length === 1 && item.type === 'tree' && /^\d+-/.test(parts[0])) {
      folders.add(parts[0]);
      continue;
    }
    if (parts.length >= 2 && /^\d+-/.test(parts[0])) {
      folders.add(parts[0]);
      if (item.type === 'blob') {
        const list = filesByFolder.get(parts[0]) || [];
        list.push(parts[parts.length - 1]);
        filesByFolder.set(parts[0], list);
      }
    }
  }

  const problems: LeetCodeProblem[] = Array.from(folders).map(slug => {
    const { number, title } = titleFromSlug(slug);
    const names = filesByFolder.get(slug) || [];
    const codeFiles = names.filter(isSolutionFile).map(f => ({
      name: f,
      path: `${slug}/${f}`,
      language: langFromFilename(f)
    }));
    return {
      slug,
      number,
      title,
      difficulty: difficultyFromStats(statsRaw, slug),
      folderPath: slug,
      githubUrl: `https://github.com/${repo}/tree/main/${slug}`,
      leetcodeUrl: `https://leetcode.com/problems/${slug.replace(/^\d+-/, '')}/`,
      codeFiles,
      hasReadme: names.includes('README.md')
    };
  });

  problems.sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
  if (!stats.solved) stats.solved = problems.length;

  memoryCache.set(repo, { at: Date.now(), problems, stats });
  return { problems, stats };
}

export async function fetchProblemDetail(
  ownerRepo: string,
  problem: LeetCodeProblem
): Promise<ProblemDetail> {
  const repo = normalizeRepo(ownerRepo);
  const readmeHtml = problem.hasReadme ? await fetchRaw(repo, `${problem.folderPath}/README.md`) : '';

  const solutions = await Promise.all(
    problem.codeFiles.map(async file => ({
      name: file.name,
      language: file.language,
      code: await fetchRaw(repo, file.path)
    }))
  );

  // Extract leetcode link from readme if present
  let leetcodeUrl = problem.leetcodeUrl;
  const linkMatch = readmeHtml.match(/href="(https:\/\/leetcode\.com\/problems\/[^"]+)"/i);
  if (linkMatch) leetcodeUrl = linkMatch[1];

  return {
    ...problem,
    leetcodeUrl,
    readmeHtml,
    solutions: solutions.filter(s => s.code)
  };
}

export { DEFAULT_REPOS };
