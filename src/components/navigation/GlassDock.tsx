import React from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import {
  LayoutDashboard,
  Timer,
  CalendarDays,
  Code2,
  BrainCircuit,
  KanbanSquare,
  CheckCircle2,
  BarChart3,
  Users,
  BookOpen,
  Film
} from 'lucide-react';

export const GlassDock: React.FC = () => {
  const { activeModule, setActiveModule } = useStudentOs();

  const dockItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, gif: '/icons/DASHBOARD.gif' },
    { id: 'partner', label: 'Partner Room', icon: Users, gif: '/icons/PARTNER ROOM.gif' },
    { id: 'study', label: 'Study Timer', icon: Timer, gif: '/icons/STUDY TIMER.gif' },
    { id: 'courses', label: 'Playlists', icon: Film, gif: '/icons/PLAYLIST.gif' },
    { id: 'dsa', label: 'DSA Engine', icon: Code2, gif: '/icons/DSA ENGINE.gif' },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays, gif: '/icons/TIME TABLE.gif' },
    { id: 'notes', label: 'Notes & Sheets', icon: BookOpen, gif: '/icons/NOTES.gif' },
    { id: 'ml', label: 'AIML Hub', icon: BrainCircuit, gif: '/icons/AIML HUB.gif' },
    { id: 'habits', label: 'Daily Tasks', icon: CheckCircle2, gif: '/icons/DAILY TASK.gif' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, gif: '/icons/ANALYTICS.gif' }
  ];

  return (
    <nav className="responsive-dock">
      {dockItems.map(item => {
        const isActive = activeModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            title={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: isActive ? '8px 16px' : '8px 12px',
              borderRadius: 'var(--radius-pill)',
              border: isActive ? '1.5px solid rgba(99, 102, 241, 0.35)' : '1.5px solid transparent',
              background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(139, 92, 246, 0.18) 100%)' : 'transparent',
              color: isActive ? '#4338CA' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: isActive ? '0 4px 16px rgba(99, 102, 241, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.8)' : 'none',
              flexShrink: 0
            }}
          >
            <img
              src={item.gif}
              alt={item.label}
              style={{
                width: 28,
                height: 28,
                objectFit: 'contain',
                transform: isActive ? 'scale(1.12)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                filter: isActive
                  ? 'drop-shadow(0 2px 6px rgba(99, 102, 241, 0.35))'
                  : 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08))'
              }}
              onError={(e) => {
                // If GIF doesn't load, fallback to standard styling
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {isActive && (
              <span
                className="font-tech"
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
