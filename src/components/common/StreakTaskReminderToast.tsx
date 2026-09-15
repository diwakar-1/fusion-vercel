import React from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { Bell, CheckCircle2, Flame, X, ArrowRight } from 'lucide-react';

export const StreakTaskReminderToast: React.FC = () => {
  const { reminderToast, dismissReminderToast, setActiveModule } = useStudentOs();

  if (!reminderToast) return null;

  return (
    <div
      className="streak-reminder-toast-responsive"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        border: '1.5px solid rgba(249, 115, 22, 0.4)',
        borderRadius: '20px',
        boxShadow: '0 16px 40px -10px rgba(234, 88, 12, 0.28), 0 0 20px rgba(254, 215, 170, 0.4)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        animation: 'slideUpBounce 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Radiant Top Glow Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #EA580C, #F59E0B, #10B981)'
        }}
      />

      {/* Header with Icon, Title, and Close Button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(254, 215, 170, 0.6) 0%, rgba(254, 240, 138, 0.4) 100%)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)',
              flexShrink: 0
            }}
          >
            <img
              src="/icons/STREAK.gif"
              alt="Streak Reminder"
              style={{ width: 26, height: 26, objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#C2410C',
                  background: 'rgba(254, 215, 170, 0.5)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                30-Min Reminder
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Just now</span>
            </div>
            <h4
              className="font-tech"
              style={{
                fontSize: '0.98rem',
                fontWeight: 800,
                color: '#18181B',
                margin: '2px 0 0 0',
                lineHeight: 1.2
              }}
            >
              {reminderToast.title}
            </h4>
          </div>
        </div>

        <button
          onClick={dismissReminderToast}
          style={{
            border: 'none',
            background: 'rgba(0,0,0,0.04)',
            borderRadius: '50%',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          title="Dismiss reminder"
        >
          <X size={14} />
        </button>
      </div>

      {/* Message Body */}
      <p
        style={{
          fontSize: '0.84rem',
          lineHeight: 1.45,
          color: 'var(--text-secondary)',
          margin: 0,
          paddingLeft: 4
        }}
      >
        {reminderToast.message}
      </p>

      {/* Quick Action Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          paddingTop: 8,
          borderTop: '1px solid rgba(0, 0, 0, 0.06)'
        }}
      >
        <span style={{ fontSize: '0.74rem', color: '#EA580C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Flame size={13} />
          <span>{reminderToast.pendingTasksCount} Tasks Pending Today</span>
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setActiveModule('dashboard');
              dismissReminderToast();
            }}
            className="charcoal-pill-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>Open Tasks</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
