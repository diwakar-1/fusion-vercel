import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { triggerSparkleConfetti } from '../../utils/confettiHelper';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import { RobotMascot } from '../common/RobotMascot';
import {
  Sparkles,
  Flame,
  Zap,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Target,
  Play,
  Pause,
  RotateCcw,
  Check,
  Film,
  BookOpen,
  Code2,
  BrainCircuit,
  MessageSquareText,
  Clock,
  ExternalLink,
  Lock,
  Users
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    profile,
    updateProfile,
    activeFriend,
    setActiveModule,
    setIsAiChatOpen,
    timerSeconds,
    isTimerRunning,
    timerMode,
    timerSubject,
    startTimer,
    pauseTimer,
    resetTimer,
    timetableSchedule,
    isTodayHoliday,
    courses,
    dsaSessions,
    pdfQuestionSheets,
    dailyTasks,
    toggleDailyTask,
    isBackendConnected,
    isStreakProtectedToday
  } = useStudentOs();

  const [celebration, setCelebration] = useState<{
    taskTitle: string;
    xp: number;
    streakGranted: boolean;
  } | null>(null);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 4 Core Required Telemetry Calculations with Dynamic Goal (Min 2h)
  const streakCount = profile.streakDays;
  const todayHoursStudied = (profile.todayStudiedMinutes / 60).toFixed(1);
  const totalProblemsSolved =
    dsaSessions.reduce((acc, s) => acc + s.problemsCount, 0) +
    pdfQuestionSheets.reduce((acc, s) => acc + s.completedCount, 0);

  // Daily target: user configurable, minimum 2 hours, maximum anything
  const userGoalHours = Math.max(2, profile.dailyGoalHours || 4);
  const dailyGoalMinutes = userGoalHours * 60;
  const minutesLeft = Math.max(0, dailyGoalMinutes - profile.todayStudiedMinutes);
  const hoursLeft = (minutesLeft / 60).toFixed(1);
  const goalProgressPct = Math.min(100, Math.round((profile.todayStudiedMinutes / dailyGoalMinutes) * 100));

  const handleSetGoalHours = (hours: number) => {
    const cleanHours = Math.max(2, hours);
    updateProfile({ dailyGoalHours: cleanHours });
  };

  const handleCompleteBigTask = (taskId: string, title: string, exp: number = 100) => {
    // Find the task to check if XP was already claimed
    const task = dailyTasks.find(t => t.id === taskId);
    const isFirstTime = !task?.xpClaimed;

    toggleDailyTask(taskId, true);
    triggerSparkleConfetti({
      particleCount: isFirstTime ? 60 : 25,
      spread: isFirstTime ? 70 : 35,
      origin: { y: 0.6 }
    });

    // Only show XP celebration if this is the first time
    if (isFirstTime) {
      setCelebration({
        taskTitle: title,
        xp: exp,
        streakGranted: true
      });
      setTimeout(() => {
        setCelebration(null);
      }, 4500);
    }
  };

  const activeCourse = courses[0];
  const nextScheduleSlot = timetableSchedule.find(s => !s.completed) || timetableSchedule[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 100, fontFamily: "var(--font-dashboard), 'Nunito', sans-serif" }}>
      {/* Big Task Celebration Modal / Floating Toast */}
      {celebration && (
        <div
          style={{
            position: 'fixed',
            top: 76,
            right: 16,
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 99999,
            background: 'linear-gradient(135deg, #18181B 0%, #312E81 100%)',
            color: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(49, 46, 129, 0.45), 0 0 25px rgba(254, 240, 138, 0.25)',
            border: '2px solid rgba(254, 240, 138, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px #EA580C',
              flexShrink: 0
            }}
          >
            <img src="/icons/UNLOCKED.gif" alt="Unlocked" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FEF08A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🎉 TASK COMPLETED!
              </span>
              <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#34D399', padding: '2px 8px', borderRadius: 8, fontSize: '0.74rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <img src="/icons/XP.gif" alt="XP" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                +{celebration.xp} XP
              </span>
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', maxWidth: '320px' }}>
              {celebration.taskTitle}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              <img src="/icons/STREAK.gif" alt="Streak" style={{ width: 14, height: 14, objectFit: 'contain' }} />
              <span>Streak Energy Locked & Level Progress Boosted!</span>
            </div>
          </div>
          <button
            onClick={() => setCelebration(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#CBD5E1',
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginLeft: 6
            }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header: Clean Greeting + FUSE AI Trigger */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          paddingTop: 6
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2
              className="dashboard-greeting-title"
              style={{
                fontFamily: "var(--font-dashboard), 'Nunito', sans-serif",
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15
              }}
            >
              Hey {profile.name}!
            </h2>

            {/* Real-time DB Status Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 16,
                fontSize: '0.74rem',
                fontWeight: 700,
                background: (Capacitor.isNativePlatform() || isBackendConnected) ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: (Capacitor.isNativePlatform() || isBackendConnected) ? '#059669' : '#D97706',
                border: `1px solid ${(Capacitor.isNativePlatform() || isBackendConnected) ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: (Capacitor.isNativePlatform() || isBackendConnected) ? '#10B981' : '#F59E0B'
                }}
              />
              {Capacitor.isNativePlatform()
                ? 'Cloud Sync Active'
                : isBackendConnected
                  ? 'Live Real-Time DB Connected'
                  : 'Connecting to Cloud...'}
            </span>

            {/* Punishment / Strike Alert Pill */}
            {((profile.strikes ?? 0) > 0 || Boolean(profile.isPunished)) && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 16,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#DC2626',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}
              >
                <img src="/icons/DANGER.gif" alt="Danger" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                <span>{profile.strikes || 1} Strike Record • Extreme Accountability Active</span>
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 14px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 700,
                background: 'rgba(2, 132, 199, 0.1)',
                color: '#0284C7',
                border: '1px solid rgba(2, 132, 199, 0.2)'
              }}
            >
              <Sparkles size={14} color="#0284C7" />
              <span>{profile.handle} • Level {profile.level}</span>
            </span>
          </div>
        </div>

        {/* Dedicated FUSE AI Action Button */}
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="charcoal-pill-btn"
          style={{
            padding: '10px 24px',
            fontSize: '0.94rem',
            fontFamily: "var(--font-dashboard), 'Nunito', sans-serif",
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'linear-gradient(135deg, #1E1E24 0%, #312E81 100%)',
            boxShadow: '0 8px 24px rgba(49, 46, 129, 0.25)'
          }}
        >
          <img src="/icons/FUSE.gif" alt="FUSE" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          <span>Ask FUSE AI</span>
        </button>
      </div>

      {/* 2. Four Core Stat Cards: Streak, Studied, Problems Solved, Hours Left */}
      <div className="responsive-grid-stats">
        {/* Metric 1: Verified Streak */}
        <GlassCard style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              STREAK COUNT
            </span>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'rgba(234, 88, 12, 0.12)',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/icons/STREAK DASHBOARD.gif" alt="Streak" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-dashboard), 'Nunito', sans-serif", fontSize: '2.5rem', fontWeight: 700, color: '#18181B' }}>
            {streakCount} Days
          </div>
          <span style={{ fontSize: '0.8rem', color: isStreakProtectedToday ? '#15803D' : '#EA580C', fontWeight: 700 }}>
            {isStreakProtectedToday ? '🔥 Protected for today' : '⚡ Complete daily challenge to increase streak'}
          </span>
        </GlassCard>

        {/* Metric 2: Today Studied */}
        <GlassCard style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              STUDIED TODAY
            </span>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'rgba(2, 132, 199, 0.12)',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/icons/DASHBOARD CLOCK.gif" alt="Clock" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-dashboard), 'Nunito', sans-serif", fontSize: '2.4rem', fontWeight: 700, color: '#18181B' }}>
            {todayHoursStudied}h
          </div>
          <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 700 }}>
            {profile.todayStudiedMinutes} real focus minutes logged
          </span>
        </GlassCard>

        {/* Metric 3: Problems Solved */}
        <GlassCard style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              CODING PROBLEMS SOLVED
            </span>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'rgba(79, 70, 229, 0.12)',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/icons/DSA ENGINE.gif" alt="DSA" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-dashboard), 'Nunito', sans-serif", fontSize: '2.4rem', fontWeight: 700, color: '#18181B' }}>
            {totalProblemsSolved}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#4F46E5', fontWeight: 700 }}>
            DSA Sessions & Interactive Sheets
          </span>
        </GlassCard>

        {/* Metric 4: Hours Left */}
        <GlassCard style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              HOURS LEFT TO GOAL
            </span>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: minutesLeft === 0 ? 'rgba(22, 163, 74, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: minutesLeft === 0 ? '#16A34A' : '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/icons/sun.gif" alt="Goal" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--font-dashboard), 'Nunito', sans-serif",
              fontSize: '2.4rem',
              fontWeight: 700,
              color: minutesLeft === 0 ? '#15803D' : '#D97706'
            }}
          >
            {hoursLeft}h
          </div>
          <span style={{ fontSize: '0.8rem', color: minutesLeft === 0 ? '#16A34A' : 'var(--text-muted)', fontWeight: 700 }}>
            {minutesLeft === 0 ? `Daily ${userGoalHours}h target achieved!` : `${goalProgressPct}% of ${userGoalHours}hr goal completed`}
          </span>
        </GlassCard>
      </div>

      {/* 2.5: Interactive Daily Study Goal Selector (Minimum 2hr, Max Anything) */}
      <GlassCard style={{ padding: '20px 24px', background: 'rgba(255, 255, 255, 0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Target size={18} color="#0284C7" />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181B', margin: 0 }}>
                🎯 Set Today's Study Goal (Minimum 2 Hours, Max Anything)
              </h4>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
              Commit to your target for today! Must be done to keep your streak active and avoid XP deduction.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[2, 3, 4, 5, 6, 8].map(h => {
              const isSelected = userGoalHours === h;
              return (
                <button
                  key={h}
                  onClick={() => handleSetGoalHours(h)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    border: isSelected ? '1.5px solid #0284C7' : '1px solid rgba(0,0,0,0.1)',
                    background: isSelected ? 'var(--charcoal-pill)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {h} Hours {h === 2 ? '(Min)' : ''}
                </button>
              );
            })}

            {/* Custom Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFFFF', padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Custom:</span>
              <input
                type="number"
                min="2"
                max="18"
                defaultValue={userGoalHours}
                onBlur={e => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 2) handleSetGoalHours(val);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                    if (!isNaN(val) && val >= 2) handleSetGoalHours(val);
                  }
                }}
                style={{ width: 44, border: 'none', textAlign: 'center', fontWeight: 700, fontSize: '0.88rem', outline: 'none' }}
              />
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>h</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 2.8: Big Task Completion & Streak / XP Power Card */}
      <GlassCard style={{ padding: '22px 24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(254, 240, 138, 0.4) 0%, rgba(253, 230, 138, 0.25) 100%)',
                  border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <img src="/icons/star.gif" alt="Star" style={{ width: 34, height: 34, objectFit: 'contain' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#18181B', margin: 0 }}>
                  Core Tasks & Streak Lock (Complete to Unlock Animation & XP)
                </h4>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Completing core big tasks gives +100 XP and streak protection energy!
                </span>
              </div>
            </div>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: 'rgba(234, 88, 12, 0.1)',
              color: '#EA580C',
              border: '1px solid rgba(234, 88, 12, 0.25)'
            }}
          >
            <img src="/icons/STREAK.gif" alt="Streak" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            <span>{dailyTasks.filter(t => t.completed).length} / {dailyTasks.length} Completed</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {dailyTasks.map(task => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '16px',
                background: task.completed ? 'rgba(240, 253, 244, 0.9)' : '#FFFFFF',
                border: task.completed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <button
                  onClick={() => {
                    if (!task.completed) {
                      handleCompleteBigTask(task.id, task.title, task.exp);
                    } else {
                      toggleDailyTask(task.id, false);
                    }
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    border: task.completed ? 'none' : '2px solid #CBD5E1',
                    background: task.completed ? '#16A34A' : '#FFFFFF',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  title={task.completed ? 'Mark uncompleted' : 'Complete big task'}
                >
                  {task.completed && <Check size={16} strokeWidth={3} />}
                </button>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: task.completed ? '#15803D' : '#1E293B',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                      {task.platform} • {task.xpClaimed ? '✓ XP Claimed' : `+${task.exp} XP`}
                    </span>
                    {task.completed && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: task.completedBy === 'Ayush' ? '#7C3AED' : '#059669',
                          background: task.completedBy === 'Ayush' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                          padding: '1px 6px',
                          borderRadius: '6px'
                        }}
                      >
                        ✓ Completed by {task.completedBy || profile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!task.completed && (
                <button
                  onClick={() => handleCompleteBigTask(task.id, task.title, task.exp)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={12} />
                  <span>Done</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 3. Real-Time Co-Study Banner with Robot Mascot */}
      <div className="costudy-banner-responsive">
        <div className="costudy-banner-content" style={{ zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.85)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#0F766E',
              marginBottom: 12
            }}
          >
            <Sparkles size={14} color="#0D9488" />
            <span>Co-Study Room Active • {activeFriend.name} Online ({activeFriend.streakDays}d Streak)</span>
          </div>

          <h3
            className="font-tech"
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#18181B',
              lineHeight: 1.2,
              marginBottom: 8
            }}
          >
            Diwakar & Ayush Co-Study Hub
          </h3>

          <p
            style={{
              fontSize: '0.98rem',
              lineHeight: 1.5,
              color: '#475569',
              marginBottom: 20,
              maxWidth: '480px'
            }}
          >
            Track each other's live focus state, discuss algorithm solutions in real-time chat, and see what YouTube lecture your partner is watching right now.
          </p>

          <div className="costudy-banner-buttons" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveModule('partner')}
              style={{
                background: '#FFFFFF',
                color: '#18181B',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 'var(--radius-pill)',
                fontFamily: 'var(--font-tech)',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Users size={16} color="#0284C7" />
              <span>Enter Partner Room</span>
            </button>

            <button
              onClick={() => setActiveModule('courses')}
              className="glass-pill"
              style={{
                padding: '12px 22px',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
            >
              <Film size={16} color="#EF4444" />
              <span>YouTube Courses Hub</span>
            </button>
          </div>
        </div>

        {/* Mascot */}
        <div className="costudy-banner-mascot">
          <RobotMascot size={210} animate={true} />
        </div>
      </div>

      {/* 4. Two Column Grid: Focus Timer Engine & Today's Schedule */}
      <div className="responsive-grid-duo" style={{ gap: 24 }}>
        {/* Column 1: Live Focus Timer */}
        <GlassCard style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase' }}>
                DEEP WORK ENGINE
              </span>
              <h4 className="font-tech" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {timerSubject} Focus Block
              </h4>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => resetTimer('focus')}
                className="glass-pill"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: timerMode === 'focus' ? 'var(--charcoal-pill)' : 'transparent',
                  color: timerMode === 'focus' ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                Focus
              </button>
              <button
                onClick={() => resetTimer('short_break')}
                className="glass-pill"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: timerMode === 'short_break' ? 'var(--charcoal-pill)' : 'transparent',
                  color: timerMode === 'short_break' ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                Break
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div
              className="font-tech"
              style={{
                fontSize: '4.2rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: isTimerRunning ? '#0284C7' : '#18181B'
              }}
            >
              {formatTimer(timerSeconds)}
            </div>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              {isTimerRunning ? `Focus block recording for ${profile.name}...` : 'Timer paused. Ready to study.'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              onClick={isTimerRunning ? pauseTimer : startTimer}
              className="charcoal-pill-btn"
              style={{ padding: '12px 28px', fontSize: '0.94rem' }}
            >
              {isTimerRunning ? <Pause size={17} /> : <Play size={17} />}
              <span>{isTimerRunning ? 'Pause Session' : 'Start Focus Block'}</span>
            </button>
            <button
              onClick={() => resetTimer()}
              className="glass-pill"
              style={{ padding: '12px 18px', cursor: 'pointer' }}
              title="Reset Timer"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </GlassCard>

        {/* Column 2: Today's AI Schedule & Holiday Status */}
        <GlassCard style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase' }}>
                AI TIMETABLE SCHEDULE
              </span>
              <h4 className="font-tech" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {isTodayHoliday ? 'Holiday Intensive Schedule' : 'Today\'s Recommended Blocks'}
              </h4>
            </div>
            <button
              onClick={() => setActiveModule('timetable')}
              className="glass-pill"
              style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
            >
              View Full
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {timetableSchedule.slice(0, 3).map((slot, i) => (
              <div
                key={slot.id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.9)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: slot.subject === 'DSA' ? '#4F46E5' : '#0284C7'
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#18181B' }}>
                      {slot.topic}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {slot.subject} • {slot.time}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: slot.subject === 'DSA' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                    color: slot.subject === 'DSA' ? '#4F46E5' : '#0284C7'
                  }}
                >
                  {slot.type}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveModule('timetable')}
            className="charcoal-pill-btn"
            style={{ width: '100%', marginTop: 16, padding: '10px 18px', fontSize: '0.88rem' }}
          >
            <Calendar size={15} />
            <span>Manage Timetable & Upload Schedule</span>
          </button>
        </GlassCard>
      </div>
    </div>
  );
};
