import React from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { Sparkles, Flame, Zap, Users, MessageSquareText, Activity, Bell } from 'lucide-react';

export const GlassNavbar: React.FC = () => {
  const {
    profile,
    activeFriend,
    setActiveModule,
    isAiChatOpen,
    setIsAiChatOpen,
    isBackendConnected,
    setIsProfileModalOpen,
    triggerManualStreakReminder
  } = useStudentOs();

  return (
    <header className="responsive-navbar">
      {/* Left: Brand Identity */}
      <div
        onClick={() => setActiveModule('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
      >
        <img
          src="/icons/LOGO.gif"
          alt="FUSION Logo"
          className="nav-logo-img"
          style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            objectFit: 'contain',
            boxShadow: '0 4px 12px rgba(30, 30, 36, 0.15)'
          }}
        />
        <div>
          <h1
            className="font-tech nav-logo-text"
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              lineHeight: 1.1,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em'
            }}
          >
            FUSION
          </h1>
        </div>
      </div>

      {/* Right: Gamified Stats, AI Assistant & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {/* Streak Badge */}
        <div
          className="glass-pill nav-badge-compact"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: '#EA580C'
          }}
          title={`${profile.streakDays} Day Streak`}
        >
          <img src="/icons/STREAK.gif" alt="Streak" style={{ width: 17, height: 17, objectFit: 'contain' }} />
          <span>{profile.streakDays}d<span className="nav-badge-hide-mobile"> Streak</span></span>
        </div>

        {/* 30-Minute Streak & Task Reminder Pill */}
        <button
          onClick={triggerManualStreakReminder}
          className="glass-pill nav-badge-compact"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 11px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            background: 'rgba(254, 243, 199, 0.65)',
            color: '#B45309'
          }}
          title="Streak & Task Reminders fire every 30 mins. Click to test alert sound & notification!"
        >
          <Bell size={14} style={{ color: '#D97706' }} />
          <span>30m<span className="nav-badge-hide-mobile"> Reminder</span></span>
        </button>

        {/* XP Badge */}
        <div
          className="glass-pill nav-badge-compact"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: '#6366F1'
          }}
          title={`${profile.totalXp} XP`}
        >
          <img src="/icons/XP.gif" alt="XP" style={{ width: 17, height: 17, objectFit: 'contain' }} />
          <span>{profile.totalXp} <span className="nav-badge-hide-mobile">XP</span></span>
        </div>

        {/* FUSE AI Button */}
        <button
          onClick={() => setIsAiChatOpen(!isAiChatOpen)}
          className="glass-pill nav-badge-compact"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            fontSize: '0.84rem',
            fontFamily: 'var(--font-tech)',
            fontWeight: 700,
            cursor: 'pointer',
            border: isAiChatOpen ? '1.5px solid #8B5CF6' : '1px solid rgba(139, 92, 246, 0.3)',
            background: isAiChatOpen ? 'rgba(237, 233, 254, 0.9)' : 'rgba(245, 243, 255, 0.65)',
            color: '#7C3AED'
          }}
        >
          <img src="/icons/FUSE.gif" alt="FUSE" style={{ width: 17, height: 17, objectFit: 'contain' }} />
          <span>FUSE</span>
        </button>

        {/* User Profile Avatar */}
        <div
          onClick={() => setIsProfileModalOpen(true)}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            padding: 2,
            background: 'linear-gradient(135deg, #5EEAD4 0%, #FB923C 100%)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            flexShrink: 0
          }}
          title={`${profile.name} (${profile.handle}) - Click to customize`}
        >
          <img
            src={profile.avatar}
            alt={profile.name}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      </div>
    </header>
  );
};
