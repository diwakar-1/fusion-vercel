import React, { useState } from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import { DsaSession } from '../../types/studentOs';
import { LeetCodeHub } from './LeetCodeHub';
import { Code2, Plus, Clock, Sparkles, CheckCircle2, BookOpen, Layers, Flame, Play } from 'lucide-react';

const POPULAR_PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Trees & BST',
  'Graphs & BFS/DFS',
  'Dynamic Programming',
  'Backtracking',
  'Trie',
  'Monotonic Stack',
  'Greedy Algorithms'
];

export const DsaTracker: React.FC = () => {
  const { dsaSessions, logDsaSession, profile, activeFriend, setActiveModule } = useStudentOs();

  const [dsaTab, setDsaTab] = useState<'sessions' | 'leetcode'>('leetcode');
  const [showLogModal, setShowLogModal] = useState(false);
  const [topic, setTopic] = useState('Dynamic Programming');
  const [platform, setPlatform] = useState<any>('LeetCode');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [problemsCount, setProblemsCount] = useState(2);
  const [notes, setNotes] = useState('');

  // Statistics from real session logs
  const totalDsaMinutes = dsaSessions.reduce((acc: number, s: DsaSession) => acc + s.durationMinutes, 0);
  const totalProblemsSolved = dsaSessions.reduce((acc: number, s: DsaSession) => acc + s.problemsCount, 0);
  const uniquePatterns = new Set(dsaSessions.map((s: DsaSession) => s.topic)).size;

  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    logDsaSession({
      user: profile.name,
      topic,
      platform,
      durationMinutes: Number(durationMinutes),
      problemsCount: Number(problemsCount),
      notes: notes.trim() || 'Covered key pattern techniques and edge cases.'
    });

    setNotes('');
    setShowLogModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#4F46E5',
                background: 'rgba(79, 70, 229, 0.12)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Code2 size={14} />
              <span>ALGORITHMIC STUDY TELEMETRY</span>
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Real-time practice session logs for {profile.name} & {activeFriend.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <img src="/icons/DSA ENGINE.gif" alt="DSA" style={{ width: 38, height: 38, objectFit: 'contain' }} />
            <h2
              className="font-tech"
              style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}
            >
              DSA Engine
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {dsaTab === 'sessions' && (
            <>
          <button
            onClick={() => setActiveModule('study')}
            className="glass-pill"
            style={{
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <img src="/icons/STUDY TIMER.gif" alt="Timer" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            <span>Launch DSA Timer</span>
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="charcoal-pill-btn"
            style={{ padding: '10px 22px', fontSize: '0.88rem' }}
          >
            <Plus size={16} />
            <span>Log Study Session</span>
          </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setDsaTab('leetcode')}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-pill)',
            border: dsaTab === 'leetcode' ? '1.5px solid rgba(234,88,12,0.4)' : '1.5px solid rgba(0,0,0,0.08)',
            background: dsaTab === 'leetcode' ? 'rgba(234,88,12,0.12)' : '#fff',
            color: dsaTab === 'leetcode' ? '#C2410C' : 'var(--text-secondary)',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.88rem'
          }}
        >
          LeetHub Solutions
        </button>
        <button
          type="button"
          onClick={() => setDsaTab('sessions')}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-pill)',
            border: dsaTab === 'sessions' ? '1.5px solid rgba(79,70,229,0.4)' : '1.5px solid rgba(0,0,0,0.08)',
            background: dsaTab === 'sessions' ? 'rgba(79,70,229,0.12)' : '#fff',
            color: dsaTab === 'sessions' ? '#4F46E5' : 'var(--text-secondary)',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.88rem'
          }}
        >
          Study Sessions
        </button>
      </div>

      {dsaTab === 'leetcode' && <LeetCodeHub />}

      {dsaTab === 'sessions' && (
      <>
      {/* 4 Telemetry Metrics Cards */}
      <div className="responsive-grid-stats">
        <GlassCard style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/icons/DASHBOARD CLOCK.gif" alt="Time" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              TOTAL DSA TIME
            </span>
          </div>
          <div className="font-tech" style={{ fontSize: '2rem', fontWeight: 800, color: '#18181B' }}>
            {(totalDsaMinutes / 60).toFixed(1)} hrs
          </div>
          <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 600 }}>
            {totalDsaMinutes} active minutes logged
          </span>
        </GlassCard>

        <GlassCard style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/icons/DAILY TASK.gif" alt="Solved" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              PROBLEMS SOLVED
            </span>
          </div>
          <div className="font-tech" style={{ fontSize: '2rem', fontWeight: 800, color: '#18181B' }}>
            {totalProblemsSolved}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Across all practice sessions
          </span>
        </GlassCard>

        <GlassCard style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(249, 115, 22, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/icons/NOTES.gif" alt="Patterns" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              PATTERNS COVERED
            </span>
          </div>
          <div className="font-tech" style={{ fontSize: '2rem', fontWeight: 800, color: '#18181B' }}>
            {uniquePatterns} Patterns
          </div>
          <span style={{ fontSize: '0.78rem', color: '#F97316', fontWeight: 600 }}>
            DP, Graphs, Trees, Pointers
          </span>
        </GlassCard>

        <GlassCard style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/icons/STREAK DASHBOARD.gif" alt="Sessions" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              SESSIONS COUNT
            </span>
          </div>
          <div className="font-tech" style={{ fontSize: '2rem', fontWeight: 800, color: '#18181B' }}>
            {dsaSessions.length} Logs
          </div>
          <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 600 }}>
            Synchronized with Backend
          </span>
        </GlassCard>
      </div>

      {/* Session Logs Chronological Timeline */}
      <GlassCard style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            Recorded DSA Study Sessions
          </h3>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Showing {dsaSessions.length} real-time session records
          </span>
        </div>

        {dsaSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Code2 size={40} style={{ opacity: 0.3, marginBottom: 10 }} />
            <p>No DSA sessions logged yet. Click "Log Study Session" or run the Focus Timer!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {dsaSessions.map((session: DsaSession) => (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem'
                    }}
                  >
                    {session.problemsCount}Q
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span
                        className="font-tech"
                        style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}
                      >
                        {session.topic}
                      </span>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#EEF2FF',
                          color: '#4F46E5'
                        }}
                      >
                        {session.platform}
                      </span>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: session.user === 'Diwakar' ? '#DCFCE7' : '#FEF3C7',
                          color: session.user === 'Diwakar' ? '#166534' : '#92400E'
                        }}
                      >
                        {session.user}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {session.notes}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-tech" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#18181B' }}>
                    {session.durationMinutes} mins
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-light)' }}>
                    {new Date(session.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Log Session Modal */}
      {showLogModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            padding: 20
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '28px',
              padding: '28px 32px'
            }}
          >
            <h3 className="font-tech" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
              Log DSA Study Session
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Record algorithmic practice time and problems completed.
            </p>

            <form onSubmit={handleLogSession} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Pattern / Topic
                </label>
                <select
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#FFFFFF'
                  }}
                >
                  {POPULAR_PATTERNS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="General Revision">General Revision & Mixed</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#FFFFFF'
                    }}
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="CodeChef">CodeChef</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="GeeksforGeeks">GeeksforGeeks</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    Problems Solved
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={problemsCount}
                    onChange={e => setProblemsCount(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Session Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  step="5"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Key Takeaways / Tricky Edge Cases
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Mastered topological sort with in-degree queue. Watch out for cycle detection!"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.88rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="charcoal-pill-btn"
                  style={{ padding: '10px 24px', fontSize: '0.88rem' }}
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
