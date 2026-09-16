import React, { useState } from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import { Play, Pause, RotateCcw, Clock, BookOpen, Flame, Award, Plus, Check, Sliders, Users, Target } from 'lucide-react';

export const StudyTracker: React.FC = () => {
  const {
    profile,
    activeFriend,
    timerSeconds,
    timerDurationMinutes,
    setTimerDurationMinutes,
    isTimerRunning,
    timerMode,
    timerSubject,
    setTimerSubject,
    startTimer,
    pauseTimer,
    resetTimer,
    studySessions
  } = useStudentOs();

  const [subjects] = useState<string[]>([
    'DSA',
    'Machine Learning',
    'Operating Systems',
    'Database Management',
    'System Design',
    'General Coding'
  ]);

  const [customInputMinutes, setCustomInputMinutes] = useState<number>(timerDurationMinutes);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const dailyGoalHours = Math.max(2, profile.dailyGoalHours || 4);
  const dailyGoalMinutes = dailyGoalHours * 60;
  const progressPct = Math.min(100, Math.round((profile.todayStudiedMinutes / dailyGoalMinutes) * 100));
  const hoursLeft = Math.max(0, (dailyGoalMinutes - profile.todayStudiedMinutes) / 60).toFixed(1);

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputMinutes > 0 && customInputMinutes <= 300) {
      setTimerDurationMinutes(customInputMinutes);
      resetTimer('focus');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.12)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)'
              }}
            >
              FOCUS SESSION ENGINE
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Target: {dailyGoalHours.toFixed(1)} Hours Daily ({(profile.dsaGoalHours || 2).toFixed(1)}h DSA + {(profile.mlGoalHours || 2).toFixed(1)}h ML) • Synced with {activeFriend.name}
            </span>
          </div>

          <h2
            className="font-tech"
            style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}
          >
            Study Focus & Pomodoro Engine
          </h2>
        </div>

        {/* Live Partner Sync Badge */}
        <div
          className="glass-pill"
          style={{
            padding: '8px 16px',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: activeFriend.isFocusing ? '1px solid #16A34A' : '1px solid rgba(0,0,0,0.1)'
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: activeFriend.isOnline ? '#16A34A' : '#94A3B8',
              boxShadow: activeFriend.isOnline ? '0 0 8px #16A34A' : 'none'
            }}
          />
          <span>Partner ({activeFriend.name}): {activeFriend.isFocusing ? `Focusing on ${activeFriend.focusSubject}` : 'Online in Room'}</span>
        </div>
      </div>

      <div className="responsive-grid-duo" style={{ gap: 24 }}>
        {/* Main Focus Clock Card */}
        <GlassCard style={{ textAlign: 'center', padding: '36px 28px' }}>
          {/* Preset Buttons & Custom Duration */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setTimerDurationMinutes(25);
                setCustomInputMinutes(25);
                resetTimer('focus');
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontFamily: 'var(--font-tech)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: timerMode === 'focus' && timerDurationMinutes === 25 ? 'var(--charcoal-pill)' : 'rgba(255,255,255,0.7)',
                color: timerMode === 'focus' && timerDurationMinutes === 25 ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              Default (25m)
            </button>

            <button
              onClick={() => {
                setTimerDurationMinutes(45);
                setCustomInputMinutes(45);
                resetTimer('focus');
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontFamily: 'var(--font-tech)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: timerMode === 'focus' && timerDurationMinutes === 45 ? 'var(--charcoal-pill)' : 'rgba(255,255,255,0.7)',
                color: timerMode === 'focus' && timerDurationMinutes === 45 ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              Power Block (45m)
            </button>

            <button
              onClick={() => {
                setTimerDurationMinutes(60);
                setCustomInputMinutes(60);
                resetTimer('focus');
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontFamily: 'var(--font-tech)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: timerMode === 'focus' && timerDurationMinutes === 60 ? 'var(--charcoal-pill)' : 'rgba(255,255,255,0.7)',
                color: timerMode === 'focus' && timerDurationMinutes === 60 ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              Deep Sprint (60m)
            </button>

            <button
              onClick={() => resetTimer('short_break')}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontFamily: 'var(--font-tech)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: timerMode === 'short_break' ? 'var(--charcoal-pill)' : 'rgba(255,255,255,0.7)',
                color: timerMode === 'short_break' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              Break (5m)
            </button>
          </div>

          {/* User Custom Duration Form */}
          <form onSubmit={handleApplyCustomMinutes} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Custom Duration:
            </span>
            <input
              type="number"
              min="5"
              max="180"
              step="5"
              value={customInputMinutes}
              onChange={e => setCustomInputMinutes(Number(e.target.value))}
              style={{
                width: '70px',
                padding: '6px 10px',
                borderRadius: '10px',
                border: '1px solid rgba(0,0,0,0.15)',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>mins</span>
            <button
              type="submit"
              className="glass-pill"
              style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Set
            </button>
          </form>

          {/* Subject Selector Pills */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 8 }}>
              FOCUS SUBJECT:
            </span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              {subjects.map(subj => {
                const isSelected = timerSubject === subj;
                return (
                  <button
                    key={subj}
                    onClick={() => setTimerSubject(subj)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: isSelected ? 'var(--charcoal-pill)' : 'rgba(255, 255, 255, 0.7)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)'
                    }}
                  >
                    {subj}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Giant Digital Display */}
          <div
            className="font-tech"
            style={{
              fontSize: '5.2rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: isTimerRunning ? '#0284C7' : '#18181B',
              lineHeight: 1,
              margin: '20px 0'
            }}
          >
            {formatTimer(timerSeconds)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            <button
              onClick={isTimerRunning ? pauseTimer : startTimer}
              className="charcoal-pill-btn"
              style={{ padding: '14px 34px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isTimerRunning ? 'Pause Session' : 'Start Focus Block'}</span>
            </button>

            <button
              onClick={() => resetTimer(timerMode)}
              className="glass-pill"
              style={{ padding: '14px 20px', cursor: 'pointer' }}
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </GlassCard>

        {/* Daily Goal Telemetry & Session History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Daily 4-Hour Goal Card */}
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                DAILY STUDY GOAL: 4.0 HOURS (2h DSA + 2h ML)
              </span>
              <span className="font-tech" style={{ fontSize: '1.2rem', fontWeight: 800, color: progressPct === 100 ? '#16A34A' : '#0284C7' }}>
                {progressPct}%
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: '10px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(0,0,0,0.08)',
                overflow: 'hidden',
                marginBottom: 12
              }}
            >
              <div
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  background: progressPct === 100 ? '#22C55E' : 'linear-gradient(90deg, #38BDF8 0%, #0284C7 100%)',
                  borderRadius: 'var(--radius-pill)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                Studied Today: <strong>{(profile.todayStudiedMinutes / 60).toFixed(1)}h</strong> ({profile.todayStudiedMinutes}m)
              </span>
              <span style={{ color: hoursLeft === '0.0' ? '#16A34A' : '#D97706', fontWeight: 700 }}>
                {hoursLeft === '0.0' ? 'Goal Completed!' : `${hoursLeft}h Left`}
              </span>
            </div>
          </GlassCard>

          {/* Recent Recorded Focus Sessions */}
          <GlassCard style={{ padding: '24px', flex: 1 }}>
            <h4 className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14 }}>
              Recent Study Sessions
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {studySessions.slice(0, 4).map(s => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.75)',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#18181B' }}>
                      {s.subject_name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {s.user_name}
                    </div>
                  </div>
                  <span className="font-tech" style={{ fontWeight: 800, color: '#0284C7', fontSize: '0.94rem' }}>
                    +{s.duration_minutes}m
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
