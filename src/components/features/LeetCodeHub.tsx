import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Code2,
  ExternalLink,
  Github,
  Loader2,
  RefreshCw,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Save,
  Users
} from 'lucide-react';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import { cloudSync } from '../../services/cloudSync';
import {
  Difficulty,
  DEFAULT_REPOS,
  LeetCodeProblem,
  ProblemDetail,
  fetchLeetCodeCatalog,
  fetchProblemDetail,
  getStoredLeetCodeRepo,
  normalizeRepo,
  setStoredLeetCodeRepo
} from '../../services/leetcodeGithub';

type ViewUser = 'ayush' | 'diwakar';

function toViewUser(name: string): ViewUser {
  return (name || '').toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
}

function displayName(u: ViewUser): string {
  return u === 'ayush' ? 'Ayush' : 'Diwakar';
}

function diffColor(d: Difficulty): { bg: string; fg: string; label: string } {
  if (d === 'easy') return { bg: 'rgba(16,185,129,0.15)', fg: '#059669', label: 'Easy' };
  if (d === 'medium') return { bg: 'rgba(245,158,11,0.15)', fg: '#D97706', label: 'Medium' };
  if (d === 'hard') return { bg: 'rgba(239,68,68,0.15)', fg: '#DC2626', label: 'Hard' };
  return { bg: 'rgba(100,116,139,0.12)', fg: '#64748B', label: '—' };
}

