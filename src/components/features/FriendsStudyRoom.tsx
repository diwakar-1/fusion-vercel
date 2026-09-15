import React, { useState } from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import {
  Users,
  Flame,
  Zap,
  Clock,
  Send,
  Coffee,
  Sparkles,
  Radio,
  ExternalLink,
  Play,
  CheckCircle2,
  Tv,
  MessageSquare,
  CheckSquare,
  Square,
  Plus,
  Target,
  ListTodo,
  X,
  Layers,
  Check,
  Award,
  Film,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FriendsStudyRoom: React.FC = () => {
  const {
    profile,
    activeFriend,
    isTimerRunning,
    timerSubject,
    currentWatchingVideo,
    partnerChatMessages,
    sendPartnerChatMessage,
    sendFriendNudge,
    setActiveModule,
    dailyTasks,
    toggleDailyTask,
    addDailyTask,
    courses,
    setActivePlayingCourse
  } = useStudentOs();

  const [chatInput, setChatInput] = useState('');
  const [taskFilter, setTaskFilter] = useState<'All' | 'Completed' | 'Pending' | 'Custom' | 'Core'>('All');
  const [showAddCustomTaskModal, setShowAddCustomTaskModal] = useState<boolean>(false);
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskPlatform, setCustomTaskPlatform] = useState('LeetCode');
  const [customTaskExp, setCustomTaskExp] = useState(50);
  const [customIsCore, setCustomIsCore] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendPartnerChatMessage(chatInput.trim());
    setChatInput('');
  };

  const handleSendNudge = (type: 'nudge' | 'coffee' | 'cheer') => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    sendFriendNudge(type);
  };

  const handleCreateCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskTitle.trim()) return;
    addDailyTask({
      title: customTaskTitle.trim(),
      platform: customTaskPlatform.trim() || 'Custom Duo Quest',
      exp: customTaskExp,
      isCoreStreakTask: customIsCore,
      isCustom: true,
      createdBy: profile.name
    });
    setCustomTaskTitle('');
    setShowAddCustomTaskModal(false);
    confetti({ particleCount: 55, spread: 65 });
  };

  const myHoursStudied = (profile.todayStudiedMinutes / 60).toFixed(1);
  const friendHoursStudied = (activeFriend.todayStudiedMinutes / 60).toFixed(1);

  const completedTasksCount = dailyTasks.filter(t => t.completed).length;
  const customTasksCount = dailyTasks.filter(t => t.isCustom).length;
  const coreTasksCount = dailyTasks.filter(t => t.isCoreStreakTask).length;
  const earnedXp = dailyTasks.filter(t => t.completed).reduce((sum, t) => sum + (t.exp || 0), 0);

  const filteredTasks = dailyTasks.filter(t => {
    if (taskFilter === 'Completed') return t.completed;
    if (taskFilter === 'Pending') return !t.completed;
    if (taskFilter === 'Custom') return !!t.isCustom;
    if (taskFilter === 'Core') return !!t.isCoreStreakTask;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#0D9488',
              background: 'rgba(13, 148, 136, 0.12)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)'
            }}
          >
            CO-STUDY DUO HUB • DIWAKAR & AYUSH
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time focus status, live presence, currently watching YouTube sync, shared tasks, and duo chat
          </span>
        </div>
        <h2
          className="font-tech"
          style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}
        >
          Partner Study Room
        </h2>
      </div>

      {/* Duo Profile Cards Side-by-Side */}
      <div className="responsive-grid-duo">
        {/* Card 1: Your Profile (Diwakar / Ayush) */}
        <GlassCard style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  padding: 3,
                  background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 100%)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                }}
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    {profile.name} (You)
                  </h3>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: '#16A34A',
                      boxShadow: '0 0 8px #16A34A'
                    }}
                    title="Online in Study Room"
                  />
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {profile.handle} • Level {profile.level}
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: isTimerRunning ? 'rgba(34, 197, 94, 0.15)' : 'rgba(0,0,0,0.06)',
                color: isTimerRunning ? '#16A34A' : 'var(--text-muted)'
              }}
            >
              {isTimerRunning ? `Focusing on ${timerSubject}` : 'Idle / In Room'}
            </span>
          </div>

          {/* Key Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STREAK</span>
              <div className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#EA580C' }}>
                {profile.streakDays}d
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TODAY STUDIED</span>
              <div className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284C7' }}>
                {myHoursStudied}h / 4h
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>XP</span>
              <div className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6366F1' }}>
                {profile.totalXp}
              </div>
            </div>
          </div>

          {/* Real-time Currently Watching (Your Video) */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: currentWatchingVideo ? 'rgba(239, 68, 68, 0.06)' : 'rgba(241, 245, 249, 0.7)',
              border: currentWatchingVideo ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(203, 213, 225, 0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: currentWatchingVideo ? '#DC2626' : 'var(--text-muted)', marginBottom: 4 }}>
              <Tv size={14} />
              <span>CURRENTLY WATCHING</span>
              {currentWatchingVideo && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 'auto', color: '#16A34A', fontSize: '0.7rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
                  Live Broadcasting
                </span>
              )}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#18181B' }}>
              {currentWatchingVideo ? currentWatchingVideo.title : 'Not watching any video right now'}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {currentWatchingVideo ? `${currentWatchingVideo.subject} Playlist` : 'Idle / In study room'}
            </span>
          </div>
        </GlassCard>

        {/* Card 2: Partner Profile */}
        <GlassCard style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  padding: 3,
                  background: 'linear-gradient(135deg, #F43F5E 0%, #FB923C 100%)',
                  boxShadow: '0 4px 14px rgba(244, 63, 94, 0.25)'
                }}
              >
                <img
                  src={activeFriend.avatar}
                  alt={activeFriend.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    {activeFriend.name}
                  </h3>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: activeFriend.isOnline ? '#16A34A' : '#94A3B8',
                      boxShadow: activeFriend.isOnline ? '0 0 8px #16A34A' : 'none'
                    }}
                    title={activeFriend.isOnline ? 'Active in Room' : 'Offline'}
                  />
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {activeFriend.handle} • Co-Study Partner
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: activeFriend.isFocusing ? 'rgba(34, 197, 94, 0.15)' : 'rgba(0,0,0,0.06)',
                color: activeFriend.isFocusing ? '#16A34A' : 'var(--text-muted)'
              }}
            >
              {activeFriend.isFocusing ? `Focusing on ${activeFriend.focusSubject || 'DSA'}` : 'In Study Room'}
            </span>
          </div>

          {/* Key Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STREAK</span>
              <div className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#EA580C' }}>
                {activeFriend.streakDays}d
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TODAY STUDIED</span>
              <div className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284C7' }}>
                {friendHoursStudied}h / 4h
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>XP</span>
              <div className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6366F1' }}>
                {activeFriend.totalXp}
              </div>
            </div>
          </div>

          {/* Real-time Currently Watching (Partner Video - No Fake Static Data) */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: activeFriend.currentlyWatching ? 'rgba(56, 189, 248, 0.08)' : 'rgba(241, 245, 249, 0.7)',
              border: activeFriend.currentlyWatching ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(203, 213, 225, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: activeFriend.currentlyWatching ? '#0284C7' : 'var(--text-muted)', marginBottom: 4 }}>
                <Tv size={14} />
                <span>CURRENTLY WATCHING</span>
                {activeFriend.currentlyWatching && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16A34A', fontSize: '0.7rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
                    Live Synced
                  </span>
                )}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  color: '#18181B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {activeFriend.currentlyWatching ? activeFriend.currentlyWatching.title : 'Not watching anything right now'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {activeFriend.currentlyWatching ? `${activeFriend.currentlyWatching.subject} Playlist` : 'Idle / Studying offline'}
              </span>
            </div>

            {activeFriend.currentlyWatching ? (
              <button
                onClick={() => setActiveModule('courses')}
                className="glass-pill"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                Watch Along
              </button>
            ) : (
              <button
                onClick={() => setActiveModule('courses')}
                className="glass-pill"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                Open Playlists
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Duo Quick Interaction Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => handleSendNudge('nudge')}
          className="glass-pill"
          style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
        >
          ⚡ Nudge Partner
        </button>
        <button
          onClick={() => handleSendNudge('coffee')}
          className="glass-pill"
          style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
        >
          ☕ Send Coffee Break
        </button>
        <button
          onClick={() => handleSendNudge('cheer')}
          className="glass-pill"
          style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
        >
          🎉 Send Cheer
        </button>
      </div>

      {/* Live Shared Tasks & Custom Quests Board */}
      <GlassCard style={{ padding: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <ListTodo size={20} color="#6366F1" />
              <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                Shared Duo Task & Custom Quests Board
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Live task telemetry between {profile.name} & {activeFriend.name}. Both can see completed tasks, core streak requirements, and custom quests.
            </p>
          </div>

          <button
            onClick={() => setShowAddCustomTaskModal(true)}
            className="charcoal-pill-btn"
            style={{ padding: '9px 18px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} />
            <span>Add Custom Task for Both</span>
          </button>
        </div>

        {/* Progress & Stat Header */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            marginBottom: 20
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#18181B' }}>
                Today's Duo Completion: {completedTasksCount} / {dailyTasks.length} Done
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669'
                }}
              >
                +{earnedXp} XP Claimed
              </span>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4F46E5' }}>
              {Math.round((completedTasksCount / (dailyTasks.length || 1)) * 100)}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.round((completedTasksCount / (dailyTasks.length || 1)) * 100)}%`,
                height: '100%',
                borderRadius: 4,
                background: 'linear-gradient(90deg, #6366F1 0%, #10B981 100%)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
          {(['All', 'Completed', 'Pending', 'Custom', 'Core'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setTaskFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: taskFilter === tab ? 'var(--charcoal-pill)' : 'rgba(0,0,0,0.05)',
                color: taskFilter === tab ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              {tab === 'All' && `All Tasks (${dailyTasks.length})`}
              {tab === 'Completed' && `Completed (${completedTasksCount})`}
              {tab === 'Pending' && `Pending (${dailyTasks.length - completedTasksCount})`}
              {tab === 'Custom' && `Custom Quests (${customTasksCount})`}
              {tab === 'Core' && `Core Streak Tasks (${coreTasksCount})`}
            </button>
          ))}
        </div>

        {/* Task Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredTasks.map(task => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '16px',
                background: task.completed ? 'rgba(240, 253, 244, 0.85)' : 'rgba(255, 255, 255, 0.75)',
                border: task.completed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                gap: 12
              }}
            >
              {/* Checkbox & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <button
                  onClick={() => toggleDailyTask(task.id, !task.completed)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed ? (
                    <CheckSquare size={22} color="#10B981" />
                  ) : (
                    <Square size={22} color="#94A3B8" />
                  )}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: task.completed ? 600 : 700,
                      color: task.completed ? 'var(--text-muted)' : '#18181B',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      lineHeight: 1.35
                    }}
                  >
                    {task.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        background: 'rgba(0,0,0,0.05)',
                        padding: '1px 7px',
                        borderRadius: '6px'
                      }}
                    >
                      {task.platform}
                    </span>

                    {task.isCoreStreakTask && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'rgba(239, 68, 68, 0.12)',
                          color: '#DC2626',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Flame size={11} />
                        <span>Core Streak Requirement</span>
                      </span>
                    )}

                    {task.isCustom && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'rgba(168, 85, 247, 0.12)',
                          color: '#9333EA',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Sparkles size={11} />
                        <span>Custom Quest {task.createdBy ? `(by ${task.createdBy})` : ''}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* XP Pill & Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-pill)',
                    background: task.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.12)',
                    color: task.completed ? '#059669' : '#4F46E5'
                  }}
                >
                  +{task.exp} XP
                </span>

                {task.completed ? (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: task.completedBy === 'Ayush' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: task.completedBy === 'Ayush' ? '#7C3AED' : '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    ✓ Done by {task.completedBy || profile.name}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(0,0,0,0.06)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    Pending
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No tasks match this filter. Click <strong>"Add Custom Task for Both"</strong> to create a shared quest!
            </div>
          )}
        </div>
      </GlassCard>

      {/* Dedicated Duo Shared Playlists & Syllabus Hub */}
      <GlassCard style={{ padding: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              <Film size={20} />
            </div>
            <div>
              <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                Duo Shared Playlists & Syllabus Hub
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                YouTube course playlists and curriculum tracked synchronously between Diwakar & Ayush
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('courses')}
            className="charcoal-pill-btn"
            style={{ padding: '8px 18px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>Open All in Video Hub</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="responsive-grid-cards" style={{ gap: 14 }}>
          {courses.map(course => {
            const completedLecs = (course.lectures || []).filter(l => l.completed).length;
            const totalLecs = course.lectures?.length || 0;
            const pct = totalLecs > 0 ? Math.round((completedLecs / totalLecs) * 100) : 0;
            const isAyush = course.addedBy === 'Ayush';

            return (
              <div
                key={course.id}
                style={{
                  padding: '18px',
                  borderRadius: '18px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isAyush ? 'rgba(124, 58, 237, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                        color: isAyush ? '#7C3AED' : '#0284C7'
                      }}
                    >
                      Added by {course.addedBy || 'Diwakar'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.05)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {course.subject}
                    </span>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0F172A', lineHeight: 1.35, marginBottom: 4 }}>
                    {course.title}
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {course.currentLesson || `${totalLecs} Lectures`}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Curriculum Progress</span>
                    <span style={{ fontWeight: 700, color: pct === 100 ? '#16A34A' : '#0284C7' }}>
                      {completedLecs}/{totalLecs} ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#16A34A' : 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)', borderRadius: 3 }} />
                  </div>
                  <button
                    onClick={() => {
                      setActivePlayingCourse(course);
                      setActiveModule('courses');
                    }}
                    className="glass-pill"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      background: 'rgba(2, 132, 199, 0.08)',
                      color: '#0284C7',
                      border: '1px solid rgba(2, 132, 199, 0.25)'
                    }}
                  >
                    <Play size={14} fill="#0284C7" />
                    <span>Watch Playlist Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* In-Room Real-Time Duo Chat */}
      <GlassCard style={{ padding: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <MessageSquare size={20} color="#0D9488" />
          <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            Live Duo Study Chat ({profile.name} & {activeFriend.name})
          </h3>
        </div>

        {/* Message Feed */}
        <div
          style={{
            maxHeight: '320px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '10px 4px',
            marginBottom: 16
          }}
        >
          {partnerChatMessages.map(msg => {
            const isMe = msg.sender.toLowerCase() === profile.name.toLowerCase();

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 700, color: isMe ? '#0284C7' : '#EA580C' }}>{msg.sender}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 18px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? 'var(--charcoal-pill)' : 'rgba(255, 255, 255, 0.85)',
                    color: isMe ? '#FFFFFF' : '#18181B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '0.92rem',
                    lineHeight: 1.4
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder={`Message ${activeFriend.name}... (e.g. Syncing 45m DSA focus block now)`}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(0,0,0,0.12)',
              fontSize: '0.94rem',
              outline: 'none',
              background: '#FFFFFF'
            }}
          />
          <button
            type="submit"
            className="charcoal-pill-btn"
            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </GlassCard>

      {/* Add Custom Task Modal */}
      {showAddCustomTaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            padding: 20
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '28px',
              padding: '30px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={22} color="#6366F1" />
                <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Add Custom Task for Both
                </h3>
              </div>
              <button
                onClick={() => setShowAddCustomTaskModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.45 }}>
              This custom quest will immediately appear in both {profile.name}'s and {activeFriend.name}'s task boards and sync in real time.
            </p>

            <form onSubmit={handleCreateCustomTask} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solve LeetCode Daily Challenge, Revise Backprop, Capgemini Prep..."
                  value={customTaskTitle}
                  onChange={e => setCustomTaskTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.92rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>
                    Platform / Subject
                  </label>
                  <select
                    value={customTaskPlatform}
                    onChange={e => setCustomTaskPlatform(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      fontSize: '0.92rem'
                    }}
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Focus Timer">Focus Timer</option>
                    <option value="System Design">System Design</option>
                    <option value="College Project">College Project</option>
                    <option value="Custom Quest">Custom Quest</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>
                    XP Reward
                  </label>
                  <select
                    value={customTaskExp}
                    onChange={e => setCustomTaskExp(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      fontSize: '0.92rem'
                    }}
                  >
                    <option value={25}>+25 XP (Quick)</option>
                    <option value={50}>+50 XP (Standard)</option>
                    <option value={100}>+100 XP (High Impact)</option>
                    <option value={150}>+150 XP (Major Milestone)</option>
                  </select>
                </div>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px 4px'
                }}
              >
                <input
                  type="checkbox"
                  checked={customIsCore}
                  onChange={e => setCustomIsCore(e.target.checked)}
                  style={{ width: 17, height: 17 }}
                />
                <span>Set as Core Streak Requirement (Strict Accountability)</span>
              </label>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddCustomTaskModal(false)}
                  className="glass-pill"
                  style={{ flex: 1, padding: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="charcoal-pill-btn"
                  style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Plus size={16} />
                  <span>Create Duo Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
