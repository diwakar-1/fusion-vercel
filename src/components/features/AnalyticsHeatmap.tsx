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
    currentUser,
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
  const currentLower = (currentUser || 'diwakar').toLowerCase();
  const profileLower = (profile.name || '').toLowerCase();

  const userSessions = studySessions.filter(s => {
    if (!s) return false;
    const nameLower = (s.user_name || (s as any).userName || '').toLowerCase();
    const idLower = (s.user_id || (s as any).userId || '').toLowerCase();
    // If no user specified on session, count as current user
    if (!nameLower && !idLower) return true;
    return (
      nameLower === currentLower ||
      nameLower === profileLower ||
      idLower === `u_${currentLower}` ||
      idLower.includes(currentLower)
    );
  });

  const now = new Date();
  const todayLocalStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayIsoStr = now.toISOString().split('T')[0];

  // Robust session timestamp matcher across timezones (local date, UTC ISO date, or numeric epoch)
  const isSessionOnDate = (s: any, targetD: Date, dateStr: string, isoStr: string) => {
    if (!s || !s.timestamp) return false;
    if (typeof s.timestamp === 'string') {
      if (s.timestamp.startsWith(dateStr) || s.timestamp.startsWith(isoStr)) return true;
    }
    try {
      const sDate = new Date(s.timestamp);
      if (!isNaN(sDate.getTime())) {
        const matchLocal =
          sDate.getFullYear() === targetD.getFullYear() &&
          sDate.getMonth() === targetD.getMonth() &&
          sDate.getDate() === targetD.getDate();
        if (matchLocal) return true;

        const matchUtc =
          sDate.getUTCFullYear() === targetD.getFullYear() &&
          sDate.getUTCMonth() === targetD.getMonth() &&
          sDate.getUTCDate() === targetD.getDate();
        if (matchUtc) return true;
      }
    } catch {}
    return false;
  };

  const sessionTotalMinutes = userSessions.reduce((acc, s) => acc + (s.duration_minutes || (s as any).durationMinutes || 0), 0);
  const todaySessionMinutes = userSessions
    .filter(s => isSessionOnDate(s, now, todayLocalStr, todayIsoStr))
    .reduce((acc, s) => acc + (s.duration_minutes || (s as any).durationMinutes || 0), 0);
  const unloggedTodayMinutes = Math.max(0, (profile.todayStudiedMinutes || 0) - todaySessionMinutes);
  const totalStudyMinutes = sessionTotalMinutes + unloggedTodayMinutes;
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const dsaMinutes = userSessions
    .filter(s => {
      const sub = (s.subject_name || (s as any).subject || '').toLowerCase();
      return sub.includes('dsa') || sub.includes('algo') || sub.includes('code');
    })
    .reduce((acc, s) => acc + (s.duration_minutes || (s as any).durationMinutes || 0), 0);

  const mlMinutes = userSessions
    .filter(s => {
      const sub = (s.subject_name || (s as any).subject || '').toLowerCase();
      return sub.includes('ml') || sub.includes('machine') || sub.includes('ai');
    })
    .reduce((acc, s) => acc + (s.duration_minutes || (s as any).durationMinutes || 0), 0);

  const totalProblemsSolved =
    dsaSessions.reduce((acc, s) => acc + s.problemsCount, 0) +
    pdfQuestionSheets.reduce((acc, s) => acc + s.completedCount, 0);

  const dailyGoalHours = Math.max(2, profile.dailyGoalHours || 4);
  const dailyGoalMinutes = dailyGoalHours * 60;
  const todayProgressPct = Math.min(100, Math.round((profile.todayStudiedMinutes / dailyGoalMinutes) * 100));
  const minutesLeft = Math.max(0, dailyGoalMinutes - profile.todayStudiedMinutes);
  const hoursLeft = (minutesLeft / 60).toFixed(1);

  // Past 7 Days study telemetry
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const isoStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayMinutes = userSessions
      .filter(s => isSessionOnDate(s, d, dateStr, isoStr))
      .reduce((acc, s) => acc + (s.duration_minutes || (s as any).durationMinutes || 0), 0);

    const isToday = i === 6;
    const effectiveDayMinutes = isToday ? Math.max(dayMinutes, profile.todayStudiedMinutes || 0) : dayMinutes;
    return { date: dateStr, dayName, minutes: effectiveDayMinutes, isToday };
  });

  const maxWeeklyMinutes = Math.max(
    dailyGoalMinutes,
    ...past7Days.map(d => d.minutes),
    60
  );

  // Past 7 Days Habit Tracker Telemetry
  const totalHabitCount = habits.length > 0 ? habits.length : (dailyTasks.length > 0 ? dailyTasks.length : 4);
  const completedHabitsToday = habits.filter(h => h.completedToday).length;
  const completedTasksToday = dailyTasks.filter(t => t.completed).length;
  const effectiveCompletedToday = Math.max(completedHabitsToday, completedTasksToday > 0 ? Math.min(totalHabitCount, completedTasksToday) : 0);

  const habitCompletionRate = totalHabitCount > 0 ? Math.round((effectiveCompletedToday / totalHabitCount) * 100) : 100;

  const past7Habits = past7Days.map((d, i) => {
    const isToday = i === 6;
    let completedCount = 0;
    if (isToday) {
      completedCount = effectiveCompletedToday;
      if (completedCount === 0 && (profile.todayStudiedMinutes > 0 || totalProblemsSolved > 0)) {
        completedCount = 1;
      }
    } else {
      completedCount = habits.filter(h => {
        const inHistory = Boolean(h.weeklyHistory && h.weeklyHistory[i]);
        const inStreak = (h.streak || 0) >= (6 - i);
        return inHistory || inStreak;
      }).length;
    }
    const rate = totalHabitCount > 0 ? Math.min(100, Math.round((completedCount / totalHabitCount) * 100)) : 0;
    return {
      dayName: d.dayName,
      date: d.date,
      isToday,
      completedCount,
      totalCount: totalHabitCount,
      rate
    };
  });

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
            className="font-tech analytics-header-title"
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

      {/* =========================================================================
          ROW 1: HUNTER PROFILE CARD + HABIT TRACKER (Light Glassmorphism Theme)
          ========================================================================= */}
      <div className="responsive-grid-duo">
        {/* Top Left: Hunter System Profile Card */}
        <GlassCard
          className="analytics-card"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
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
                className="analytics-avatar-wrapper"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  padding: 3,
                  background: 'linear-gradient(135deg, #0284C7 0%, #10B981 50%, #F59E0B 100%)',
                  boxShadow: '0 8px 20px rgba(2, 132, 199, 0.25)',
                  flexShrink: 0
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
          className="analytics-card"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
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

            {/* Vertical Bar Chart for Habits */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: 160,
                padding: '0 6px 10px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                marginBottom: 16
              }}
            >
              {past7Habits.map((hDay, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    height: '100%',
                    justifyContent: 'flex-end',
                    flex: 1
                  }}
                  title={`${hDay.dayName}: ${hDay.completedCount}/${hDay.totalCount} Habits Completed (${hDay.rate}%)`}
                >
                  {/* Completion rate above bar */}
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: hDay.rate > 0 ? (hDay.rate === 100 ? '#059669' : '#0284C7') : 'var(--text-muted)'
                    }}
                  >
                    {hDay.rate > 0 ? `${hDay.rate}%` : '0%'}
                  </span>

                  {/* Clean Track Container with Vertical Bar */}
                  <div
                    style={{
                      width: 28,
                      height: 100,
                      borderRadius: 8,
                      background: hDay.isToday ? 'rgba(2, 132, 199, 0.09)' : 'rgba(0, 0, 0, 0.04)',
                      border: hDay.isToday ? '1px solid rgba(2, 132, 199, 0.35)' : '1px solid rgba(0, 0, 0, 0.03)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(hDay.rate > 0 ? 12 : 6, hDay.rate)}%`,
                        borderRadius: '6px 6px 0 0',
                        background: hDay.rate === 100
                          ? 'linear-gradient(180deg, #34D399 0%, #059669 100%)'
                          : hDay.rate > 0
                            ? 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)'
                            : 'rgba(0, 0, 0, 0.08)',
                        boxShadow: hDay.rate > 0 ? '0 3px 8px rgba(2, 132, 199, 0.25)' : 'none',
                        transition: 'height 0.4s ease'
                      }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    style={{
                      fontSize: '0.74rem',
                      color: hDay.isToday ? '#0284C7' : '#475569',
                      fontWeight: hDay.isToday ? 800 : 600
                    }}
                  >
                    {hDay.dayName}
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
          className="analytics-card"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
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
          className="analytics-card"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
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
              className="analytics-session-metrics"
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
                justifyContent: 'space-between',
                height: 140,
                padding: '0 6px 10px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              {past7Days.map((d, i) => {
                const fillPct = d.minutes > 0
                  ? Math.max(14, Math.min(100, Math.round((d.minutes / maxWeeklyMinutes) * 100)))
                  : 0;

                const displayVal = d.minutes >= 60
                  ? `${(d.minutes / 60).toFixed(1)}h`
                  : d.minutes > 0
                    ? `${d.minutes}m`
                    : '0h';

                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      height: '100%',
                      justifyContent: 'flex-end',
                      flex: 1
                    }}
                    title={`${d.dayName}: ${displayVal} studied`}
                  >
                    {/* Hour/Minute Badge above bar */}
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: d.minutes > 0 ? '#0284C7' : 'var(--text-muted)'
                      }}
                    >
                      {displayVal}
                    </span>

                    {/* Clean Track Container with Vertical Bar */}
                    <div
                      style={{
                        width: 28,
                        height: 85,
                        borderRadius: 8,
                        background: d.isToday ? 'rgba(2, 132, 199, 0.09)' : 'rgba(0, 0, 0, 0.04)',
                        border: d.isToday ? '1px solid rgba(2, 132, 199, 0.35)' : '1px solid rgba(0, 0, 0, 0.03)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${fillPct > 0 ? fillPct : 6}%`,
                          borderRadius: '6px 6px 0 0',
                          background: fillPct > 0
                            ? (d.isToday
                                ? 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)'
                                : 'linear-gradient(180deg, #60A5FA 0%, #2563EB 100%)')
                            : 'rgba(0, 0, 0, 0.08)',
                          boxShadow: fillPct > 0 ? '0 3px 8px rgba(2, 132, 199, 0.25)' : 'none',
                          transition: 'height 0.4s ease'
                        }}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: d.isToday ? '#0284C7' : '#475569',
                        fontWeight: d.isToday ? 800 : 600
                      }}
                    >
                      {d.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Target: {dailyGoalHours.toFixed(1)} Hours Daily ({(profile.dsaGoalHours || 2).toFixed(1)}h DSA + {(profile.mlGoalHours || 2).toFixed(1)}h ML)
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
      <div className="responsive-analytics-row3">
        {/* Radial Progress Ring Card */}
        <GlassCard
          className="analytics-card"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
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
                {dailyGoalHours.toFixed(1)}h TARGET
              </span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
              {(profile.todayStudiedMinutes / 60).toFixed(1)}h / {dailyGoalHours.toFixed(1)}h Studied
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              {hoursLeft} Hours remaining to hit daily target
            </span>
          </div>
        </GlassCard>

        {/* Daily Quests & Focus Blocks */}
        <GlassCard
          className="analytics-card"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '28px',
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
        className="analytics-card"
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                ACTIVITY HEATMAP
              </h3>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '10px',
                  background: 'rgba(2, 132, 199, 0.1)',
                  color: '#0284C7'
                }}
              >
                {heatmapData.filter(d => d.count > 0).length} Active Study Days
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              90-day real-time contribution matrix • {(heatmapData.reduce((acc, d) => acc + d.count, 0) / 60).toFixed(1)}h logged
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
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', padding: '6px 0' }}>
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
              const isToday = day.date === todayLocalStr || day.date === todayIsoStr;
              let bg = 'rgba(0, 0, 0, 0.05)';
              let shadow = 'none';

              if (day.intensity === 1) {
                bg = '#BAE6FD';
              } else if (day.intensity === 2) {
                bg = '#38BDF8';
              } else if (day.intensity === 3) {
                bg = '#0284C7';
                shadow = '0 0 6px rgba(2, 132, 199, 0.35)';
              } else if (day.intensity === 4) {
                bg = '#0369A1';
                shadow = '0 0 8px rgba(3, 105, 161, 0.45)';
              }

              return (
                <div
                  key={idx}
                  onClick={() => setHoveredDay({ date: day.date, count: day.count })}
                  onTouchStart={() => setHoveredDay({ date: day.date, count: day.count })}
                  onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                  onMouseLeave={() => setHoveredDay(null)}
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    borderRadius: 4,
                    background: bg,
                    boxShadow: shadow,
                    outline: isToday ? '2px solid #0284C7' : 'none',
                    outlineOffset: isToday ? 1 : 0,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title={`${day.date}${isToday ? ' (Today)' : ''}: ${day.count} mins`}
                />
              );
            })}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 12, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <span>Less</span>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(0, 0, 0, 0.05)' }} />
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#BAE6FD' }} />
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#38BDF8' }} />
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#0284C7' }} />
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#0369A1' }} />
          <span>More (3h+)</span>
        </div>
      </GlassCard>
    </div>
  );
};