export const LeetCodeHub: React.FC = () => {
  const { currentUser, activeFriend } = useStudentOs();
  const me = toViewUser(currentUser);
  const partner = toViewUser(activeFriend?.name || (me === 'ayush' ? 'diwakar' : 'ayush'));

  const [viewUser, setViewUser] = useState<ViewUser>(me);
  const [repos, setRepos] = useState<Record<ViewUser, string>>({
    ayush: getStoredLeetCodeRepo('Ayush'),
    diwakar: getStoredLeetCodeRepo('Diwakar')
  });
  const [editRepo, setEditRepo] = useState(repos[me]);
  const [problems, setProblems] = useState<LeetCodeProblem[]>([]);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0, solved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState<'all' | Difficulty>('all');
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProblemDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingRepo, setSavingRepo] = useState(false);

  const activeRepo = repos[viewUser];
  const isOwnTab = viewUser === me;

  const loadPartnerRepo = useCallback(async () => {
    try {
      const { data, partnerData } = await cloudSync.fetchStateDirect(currentUser);
      setRepos(prev => {
        const next = { ...prev };
        let changed = false;
        if (data?.leetcodeRepo && typeof data.leetcodeRepo === 'string') {
          next[me] = setStoredLeetCodeRepo(currentUser, data.leetcodeRepo);
          changed = true;
        }
        if (partnerData?.leetcodeRepo && typeof partnerData.leetcodeRepo === 'string') {
          const normalized = normalizeRepo(partnerData.leetcodeRepo);
          next[partner] = normalized;
          try {
            localStorage.setItem(`fusion_leetcode_repo_${partner}`, normalized);
          } catch {}
          changed = true;
        }
        return changed ? next : prev;
      });
    } catch {}
  }, [currentUser, partner, me]);

  const loadCatalog = useCallback(
    async (force = false) => {
      setLoading(true);
      setError(null);
      setOpenSlug(null);
      setDetail(null);
      const result = await fetchLeetCodeCatalog(activeRepo, { force });
      setProblems(result.problems);
      setStats(result.stats);
      if (result.error) setError(result.error);
      setLoading(false);
    },
    [activeRepo]
  );

  useEffect(() => {
    loadPartnerRepo();
  }, [loadPartnerRepo]);

  useEffect(() => {
    loadCatalog(false);
  }, [loadCatalog]);

  useEffect(() => {
    if (isOwnTab) setEditRepo(repos[me]);
  }, [isOwnTab, me, repos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter(p => {
      if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.number.includes(q)
      );
    });
  }, [problems, query, diffFilter]);

  const toggleProblem = async (problem: LeetCodeProblem) => {
    if (openSlug === problem.slug) {
      setOpenSlug(null);
      setDetail(null);
      return;
    }
    setOpenSlug(problem.slug);
    setDetailLoading(true);
    const full = await fetchProblemDetail(activeRepo, problem);
    setDetail(full);
    setDetailLoading(false);
  };

  const saveMyRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = setStoredLeetCodeRepo(currentUser, editRepo);
    setRepos(prev => ({ ...prev, [me]: normalized }));
    setSavingRepo(true);
    try {
      await cloudSync.pushStateDirect(currentUser, {
        leetcodeRepo: normalized,
        updatedAt: Date.now()
      } as any);
    } catch {}
    setSavingRepo(false);
    if (viewUser === me) {
      await loadCatalog(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <GlassCard style={{ padding: '28px 28px 22px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Code2 size={22} color="#EA580C" />
              <h2 className="font-tech" style={{ fontSize: '1.55rem', fontWeight: 800, margin: 0 }}>
                LeetCode Hub
              </h2>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: 560, lineHeight: 1.5 }}>
              LeetHub se GitHub pe push hone wale questions &amp; solutions yahan auto dikhte hain.
              Ayush aur Diwakar ke repos alag-alag — jab naya problem push hoga, Refresh pe update.
            </p>
          </div>
          <a
            href={`https://github.com/${activeRepo}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 'var(--radius-pill)',
              background: '#18181B',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <Github size={16} />
            Open GitHub
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Whose repo */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          {([me, partner] as ViewUser[]).map(u => {
            const active = viewUser === u;
            return (
              <button
                key={u}
                type="button"
                onClick={() => setViewUser(u)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-pill)',
                  border: active ? '1.5px solid rgba(234,88,12,0.4)' : '1.5px solid rgba(0,0,0,0.08)',
                  background: active ? 'rgba(234,88,12,0.12)' : '#fff',
                  color: active ? '#C2410C' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Users size={15} />
                {displayName(u)}
                {u === me ? ' (You)' : ' (Partner)'}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginTop: 18 }}>
          {[
            { label: 'Solved', value: stats.solved || problems.length, color: '#0F172A' },
            { label: 'Easy', value: stats.easy, color: '#059669' },
            { label: 'Medium', value: stats.medium, color: '#D97706' },
            { label: 'Hard', value: stats.hard, color: '#DC2626' }
          ].map(s => (
            <div
              key={s.label}
              style={{
                padding: '14px 16px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.4 }}>
                {s.label.toUpperCase()}
              </div>
              <div className="font-tech" style={{ fontSize: '1.45rem', fontWeight: 800, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Repo config — only for own tab */}
      {isOwnTab && (
        <GlassCard style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Github size={18} color="#334155" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Your LeetHub GitHub repo</h3>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Default: <code>{DEFAULT_REPOS[me]}</code>. LeetHub extension isi repo pe push kare — yahan auto load hoga.
          </p>
          <form onSubmit={saveMyRepo} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={editRepo}
              onChange={e => setEditRepo(e.target.value)}
              placeholder="owner/repo or https://github.com/owner/repo"
              style={{
                flex: 1,
                minWidth: 240,
                padding: '11px 14px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.12)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={savingRepo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 18px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: '#0F172A',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Save size={15} />
              {savingRepo ? 'Saving…' : 'Save repo'}
            </button>
          </form>
        </GlassCard>
      )}

      {/* Filters */}
      <GlassCard style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title or number…"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.1)',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDiffFilter(d)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                border: diffFilter === d ? '1.5px solid rgba(15,23,42,0.35)' : '1.5px solid rgba(0,0,0,0.08)',
                background: diffFilter === d ? '#0F172A' : '#fff',
                color: diffFilter === d ? '#fff' : '#475569',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => loadCatalog(true)}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid rgba(0,0,0,0.1)',
              background: '#fff',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {loading ? <Loader2 size={14} /> : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>
        <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing <strong>{displayName(viewUser)}</strong> · <code>{activeRepo}</code>
        </div>
      </GlassCard>

      {/* List */}
      <GlassCard style={{ padding: 8 }}>
        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={28} style={{ marginBottom: 10 }} />
            <div>Loading from GitHub…</div>
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: 28, textAlign: 'center' }}>
            <p style={{ color: '#DC2626', fontWeight: 700, marginBottom: 8 }}>{error}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              {isOwnTab
                ? 'LeetHub se pehla question push karo, ya upar sahi public repo set karo.'
                : `${displayName(viewUser)} ne abhi LeetHub repo set nahi kiya, ya repo private/empty hai.`}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div style={{ fontWeight: 700 }}>No solutions yet</div>
            <div style={{ fontSize: '0.85rem', marginTop: 6 }}>
              LeetCode pe solve karke LeetHub se push karo — yahan auto aa jayega.
            </div>
          </div>
        )}

        {!loading &&
          filtered.map(problem => {
            const open = openSlug === problem.slug;
            const diff = diffColor(problem.difficulty);
            return (
              <div
                key={problem.slug}
                style={{
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  padding: '4px 8px'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleProblem(problem)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 12px',
                    border: 'none',
                    background: open ? 'rgba(234,88,12,0.06)' : 'transparent',
                    borderRadius: 14,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span
                    className="font-tech"
                    style={{
                      minWidth: 42,
                      fontWeight: 800,
                      color: '#64748B',
                      fontSize: '0.95rem'
                    }}
                  >
                    #{problem.number || '—'}
                  </span>
                  <span style={{ flex: 1, fontWeight: 750, color: '#0F172A', fontSize: '0.98rem' }}>
                    {problem.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: diff.bg,
                      color: diff.fg
                    }}
                  >
                    {diff.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                    {problem.codeFiles.map(f => f.language).join(', ') || '—'}
                  </span>
                  {open ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
                </button>

                {open && (
                  <div style={{ padding: '4px 12px 18px 54px' }}>
                    {detailLoading && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading solution…</div>
                    )}
                    {!detailLoading && detail && detail.slug === problem.slug && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {detail.leetcodeUrl && (
                            <a
                              href={detail.leetcodeUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.8rem', fontWeight: 700, color: '#EA580C' }}
                            >
                              Open on LeetCode ↗
                            </a>
                          )}
                          <a
                            href={detail.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}
                          >
                            View on GitHub ↗
                          </a>
                        </div>

                        {detail.readmeHtml && (
                          <div
                            className="leetcode-readme"
                            style={{
                              padding: 16,
                              borderRadius: 14,
                              background: 'rgba(255,255,255,0.9)',
                              border: '1px solid rgba(0,0,0,0.06)',
                              fontSize: '0.88rem',
                              lineHeight: 1.55,
                              color: '#1E293B',
                              maxHeight: 280,
                              overflow: 'auto'
                            }}
                            dangerouslySetInnerHTML={{ __html: detail.readmeHtml }}
                          />
                        )}

                        {detail.solutions.map(sol => (
                          <div key={sol.name}>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                color: '#64748B',
                                marginBottom: 6
                              }}
                            >
                              {sol.language} · {sol.name}
                            </div>
                            <pre
                              style={{
                                margin: 0,
                                padding: 16,
                                borderRadius: 14,
                                background: '#0F172A',
                                color: '#E2E8F0',
                                fontSize: '0.8rem',
                                lineHeight: 1.5,
                                overflow: 'auto',
                                maxHeight: 420
                              }}
                            >
                              <code>{sol.code}</code>
                            </pre>
                          </div>
                        ))}

                        {!detail.solutions.length && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No code file found in this folder yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </GlassCard>
    </div>
  );
};
