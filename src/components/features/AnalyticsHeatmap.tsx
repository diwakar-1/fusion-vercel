import React, { useState } from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import {
  Flame,
  Clock,
  Code2,
  BrainCircuit,
  Award,
  TrendingUp,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  Zap,
  Activity,
  ChevronRight,
  ShieldCheck,
  Compass,
  SlidersHorizontal,
  Bookmark,
  Pause,
  Play,
  Plane,
  AlertCircle,
  Tv
} from 'lucide-react';

export const AnalyticsHeatmap: React.FC = () => {
  const {
    profile,
    studySessions,
    dsaSessions,
    pdfQuestionSheets,
    dailyTasks,
    habits,
    heatmapData,
    isVacationPaused,
    toggleVacationMode,
    hasWatchedPlaylistVideoToday,
    markPlaylistVideoWatchedToday,
    setActiveModule
  } = useStudentOs();

  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const [vacationFeedback, setVacationFeedback] = useState<{ text: string; isProtected: boolean } | null>(null);

  // Real-time telemetry computations
  const userSessions = studySessions.filter(s => (s.user_name || (s as any).userName) === profile.name);
  const totalStudyMinutes = userSessions.reduce((acc, s) => acc + (s.duration_minutes || (s as any).durationMinutes || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const dsaMinutes = userSessions.filter(s => (s.subject_name || (s as any).subject) === 'DSA').reduce((acc, s) => acc + (s.duration_minutes || (s as any).durationMinutes || 0), 0);
  const mlMinutes = userSessions.filter(s => (s.subject_name || (s as any).subject) === 'Machine Learning').reduce((acc, s) => acc + (s.duration_minutes || (s as any).durationMinutes || 0), 0);

  const totalProblemsSolved =
    dsaSessions.reduce((acc, s) => acc + s.problemsCount, 0) +
    pdfQuestionSheets.reduce((acc, s) => acc + s.completedCount, 0);

  const dailyGoalMinutes = 4 * 60; // 4 Hours standard goal
  const todayProgressPct = Math.min(100, Math.round((profile.todayStudiedMinutes / dailyGoalMinutes) * 100));
  const minutesLeft = Math.max(0, dailyGoalMinutes - profile.todayStudiedMinutes);
  const hoursLeft = (minutesLeft / 60).toFixed(1);

  // Past 7 Days study telemetry
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayMinutes = userSessions
      .filter(s => s.timestamp.startsWith(dateStr))
      .reduce((acc, s) => acc + (s.duration_minutes || (s as any).durationMinutes || 0), 0);

    const heightPct = Math.min(100, Math.round((dayMinutes / (4 * 60)) * 100));
    return { date: dateStr, dayName, minutes: dayMinutes, heightPct: Math.max(8, heightPct) };
  });

  const completedHabits = habits.filter(h => h.streak > 0).length;
  const habitCompletionRate = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 100;

  const dsaLevel = Math.max(1, Math.min(10, Math.floor(dsaMinutes / 60) + 1));
  const dsaProgress = Math.min(100, Math.round(((dsaMinutes % 60) / 60) * 100));

  const mlLevel = Math.max(1, Math.min(10, Math.floor(mlMinutes / 60) + 1));
  const mlProgress = Math.min(100, Math.round(((mlMinutes % 60) / 60) * 100));

  const problemSolvingProgress = Math.min(100, Math.round((totalProblemsSolved / 50) * 100));
  const disciplineScore = Math.min(100, Math.round((profile.streakDays * 5) + (profile.todayStudiedMinutes / 4)));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        paddingBottom: 100,
        color: 'var(--text-primary)'
      }}
    >
      {/* Clean Header: ONLY 'FUSION SYSTEM' */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/icons/ANALYTICS.gif" alt="Analytics" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <h2
            className="font-tech"
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            FUSION SYSTEM
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              background: 'rgba(2, 132, 199, 0.1)',
              color: '#0284C7',
              border: '1px solid rgba(2, 132, 199, 0.2)'
            }}
          >
            <Sparkles size={14} />
            <span>{profile.handle} • Level {profile.level}</span>
          </span>
        </div>
      </div>

      {/* Vacation & Streak Protection (Pause Mode) Card */}
      <GlassCard
        style={{
          padding: '24px 28px',
          background: isVacationPaused
            ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.9) 0%, rgba(255, 237, 213, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(240, 249, 255, 0.9) 0%, rgba(245, 243, 255, 0.85) 100%)',
          border: isVacationPaused
            ? '1.5px solid rgba(245, 158, 11, 0.45)'
            : '1.5px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: isVacationPaused ? 'rgba(217, 119, 6, 0.15)' : 'rgba(99, 102, 241, 0.12)',
                  color: isVacationPaused ? '#B45309' : '#4F46E5',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Plane size={13} />
                <span>VACATION & STREAK PROTECTION (PAUSE MODE)</span>
              </span>

              {isVacationPaused && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    background: '#F59E0B',
                    color: '#FFFFFF'
                  }}
                >
                  PAUSE ACTIVE • XP DEDUCTION FROZEN
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 8px 0' }}>
              <img src="/icons/vacation.gif" alt="Vacation" style={{ width: 38, height: 38, objectFit: 'contain' }} />
              <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {isVacationPaused ? '🌴 Vacation Mode is Currently ACTIVE' : '🏖️ Planning a Break or Holiday? Activate Vacation Pause'}
              </h3>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.5, maxWidth: '680px' }}>
              When activated, daily XP deductions and task punishment penalties are completely frozen.
              <strong style={{ color: '#0F172A' }}> Streak Protection Requirement:</strong> You must watch at least <strong>1 video from your course playlist</strong> to keep your streak intact during vacation. If activated without watching a playlist video, the streak will break.
            </p>

            {/* Live Requirement Status Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {hasWatchedPlaylistVideoToday ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>1+ Playlist Video Watched — Streak Safely Protected!</span>
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#DC2626',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <AlertCircle size={14} />
                  <span>0 Playlist Videos Watched — Watch 1 playlist video to safeguard streak!</span>
                </span>
              )}

              {vacationFeedback && (
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: vacationFeedback.isProtected ? '#059669' : '#DC2626' }}>
                  {vacationFeedback.text}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {!hasWatchedPlaylistVideoToday && (
              <button
                onClick={() => setActiveModule('courses')}
                className="glass-pill"
                style={{
                  padding: '10px 18px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  background: 'rgba(2, 132, 199, 0.12)',
                  color: '#0284C7',
                  border: '1px solid rgba(2, 132, 199, 0.3)'
                }}
              >
                <Tv size={15} />
                <span>Watch Playlist Video</span>
              </button>
            )}

            <button
              onClick={() => {
                const res = toggleVacationMode();
                setVacationFeedback({ text: res.message, isProtected: res.isProtected });
              }}
              className="charcoal-pill-btn"
              style={{
                padding: '11px 22px',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: isVacationPaused
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                boxShadow: isVacationPaused
                  ? '0 6px 18px rgba(16, 185, 129, 0.25)'
                  : '0 6px 18px rgba(245, 158, 11, 0.3)'
              }}
            >
              {isVacationPaused ? <Play size={16} /> : <Pause size={16} />}
              <span>{isVacationPaused ? 'Deactivate Pause (Resume Study)' : 'Activate Vacation Pause'}</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* =========================================================================
          ROW 1: HUNTER PROFILE CARD + HABIT TRACKER (Light Glassmorphism Theme)
          ========================================================================= */}
      <div className="responsive-grid-duo">
        {/* Top Left: Hunter System Profile Card */}
        <GlassCard
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Ambient Glow Orb */}
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(2, 132, 199, 0.12) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
              {/* Glowing Avatar */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  padding: 3,
                  background: 'linear-gradient(135deg, #0284C7 0%, #10B981 50%, #F59E0B 100%)',
                  boxShadow: '0 8px 20px rgba(2, 132, 199, 0.25)'
                }}
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#0284C7'
                  }}
                >
                  FUSION CADET • LEVEL {profile.level}
                </span>
                <h3
                  className="font-tech"
                  style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', margin: '2px 0 6px 0' }}
                >
                  {profile.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(2, 132, 199, 0.1)',
                      color: '#0284C7'
                    }}
                  >
                    Level {profile.level}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {profile.handle}
                  </span>
                </div>
              </div>
            </div>

            {/* EXP Progress Bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>SYSTEM EXP</span>
                <span style={{ color: '#0284C7', fontWeight: 800 }}>
                  {profile.totalXp} / 5,000 XP
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 10,
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(0, 0, 0, 0.06)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.round((profile.totalXp / 5000) * 100))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #0284C7 0%, #38BDF8 50%, #10B981 100%)',
                    borderRadius: 'var(--radius-pill)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hunter Core Attributes Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              paddingTop: 16,
              borderTop: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>STREAK</div>
              <div className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#EA580C' }}>
                {profile.streakDays}d
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>STUDY HRS</div>
              <div className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284C7' }}>
                {totalStudyHours}h
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>PROBLEMS</div>
              <div className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10B981' }}>
                {totalProblemsSolved}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Top Right: HABIT TRACKER */}
        <GlassCard
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                HABIT TRACKER
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 700 }}>
                {habitCompletionRate}% Completed Today
              </span>
            </div>

            {/* Vertical Bar Chart */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: 160,
                padding: '0 10px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                marginBottom: 16
              }}
            >
              {past7Days.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                >
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {day.minutes > 0 ? `${Math.round(day.minutes / 60)}h` : '0'}
                  </span>

                  {/* Clean Gradient Bar */}
                  <div
                    style={{
                      width: 28,
                      height: `${day.heightPct}%`,
                      minHeight: 12,
                      borderRadius: '8px 8px 4px 4px',
                      background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
                      boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
                      transition: 'height 0.4s ease'
                    }}
                  />

                  <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                    {day.dayName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-metrics */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SlidersHorizontal size={16} color="#0284C7" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Consistency Rating</span>
            </div>
            <span className="font-tech" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10B981' }}>
              {disciplineScore}/100 Score
            </span>
          </div>
        </GlassCard>
      </div>

      {/* =========================================================================
          ROW 2: SKILL TRACKER + SESSION SUCCESS / STUDY HOURS
          ========================================================================= */}
      <div className="responsive-grid-duo">
        {/* Mid Left: SKILL TRACKER */}
        <GlassCard
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              SKILL TRACKER
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active Masteries</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Skill 1: DSA */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(2, 132, 199, 0.15)',
                      color: '#0284C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    1
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                    Data Structures & Algorithms
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: 700 }}>
                  Lv.{dsaLevel} ({Math.round(dsaMinutes / 60)}h logged)
                </span>
              </div>
              <div style={{ width: '100%', height: 7, borderRadius: 'var(--radius-pill)', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${dsaProgress}%`, height: '100%', background: 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)' }} />
              </div>
            </div>

            {/* Skill 2: Machine Learning */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    2
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                    Machine Learning & Deep Learning
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
                  Lv.{mlLevel} ({Math.round(mlMinutes / 60)}h logged)
                </span>
              </div>
              <div style={{ width: '100%', height: 7, borderRadius: 'var(--radius-pill)', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${mlProgress}%`, height: '100%', background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)' }} />
              </div>
            </div>

            {/* Skill 3: Problem Solving Speed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    3
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                    Problem Solving & Accuracy
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 700 }}>
                  {totalProblemsSolved} Solved
                </span>
              </div>
              <div style={{ width: '100%', height: 7, borderRadius: 'var(--radius-pill)', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${problemSolvingProgress}%`, height: '100%', background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 100%)' }} />
              </div>
            </div>

            {/* Skill 4: Deep Focus Discipline */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(249, 115, 22, 0.15)',
                      color: '#EA580C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    4
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                    Deep Focus & Study Blocks
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 700 }}>
                  {profile.todayStudiedMinutes}m Today
                </span>
              </div>
              <div style={{ width: '100%', height: 7, borderRadius: 'var(--radius-pill)', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${todayProgressPct}%`, height: '100%', background: 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)' }} />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Mid Right: SESSION SUCCESS */}
        <GlassCard
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                SESSION SUCCESS & LOGS
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{userSessions.length} Logs</span>
            </div>

            {/* Quick Metrics Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
                marginBottom: 20,
                padding: '12px 16px',
                borderRadius: '16px',
                background: 'rgba(0, 0, 0, 0.03)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>SESSIONS</span>
                <div className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  {userSessions.length}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL HRS</span>
                <div className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284C7' }}>
                  {totalStudyHours}h
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>STREAK</span>
                <div className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#EA580C' }}>
                  {profile.streakDays}d
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>TODAY GOAL</span>
                <div className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10B981' }}>
                  {todayProgressPct}%
                </div>
              </div>
            </div>

            {/* Visualizer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                height: 120,
                padding: '0 8px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              {past7Days.map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      width: 24,
                      height: `${d.heightPct}%`,
                      minHeight: 14,
                      borderRadius: '8px 8px 3px 3px',
                      background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
                      boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)'
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{d.dayName}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Target: 4.0 Hours Daily (2h DSA + 2h ML)
            </span>
            <span style={{ fontSize: '0.82rem', color: '#0284C7', fontWeight: 700 }}>
              {hoursLeft}h remaining today
            </span>
          </div>
        </GlassCard>
      </div>

      {/* =========================================================================
          ROW 3: GOAL RADIAL RING + TODAY'S MILESTONES
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 20
        }}
      >
        {/* Radial Progress Ring Card */}
        <GlassCard
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>
            GOAL COMPLETION
          </span>

          {/* Radial Circular Progress Gauge */}
          <div
            style={{
              position: 'relative',
              width: 140,
              height: 140,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `conic-gradient(#0284C7 ${todayProgressPct * 3.6}deg, rgba(0,0,0,0.06) 0deg)`,
              boxShadow: '0 4px 18px rgba(2, 132, 199, 0.18)'
            }}
          >
            {/* Inner Cutout */}
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <span className="font-tech" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>
                {todayProgressPct}%
              </span>
              <span style={{ fontSize: '0.7rem', color: '#0284C7', fontWeight: 700 }}>
                4h TARGET
              </span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
              {(profile.todayStudiedMinutes / 60).toFixed(1)}h / 4.0h Studied
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              {hoursLeft} Hours remaining to hit daily target
            </span>
          </div>
        </GlassCard>

        {/* Daily Quests & Focus Blocks */}
        <GlassCard
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              TODAY'S STUDY MILESTONES
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: 600 }}>Daily Targets</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dailyTasks.slice(0, 4).map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: '16px',
                  background: task.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 0, 0, 0.03)',
                  border: task.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(0, 0, 0, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ color: task.completed ? '#10B981' : 'var(--text-muted)' }}>
                    {task.completed ? <CheckCircle2 size={18} /> : <Target size={18} />}
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: task.completed ? '#059669' : '#0F172A',
                        textDecoration: task.completed ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {task.platform} • {task.isCoreStreakTask ? 'Core Challenge' : 'Standard'}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: task.completed ? '#059669' : '#0284C7'
                  }}
                >
                  +{task.exp} XP
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* =========================================================================
          ROW 4: ACTIVITY HEATMAP MATRIX (Light Glassmorphic Matrix)
          ========================================================================= */}
      <GlassCard
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '28px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              ACTIVITY HEATMAP
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              90-day real-time contribution matrix (minutes of study logged per date)
            </span>
          </div>

          {hoveredDay && (
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0284C7',
                background: 'rgba(2, 132, 199, 0.1)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(2, 132, 199, 0.25)'
              }}
            >
              {hoveredDay.date}: {hoveredDay.count} minutes studied
            </div>
          )}
        </div>

        {/* Heatmap Squares Grid (Touch scrollable on mobile) */}
        <div className="mobile-scroll-row" style={{ padding: '6px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(14px, 1fr))',
              gap: 5,
              width: '100%',
              minWidth: '560px',
              padding: '6px 0'
            }}
          >
            {heatmapData.map((day, idx) => {
              let bg = 'rgba(0, 0, 0, 0.06)';
              let shadow = 'none';

              if (day.intensity === 1) {
                bg = 'rgba(2, 132, 199, 0.25)';
              } else if (day.intensity === 2) {
                bg = 'rgba(2, 132, 199, 0.55)';
              } else if (day.intensity === 3) {
                bg = '#0284C7';
                shadow = '0 0 6px rgba(2, 132, 199, 0.4)';
              } else if (day.intensity === 4) {
                bg = '#0369A1';
                shadow = '0 0 8px rgba(3, 105, 161, 0.5)';
              }

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                  onMouseLeave={() => setHoveredDay(null)}
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    borderRadius: 3,
                    background: bg,
                    boxShadow: shadow,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                  title={`${day.date}: ${day.count} mins`}
                />
              );
            })}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 12, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <span>Less</span>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(0, 0, 0, 0.06)' }} />
          <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(2, 132, 199, 0.25)' }} />
          <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(2, 132, 199, 0.55)' }} />
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#0284C7' }} />
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#0369A1' }} />
          <span>More (3h+)</span>
        </div>
      </GlassCard>
    </div>
  );
};
