import React, { useState, useEffect } from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import {
  X,
  Upload,
  Check,
  Sparkles,
  User,
  Bell,
  BellOff,
  ShieldAlert,
  Palmtree,
  Play,
  Skull,
  Settings,
  Smartphone,
  Save,
  Key,
  Eye,
  EyeOff,
  Bot
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const YoutubeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill={color} />
  </svg>
);

const PRESET_STATIC_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80'
];

const PRESET_GIF_AVATARS = [
  { name: 'Pixel Coder', url: 'https://media.giphy.com/media/LmN8OYiY4m0X85K0Zz/giphy.gif' },
  { name: 'Anime Study', url: 'https://media.giphy.com/media/UQgVaGQeNsTTDZ2UqB/giphy.gif' },
  { name: 'Cyber Terminal', url: 'https://media.giphy.com/media/eNAsjO550VCzaaw79Q/giphy.gif' },
  { name: 'Cozy Cat', url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' },
  { name: 'Neon Matrix', url: 'https://media.giphy.com/media/SWoSkN6DxTszqIKEqv/giphy.gif' }
];

type SettingsTab = 'profile' | 'keys' | 'vacation' | 'discipline' | 'notifications';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    updateProfile,
    updateProfileAvatar,
    logout,
    activeFriend,
    geminiApiKey,
    setGeminiApiKey,
    youtubeApiKey,
    setYoutubeApiKey,
    isVacationPaused,
    toggleVacationMode,
    hasWatchedPlaylistVideoToday,
    setActiveModule,
    enforceTaskAccountability,
    notificationSettings,
    updateNotificationSettings,
    testBackgroundNotification
  } = useStudentOs();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Username & Profile fields state
  const [userName, setUserName] = useState(profile.name);
  const [userHandle, setUserHandle] = useState(profile.handle);
  const [college, setCollege] = useState(profile.college || '');
  const [branch, setBranch] = useState(profile.branch || '');
  const [semester, setSemester] = useState(profile.semester || '');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Avatar state
  const [customUrl, setCustomUrl] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(profile.avatar);
  const [isAvatarSaved, setIsAvatarSaved] = useState(false);

  // User-Specific API Keys state
  const [tempGeminiKey, setTempGeminiKey] = useState(geminiApiKey || '');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiSaveMsg, setGeminiSaveMsg] = useState<string | null>(null);

  const [tempYtKey, setTempYtKey] = useState(youtubeApiKey || '');
  const [showYtKey, setShowYtKey] = useState(false);
  const [ytSaveMsg, setYtSaveMsg] = useState<string | null>(null);

  // Vacation state
  const [vacationFeedback, setVacationFeedback] = useState<string | null>(null);

  // Discipline audit state
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);

  // Notification state
  const [testNotifMsg, setTestNotifMsg] = useState<string | null>(null);
  const [hasNativePermission, setHasNativePermission] = useState<boolean | null>(null);

  useEffect(() => {
    setUserName(profile.name);
    setUserHandle(profile.handle);
    setCollege(profile.college || '');
    setBranch(profile.branch || '');
    setSemester(profile.semester || '');
    setPreviewAvatar(profile.avatar);
    setTempGeminiKey(geminiApiKey || '');
    setTempYtKey(youtubeApiKey || '');
  }, [profile, geminiApiKey, youtubeApiKey]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.checkPermissions().then(status => {
        setHasNativePermission(status.display === 'granted');
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    updateProfile({
      name: userName.trim(),
      handle: userHandle.trim().startsWith('@') ? userHandle.trim() : `@${userHandle.trim()}`,
      college: college.trim(),
      branch: branch.trim(),
      semester: semester.trim()
    });
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPreviewAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setPreviewAvatar(customUrl.trim());
    }
  };

  const handleSaveAvatar = () => {
    updateProfileAvatar(previewAvatar);
    setIsAvatarSaved(true);
    setTimeout(() => setIsAvatarSaved(false), 1800);
  };

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(tempGeminiKey.trim());
    setGeminiSaveMsg(`Gemini Key saved for ${profile.name}! Synced across devices.`);
    setTimeout(() => setGeminiSaveMsg(null), 3500);
  };

  const handleSaveYtKey = (e: React.FormEvent) => {
    e.preventDefault();
    setYoutubeApiKey(tempYtKey.trim());
    setYtSaveMsg(`YouTube Key saved for ${profile.name}! Synced across devices.`);
    setTimeout(() => setYtSaveMsg(null), 3500);
  };

  const handleToggleVacation = () => {
    const res = toggleVacationMode();
    setVacationFeedback(res.message);
    setTimeout(() => setVacationFeedback(null), 4000);
  };

  const handleRunAudit = async () => {
    setAuditRunning(true);
    setAuditFeedback(null);
    try {
      const result = await enforceTaskAccountability(true);
      setAuditFeedback(result.message);
    } catch {
      setAuditFeedback('Failed to run audit check.');
    } finally {
      setAuditRunning(false);
    }
  };

  const handleRequestNativePermission = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const res = await LocalNotifications.requestPermissions();
        setHasNativePermission(res.display === 'granted');
      } catch (err) {
        console.error(err);
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setHasNativePermission(perm === 'granted');
    }
  };

  const handleTestNotification = async () => {
    setTestNotifMsg('Scheduling notification... Switch apps or minimize now!');
    const res = await testBackgroundNotification();
    setTestNotifMsg(res.message);
    setTimeout(() => setTestNotifMsg(null), 6000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(10px)',
        padding: '16px'
      }}
    >
      <div
        className="glass-card mobile-full-modal"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(30px)',
          borderRadius: '28px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%)',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Settings size={22} />
            </div>
            <div>
              <h3
                className="font-tech"
                style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}
              >
                Settings & Preferences
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {profile.name} ({profile.handle}) • Real-time Cloud Sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher Pills */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '12px 20px',
            background: 'rgba(248, 250, 252, 0.8)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            overflowX: 'auto'
          }}
        >
          <button
            onClick={() => setActiveTab('profile')}
            className={`glass-pill ${activeTab === 'profile' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'profile' ? '1.5px solid #6366F1' : '1px solid rgba(0,0,0,0.08)',
              background: activeTab === 'profile' ? '#EEF2FF' : '#FFFFFF',
              color: activeTab === 'profile' ? '#4F46E5' : 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            <User size={14} />
            <span>Profile & Username</span>
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`glass-pill ${activeTab === 'keys' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'keys' ? '1.5px solid #8B5CF6' : '1px solid rgba(0,0,0,0.08)',
              background: activeTab === 'keys' ? '#F5F3FF' : '#FFFFFF',
              color: activeTab === 'keys' ? '#7C3AED' : 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            <Key size={14} />
            <span>API Keys (AI & YT)</span>
          </button>

          <button
            onClick={() => setActiveTab('vacation')}
            className={`glass-pill ${activeTab === 'vacation' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'vacation' ? '1.5px solid #F59E0B' : '1px solid rgba(0,0,0,0.08)',
              background: activeTab === 'vacation' ? '#FFFBEB' : '#FFFFFF',
              color: activeTab === 'vacation' ? '#D97706' : 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            <Palmtree size={14} />
            <span>Vacation Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('discipline')}
            className={`glass-pill ${activeTab === 'discipline' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'discipline' ? '1.5px solid #EF4444' : '1px solid rgba(0,0,0,0.08)',
              background: activeTab === 'discipline' ? '#FEF2F2' : '#FFFFFF',
              color: activeTab === 'discipline' ? '#DC2626' : 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            <Skull size={14} />
            <span>Task Wipe Protocol</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`glass-pill ${activeTab === 'notifications' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'notifications' ? '1.5px solid #10B981' : '1px solid rgba(0,0,0,0.08)',
              background: activeTab === 'notifications' ? '#ECFDF5' : '#FFFFFF',
              color: activeTab === 'notifications' ? '#059669' : 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            <Bell size={14} />
            <span>Android Notifications</span>
          </button>
        </div>

        {/* Scrollable Tab Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>

          {/* TAB 1: PROFILE, USERNAME & AVATAR */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Change Username & Student Info Card */}
              <div
                style={{
                  background: 'rgba(248, 250, 252, 0.9)',
                  borderRadius: '20px',
                  padding: '18px',
                  border: '1.5px solid rgba(99, 102, 241, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <User size={18} color="#6366F1" />
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Change Username & Account Info
                  </span>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        placeholder="e.g. Diwakar"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          fontSize: '0.88rem',
                          background: '#FFFFFF',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        User Handle
                      </label>
                      <input
                        type="text"
                        value={userHandle}
                        onChange={e => setUserHandle(e.target.value)}
                        placeholder="@diwakar_sharma"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          fontSize: '0.88rem',
                          background: '#FFFFFF',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        College / University
                      </label>
                      <input
                        type="text"
                        value={college}
                        onChange={e => setCollege(e.target.value)}
                        placeholder="College Name"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          fontSize: '0.84rem',
                          background: '#FFFFFF',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Branch
                      </label>
                      <input
                        type="text"
                        value={branch}
                        onChange={e => setBranch(e.target.value)}
                        placeholder="CSE"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          fontSize: '0.84rem',
                          background: '#FFFFFF',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Semester
                      </label>
                      <input
                        type="text"
                        value={semester}
                        onChange={e => setSemester(e.target.value)}
                        placeholder="6th"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          fontSize: '0.84rem',
                          background: '#FFFFFF',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="charcoal-pill-btn"
                    style={{
                      padding: '10px 18px',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      background: 'linear-gradient(135deg, #1E1E24 0%, #4F46E5 100%)',
                      marginTop: 4
                    }}
                  >
                    {isProfileSaved ? <Check size={16} /> : <Save size={16} />}
                    <span>{isProfileSaved ? 'Profile Updated!' : 'Save Username & Info'}</span>
                  </button>
                </form>
              </div>

              {/* Avatar Preview & Customization */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '18px',
                  border: '1px solid rgba(0, 0, 0, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} color="#7C3AED" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Profile Picture & Animated GIFs
                    </span>
                  </div>
                  <button
                    onClick={handleSaveAvatar}
                    className="charcoal-pill-btn"
                    style={{ padding: '7px 16px', fontSize: '0.82rem' }}
                  >
                    {isAvatarSaved ? 'Saved!' : 'Save Avatar'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      padding: 3,
                      background: 'linear-gradient(135deg, #38BDF8 0%, #F43F5E 50%, #10B981 100%)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={previewAvatar}
                      alt={profile.name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: '12px',
                        border: '1.5px dashed rgba(99, 102, 241, 0.4)',
                        background: 'rgba(238, 242, 255, 0.6)',
                        color: '#4F46E5',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}
                    >
                      <Upload size={14} />
                      <span>Upload Local Photo / GIF</span>
                      <input type="file" accept="image/*,image/gif" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>

                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <input
                        type="text"
                        placeholder="Or paste image / GIF URL..."
                        value={customUrl}
                        onChange={e => setCustomUrl(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '7px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          fontSize: '0.8rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={handleApplyUrl}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#1E1E24',
                          color: '#FFFFFF',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Animated GIF Presets */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7C3AED', marginBottom: 8 }}>
                    ANIMATED GIF AVATARS
                  </div>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {PRESET_GIF_AVATARS.map((gif, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewAvatar(gif.url)}
                        title={gif.name}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          padding: 2,
                          cursor: 'pointer',
                          border: previewAvatar === gif.url ? '2.5px solid #8B5CF6' : '2px solid rgba(0,0,0,0.08)',
                          transform: previewAvatar === gif.url ? 'scale(1.1)' : 'scale(1)',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={gif.url}
                          alt={gif.name}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Static Presets */}
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                    STATIC HD PRESETS
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {PRESET_STATIC_AVATARS.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewAvatar(url)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          padding: 2,
                          cursor: 'pointer',
                          border: previewAvatar === url ? '2px solid #38BDF8' : '2px solid transparent'
                        }}
                      >
                        <img
                          src={url}
                          alt="Preset"
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={logout}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(254, 242, 242, 0.8)',
                    color: '#DC2626',
                    fontFamily: 'var(--font-tech)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Log Out / Switch Account
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: API KEYS (AI & YOUTUBE) */}
          {activeTab === 'keys' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Informational Header Card */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(245, 243, 255, 0.95) 0%, rgba(238, 242, 255, 0.95) 100%)',
                  border: '1.5px solid rgba(139, 92, 246, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: '#7C3AED'
                    }}
                  >
                    🔐 PRIVATE TO {profile.name.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#10B981' }}>
                    ✓ Cross-Device Cloud Sync
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#18181B', margin: '0 0 6px 0' }}>
                  User-Specific API Credentials
                </h4>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#4B5563', margin: 0 }}>
                  Your Google Gemini AI key and YouTube Data API key are stored privately for <strong>{profile.name}</strong>. They sync across your Android app and Website, and will never overwrite <strong>{activeFriend.name}</strong>'s keys. Your AI chat history also remains completely private.
                </p>
              </div>

              {/* Gemini API Key Card */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '20px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bot size={18} color="#6366F1" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Google Gemini AI API Key
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: geminiApiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                      color: geminiApiKey ? '#059669' : '#DC2626'
                    }}
                  >
                    {geminiApiKey ? 'KEY CONFIGURED' : 'KEY MISSING'}
                  </span>
                </div>

                <form onSubmit={handleSaveGeminiKey} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={tempGeminiKey}
                      onChange={e => setTempGeminiKey(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 42px 10px 14px',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        fontSize: '0.86rem',
                        background: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.76rem', color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Get free key at Google AI Studio ↗
                    </a>

                    <button
                      type="submit"
                      className="charcoal-pill-btn"
                      style={{
                        padding: '8px 18px',
                        fontSize: '0.82rem',
                        background: 'linear-gradient(135deg, #1E1E24 0%, #4F46E5 100%)'
                      }}
                    >
                      <Save size={14} />
                      <span>Save Gemini Key</span>
                    </button>
                  </div>
                </form>

                {geminiSaveMsg && (
                  <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                    {geminiSaveMsg}
                  </div>
                )}
              </div>

              {/* YouTube API Key Card */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '20px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <YoutubeIcon size={18} color="#EF4444" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      YouTube Data API v3 Key
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: youtubeApiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                      color: youtubeApiKey ? '#059669' : '#DC2626'
                    }}
                  >
                    {youtubeApiKey ? 'KEY CONFIGURED' : 'KEY MISSING'}
                  </span>
                </div>

                <form onSubmit={handleSaveYtKey} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showYtKey ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={tempYtKey}
                      onChange={e => setTempYtKey(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 42px 10px 14px',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        fontSize: '0.86rem',
                        background: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowYtKey(!showYtKey)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {showYtKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.76rem', color: '#EF4444', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Get YouTube key in Google Cloud Console ↗
                    </a>

                    <button
                      type="submit"
                      className="charcoal-pill-btn"
                      style={{
                        padding: '8px 18px',
                        fontSize: '0.82rem',
                        background: 'linear-gradient(135deg, #1E1E24 0%, #EF4444 100%)'
                      }}
                    >
                      <Save size={14} />
                      <span>Save YouTube Key</span>
                    </button>
                  </div>
                </form>

                {ytSaveMsg && (
                  <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                    {ytSaveMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VACATION & STREAK PROTECTION (Relocated from Heatmap) */}
          {activeTab === 'vacation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* The Exact Vacation Mode Card from Image 3 */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '24px',
                  background: isVacationPaused
                    ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(253, 230, 138, 0.75) 100%)'
                    : 'linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(220, 252, 231, 0.75) 100%)',
                  border: isVacationPaused
                    ? '1.5px solid rgba(245, 158, 11, 0.4)'
                    : '1.5px solid rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 8px 24px -4px rgba(0,0,0,0.06)'
                }}
              >
                {/* Status Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(245, 158, 11, 0.18)',
                      color: '#B45309'
                    }}
                  >
                    ✈️ VACATION & STREAK PROTECTION (PAUSE MODE)
                  </span>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: isVacationPaused ? '#D97706' : '#16A34A',
                      color: '#FFFFFF'
                    }}
                  >
                    {isVacationPaused ? 'PAUSE ACTIVE • XP DEDUCTION FROZEN' : 'ACTIVE STUDY MODE • XP TRACKING ON'}
                  </span>
                </div>

                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.4rem' }}>{isVacationPaused ? '🏖️ 🌴' : '🎓 📚'}</span>
                  <h4
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: isVacationPaused ? '#92400E' : '#14532D',
                      margin: 0
                    }}
                  >
                    {isVacationPaused
                      ? 'Vacation Mode is Currently ACTIVE'
                      : 'Vacation Mode is Currently DISABLED'}
                  </h4>
                </div>

                {/* Explanation */}
                <p
                  style={{
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    color: isVacationPaused ? '#78350F' : '#166534',
                    margin: '0 0 14px 0'
                  }}
                >
                  When activated, daily XP deductions and task punishment penalties are completely frozen.{' '}
                  <strong>Streak Protection Requirement:</strong> You must watch at least 1 video from your course playlist to keep your streak intact during vacation. If activated without watching a playlist video, the streak will break.
                </p>

                {/* Requirement Tracker Pill */}
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    background: hasWatchedPlaylistVideoToday
                      ? 'rgba(34, 197, 94, 0.18)'
                      : 'rgba(239, 68, 68, 0.12)',
                    border: hasWatchedPlaylistVideoToday
                      ? '1px solid rgba(34, 197, 94, 0.35)'
                      : '1px solid rgba(239, 68, 68, 0.25)',
                    color: hasWatchedPlaylistVideoToday ? '#15803D' : '#B91C1C',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 16
                  }}
                >
                  {hasWatchedPlaylistVideoToday ? (
                    <>
                      <Check size={16} />
                      <span>1 Playlist Video Watched Today — Streak Safeguarded!</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={16} />
                      <span>0 Playlist Videos Watched — Watch 1 playlist video to safeguard streak!</span>
                    </>
                  )}
                </div>

                {/* Feedback Message */}
                {vacationFeedback && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: '#1E1E24',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginBottom: 14
                    }}
                  >
                    {vacationFeedback}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      onClose();
                      setActiveModule('courses');
                    }}
                    style={{
                      padding: '9px 16px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      background: 'rgba(255, 255, 255, 0.85)',
                      color: '#1E1E24',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Play size={14} />
                    <span>Watch Playlist Video</span>
                  </button>

                  <button
                    onClick={handleToggleVacation}
                    style={{
                      padding: '9px 20px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      background: isVacationPaused
                        ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                        : 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Palmtree size={15} />
                    <span>{isVacationPaused ? 'Deactivate Pause (Resume Study)' : 'Activate Pause (Freeze Deductions)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TASK DISCIPLINE PROTOCOL (Relocated from Habits & Goals) */}
          {activeTab === 'discipline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* The Exact Card from Image 2 */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: '0 8px 24px -4px rgba(239, 68, 68, 0.1)'
                }}
              >
                {/* Badge */}
                <div style={{ marginBottom: 10 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#DC2626'
                    }}
                  >
                    <ShieldAlert size={13} />
                    <span>SEVERE TASK ACCOUNTABILITY & PROGRESS DELETION PROTOCOL</span>
                  </span>
                </div>

                {/* Title */}
                <h4
                  className="font-tech"
                  style={{ fontSize: '1.15rem', fontWeight: 800, color: '#18181B', margin: '0 0 8px 0' }}
                >
                  Task Discipline & Catastrophic Progress Wipe Engine
                </h4>

                {/* Warning Text */}
                <p style={{ fontSize: '0.84rem', lineHeight: 1.5, color: '#4B5563', margin: '0 0 14px 0' }}>
                  Incomplete daily core tasks result in an immediate <strong>-400 XP penalty per missed task</strong>. If your XP falls below <strong>100 XP</strong>, your <strong>ENTIRE ACCOUNT PROGRESS (Streak, Level, XP, Rank, and Minutes) IS WIPED TO ZERO</strong>.
                </p>

                {/* Status Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '10px 14px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    marginBottom: 16,
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Current XP: </span>
                    <strong style={{ fontSize: '0.88rem', color: profile.totalXp >= 100 ? '#16A34A' : '#DC2626' }}>
                      {profile.totalXp} XP
                    </strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}> (Safety threshold: 100+ XP)</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Status: </span>
                    <strong style={{ fontSize: '0.82rem', color: profile.totalXp >= 100 ? '#16A34A' : '#DC2626' }}>
                      {profile.totalXp >= 100 ? 'Protected' : 'CRITICAL (Wipe Risk)'}
                    </strong>
                  </div>
                </div>

                {/* Audit Feedback */}
                {auditFeedback && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: '#1E1E24',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginBottom: 14
                    }}
                  >
                    {auditFeedback}
                  </div>
                )}

                {/* Audit Button */}
                <button
                  onClick={handleRunAudit}
                  disabled={auditRunning}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: auditRunning ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <Skull size={16} />
                  <span>{auditRunning ? 'Auditing Account...' : 'Run Task Accountability Audit'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: ANDROID BACKGROUND NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  padding: '20px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(236, 253, 245, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
                  border: '1.5px solid rgba(16, 185, 129, 0.3)',
                  boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.08)'
                }}
              >
                {/* Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#059669'
                    }}
                  >
                    <Smartphone size={13} />
                    <span>ANDROID SYSTEM NOTIFICATION ENGINE</span>
                  </span>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: notificationSettings.backgroundEnabled ? '#10B981' : '#6B7280',
                      color: '#FFFFFF'
                    }}
                  >
                    {notificationSettings.backgroundEnabled ? 'BACKGROUND ACTIVE' : 'BACKGROUND OFF'}
                  </span>
                </div>

                <h4
                  className="font-tech"
                  style={{ fontSize: '1.15rem', fontWeight: 800, color: '#18181B', margin: '0 0 6px 0' }}
                >
                  Background Reminders & Notifications
                </h4>
                <p style={{ fontSize: '0.84rem', lineHeight: 1.5, color: '#4B5563', margin: '0 0 16px 0' }}>
                  Keep your study streak protected by getting notifications delivered directly in the Android system notification tray when the app is in the background or closed.
                </p>

                {/* Configuration Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>

                  {/* Toggle 1: Enable Reminders */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.08)',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Enable Streak & Task Reminders
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Sends alerts about incomplete daily tasks and streak milestones
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.enabled}
                      onChange={e => updateNotificationSettings({ enabled: e.target.checked })}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#10B981' }}
                    />
                  </label>

                  {/* Toggle 2: Background Notifications */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.08)',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Deliver in Background (Android Alarms)
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Fires even when app is minimized, locked, or closed using AlarmManager
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.backgroundEnabled}
                      onChange={e => updateNotificationSettings({ backgroundEnabled: e.target.checked })}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#10B981' }}
                    />
                  </label>

                  {/* Toggle 3: Mute In-App Popups */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      background: notificationSettings.muteInAppPopups ? 'rgba(254, 243, 199, 0.6)' : '#FFFFFF',
                      border: notificationSettings.muteInAppPopups
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : '1px solid rgba(0,0,0,0.08)',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <BellOff size={15} color={notificationSettings.muteInAppPopups ? '#D97706' : '#6B7280'} />
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Mute In-App Popups (Background Only Mode)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Show notifications only in Android background tray, not as toasts inside the app
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.muteInAppPopups}
                      onChange={e => updateNotificationSettings({ muteInAppPopups: e.target.checked })}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#D97706' }}
                    />
                  </label>

                  {/* Interval Selector */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '14px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Reminder Interval
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        How frequently streak warnings and task reminders fire
                      </div>
                    </div>
                    <select
                      value={notificationSettings.intervalMinutes}
                      onChange={e => updateNotificationSettings({ intervalMinutes: Number(e.target.value) })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0,0,0,0.15)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      <option value={15}>Every 15 mins</option>
                      <option value={30}>Every 30 mins (Default)</option>
                      <option value={60}>Every 1 hour</option>
                      <option value={120}>Every 2 hours</option>
                      <option value={240}>Every 4 hours</option>
                    </select>
                  </div>
                </div>

                {/* Feedback Box */}
                {testNotifMsg && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: '#1E1E24',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginBottom: 14
                    }}
                  >
                    {testNotifMsg}
                  </div>
                )}

                {/* Actions & Native Permission */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {hasNativePermission !== true && (
                    <button
                      onClick={handleRequestNativePermission}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Smartphone size={14} />
                      <span>Grant Android Permission</span>
                    </button>
                  )}

                  <button
                    onClick={handleTestNotification}
                    className="charcoal-pill-btn"
                    style={{
                      padding: '10px 20px',
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'linear-gradient(135deg, #1E1E24 0%, #10B981 100%)'
                    }}
                  >
                    <Bell size={15} />
                    <span>Test Background Notification (Fires in 5s)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
