import React, { useState } from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import { DailyTask } from '../../types/studentOs';
import {
  CheckCircle2,
  Circle,
  Flame,
  Target,
  Plus,
  Zap,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Code,
  Terminal,
  Skull,
  ShieldAlert,
  AlertOctagon,
  X,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_CODING_CHALLENGES = [
  { title: 'Solve 2 Medium problems on LeetCode', platform: 'LeetCode', exp: 100, isCoreStreakTask: true },
  { title: 'Solve 2 problems on Codeforces (Div 3/2)', platform: 'Codeforces', exp: 120, isCoreStreakTask: true },
  { title: 'Solve 2 6kyu / 5kyu Katas on CodeWars', platform: 'CodeWars', exp: 80, isCoreStreakTask: true },
  { title: 'Complete 1 HackerRank Advanced Algorithm Challenge', platform: 'HackerRank', exp: 90, isCoreStreakTask: true },
  { title: 'Log 2 Hours DSA Deep Practice Block', platform: 'Focus Timer', exp: 100, isCoreStreakTask: true },
  { title: 'Watch 2 Hours from AIML YouTube Playlist', platform: 'AIML Hub', exp: 100, isCoreStreakTask: true }
];

export const HabitsAndGoals: React.FC = () => {
  const {
    dailyTasks,
    toggleDailyTask,
    addDailyTask,
    isStreakProtectedToday,
    profile,
    activeFriend,
    enforceTaskAccountability,
    dismissPunishmentAlert,
    punishmentModalOpen,
    punishmentDetails
  } = useStudentOs();

  const [showAddTask, setShowAddTask] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('LeetCode');
  const [newExp, setNewExp] = useState(100);
  const [isCore, setIsCore] = useState(true);

  const completedCount = dailyTasks.filter((t: DailyTask) => t.completed).length;
  const coreTasks = dailyTasks.filter((t: DailyTask) => t.isCoreStreakTask);
  const coreCompletedCount = coreTasks.filter((t: DailyTask) => t.completed).length;
  const totalEarnedExpToday = dailyTasks
    .filter((t: DailyTask) => t.completed)
    .reduce((sum: number, t: DailyTask) => sum + t.exp, 0);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addDailyTask({
      title: newTitle.trim(),
      platform: newPlatform,
      exp: Number(newExp),
      isCoreStreakTask: isCore
    });
    setNewTitle('');
    setShowAddTask(false);
  };

  const handleAddPreset = (preset: typeof PRESET_CODING_CHALLENGES[0]) => {
    addDailyTask(preset);
  };

  const handleToggle = (taskId: string, currentStatus: boolean) => {
    toggleDailyTask(taskId, !currentStatus);
    if (!currentStatus) {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    }
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
                color: '#EA580C',
                background: 'rgba(234, 88, 12, 0.12)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <img src="/icons/STREAK.gif" alt="Streak" style={{ width: 16, height: 16, objectFit: 'contain' }} />
              <span>STREAK VERIFICATION PROTOCOL</span>
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Complete coding challenges on LeetCode, Codeforces, CodeWars or HackerRank to count streak!
            </span>
          </div>

          <h2
            className="font-tech"
            style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}
          >
            Daily Tasks & Streak Verification
          </h2>
        </div>

        <button
          onClick={() => setShowAddTask(true)}
          className="charcoal-pill-btn"
          style={{ padding: '10px 22px', fontSize: '0.88rem' }}
        >
          <Plus size={16} />
          <span>Add Custom Challenge</span>
        </button>
      </div>

      {/* Streak Protection Status Banner */}
      <div
        style={{
          borderRadius: '24px',
          background: isStreakProtectedToday
            ? 'linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)'
            : 'linear-gradient(135deg, #FEF3C7 0%, #FFEDD5 100%)',
          border: isStreakProtectedToday ? '1.5px solid #22C55E' : '1.5px solid #F59E0B',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 8px 24px -6px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: isStreakProtectedToday ? '#16A34A' : '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            {isStreakProtectedToday ? (
              <img src="/icons/STREAK.gif" alt="Streak Protected" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            ) : (
              <img src="/icons/DANGER.gif" alt="Streak At Risk" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            )}
          </div>
          <div>
            <h3
              className="font-tech"
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: isStreakProtectedToday ? '#14532D' : '#78350F',
                marginBottom: 4
              }}
            >
              {isStreakProtectedToday
                ? `Streak Count Validated (${profile.streakDays} Days)`
                : `Streak At Risk (${profile.streakDays} Days)`}
            </h3>
            <p
              style={{
                fontSize: '0.88rem',
                color: isStreakProtectedToday ? '#15803D' : '#92400E',
                margin: 0
              }}
            >
              {isStreakProtectedToday
                ? `Awesome! You completed core tasks today. Your streak is verified and protected for ${profile.name}.`
                : 'Complete at least 1 core coding challenge (LeetCode, Codeforces, CodeWars, HackerRank) today or your streak will reset!'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              EXP EARNED TODAY
            </span>
            <div className="font-tech" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
              <img src="/icons/XP.gif" alt="XP" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              <span>+{totalEarnedExpToday} XP</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              TASKS SOLVED
            </span>
            <div className="font-tech" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B' }}>
              {completedCount} / {dailyTasks.length}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Severe Task Accountability & Progress Deletion HUD */}
      <GlassCard
        style={{
          padding: '24px 28px',
          background: profile.isPunished
            ? 'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.85) 100%)',
          border: profile.isPunished ? '1.5px solid #EF4444' : '1.5px solid rgba(15, 23, 42, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: profile.isPunished ? '#DC2626' : '#0F172A',
                background: profile.isPunished ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.08)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <ShieldAlert size={14} color={profile.isPunished ? '#DC2626' : '#0F172A'} />
              <span>SEVERE TASK ACCOUNTABILITY & PROGRESS DELETION PROTOCOL</span>
            </span>

            {profile.isPunished && (
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  background: '#DC2626',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                ⚠️ ACTIVE PUNISHMENT ({profile.strikes || 1} Strikes)
              </span>
            )}
          </div>

          <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
            Task Discipline & Catastrophic Progress Wipe Engine
          </h3>

          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            Incomplete daily core tasks result in an immediate <strong>-400 XP penalty per missed task</strong>. If your XP falls below <strong>100 XP</strong>, your <strong>ENTIRE ACCOUNT PROGRESS (Streak, Level, XP, Rank, and Minutes) IS WIPED TO ZERO</strong>.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Current XP: <strong style={{ color: profile.totalXp >= 100 ? '#10B981' : '#EF4444' }}>{profile.totalXp} XP</strong> (Safety threshold: 100+ XP)
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Infractions: <strong style={{ color: (profile.strikes || 0) > 0 ? '#EF4444' : '#10B981' }}>{profile.strikes || 0} Strikes</strong>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={async () => {
              setIsAuditing(true);
              await enforceTaskAccountability(true);
              setIsAuditing(false);
            }}
            disabled={isAuditing}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
              color: '#FFFFFF',
              boxShadow: '0 6px 20px rgba(220, 38, 38, 0.3)'
            }}
          >
            <Skull size={18} />
            <span>{isAuditing ? 'Enforcing Penalties...' : 'Run Task Accountability Audit'}</span>
          </button>
        </div>
      </GlassCard>

      {/* Quick Add Preset Challenges */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} color="#EA580C" />
          <h4 className="font-tech" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            Quick Add Platform Challenges
          </h4>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {PRESET_CODING_CHALLENGES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleAddPreset(preset)}
              className="glass-pill"
              style={{
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <Plus size={14} />
              <span>{preset.title}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: '#FEF3C7',
                  color: '#B45309'
                }}
              >
                +{preset.exp} XP
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Challenges List */}
      <GlassCard style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            Today's Active Challenges
          </h3>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Core tasks marked with 🔥 count directly toward streak retention
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dailyTasks.map(task => (
            <div
              key={task.id}
              onClick={() => handleToggle(task.id, task.completed)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '16px',
                background: task.completed ? 'rgba(240, 253, 244, 0.7)' : 'rgba(255, 255, 255, 0.6)',
                border: task.completed ? '1px solid #86EFAC' : '1px solid rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ color: task.completed ? '#16A34A' : 'var(--text-muted)' }}>
                  {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.98rem',
                        color: task.completed ? '#15803D' : 'var(--text-primary)',
                        textDecoration: task.completed ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </span>
                    {task.isCoreStreakTask && (
                      <span
                        title="Core Streak Task"
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'rgba(234, 88, 12, 0.12)',
                          color: '#EA580C',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Flame size={11} fill="#EA580C" />
                        <span>Core Streak</span>
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Platform: {task.platform}
                    </span>
                    {task.completed && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: task.completedBy === 'Ayush' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                          color: task.completedBy === 'Ayush' ? '#7C3AED' : '#059669'
                        }}
                      >
                        ✓ Done by {task.completedBy || profile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="font-tech"
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: task.completed ? '#16A34A' : '#6366F1'
                  }}
                >
                  +{task.exp} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Add Custom Task Modal */}
      {showAddTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            padding: 20
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#FFFFFF',
              borderRadius: '28px',
              padding: '28px 32px'
            }}
          >
            <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 6 }}>
              Add Daily Challenge
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Assign a new coding challenge or study requirement for today.
            </p>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solve 2 problems on Codeforces / LeetCode"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.12)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={e => setNewPlatform(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.12)', background: '#FFFFFF' }}
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="CodeWars">CodeWars</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="Focus Timer">Focus Timer</option>
                    <option value="Courses Hub">Courses Hub</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    EXP Reward
                  </label>
                  <input
                    type="number"
                    min="25"
                    max="500"
                    step="25"
                    value={newExp}
                    onChange={e => setNewExp(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.12)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="coreStreakCheck"
                  checked={isCore}
                  onChange={e => setIsCore(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor="coreStreakCheck" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                  Mark as Core Streak Task (Required to protect streak)
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="glass-pill"
                  style={{ flex: 1, padding: '10px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="charcoal-pill-btn"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Punishment Enforced Notification Modal */}
      {punishmentModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            padding: 24
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '28px',
              padding: '32px',
              border: punishmentDetails?.isWiped ? '2.5px solid #DC2626' : '2px solid #F59E0B',
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: punishmentDetails?.isWiped
                  ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                boxShadow: punishmentDetails?.isWiped
                  ? '0 8px 24px rgba(220, 38, 38, 0.4)'
                  : '0 8px 24px rgba(245, 158, 11, 0.3)'
              }}
            >
              {punishmentDetails?.isWiped ? <Skull size={36} /> : <AlertOctagon size={36} />}
            </div>

            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: punishmentDetails?.isWiped ? '#DC2626' : '#D97706',
                background: punishmentDetails?.isWiped ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                padding: '4px 14px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-block',
                marginBottom: 10
              }}
            >
              {punishmentDetails?.isWiped ? 'CATASTROPHIC PENALTY TRIGGERED' : 'TASK DISCIPLINE PENALTY'}
            </span>

            <h3
              className="font-tech"
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#0F172A',
                marginBottom: 8
              }}
            >
              {punishmentDetails?.isWiped ? 'ALL USER PROGRESS WIPED TO ZERO' : 'MASSIVE XP DEDUCTED'}
            </h3>

            <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.5, marginBottom: 20 }}>
              {punishmentDetails?.reason}
            </p>

            {/* Comparison Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                background: 'rgba(241, 245, 249, 0.7)',
                padding: '16px',
                borderRadius: '16px',
                marginBottom: 24,
                textAlign: 'left'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>XP Penalty</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#DC2626' }}>
                  -{punishmentDetails?.penaltyXp} XP
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>New Total XP</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: punishmentDetails?.isWiped ? '#DC2626' : '#10B981' }}>
                  {punishmentDetails?.newXp} XP
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Streak Count</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: punishmentDetails?.isWiped ? '#DC2626' : '#0F172A' }}>
                  {punishmentDetails?.isWiped ? '0 Days (Reset)' : `${profile.streakDays} Days`}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Total Infractions</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#DC2626' }}>
                  {profile.strikes || 1} Strikes
                </div>
              </div>
            </div>

            <button
              onClick={dismissPunishmentAlert}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-tech)',
                fontWeight: 800,
                fontSize: '0.94rem',
                background: punishmentDetails?.isWiped
                  ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
                  : 'var(--charcoal-pill)',
                color: '#FFFFFF',
                boxShadow: '0 6px 18px rgba(0,0,0,0.15)'
              }}
            >
              {punishmentDetails?.isWiped
                ? 'I Acknowledge & Accept My Progress Wipe'
                : 'Acknowledge Penalty & Resume Tasks'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
