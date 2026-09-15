import React, { useState } from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { X, Upload, Image, Check, Sparkles, User } from 'lucide-react';

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

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfileAvatar, logout } = useStudentOs();
  const [customUrl, setCustomUrl] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(profile.avatar);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

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

  const handleSave = () => {
    updateProfileAvatar(previewAvatar);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
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
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        padding: 20
      }}
    >
      <div
        className="glass-card mobile-full-modal"
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(30px)',
          borderRadius: '28px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Customize Profile Picture (PFP)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {profile.name} • Supports Static Images & Animated GIFs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Current Avatar Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              padding: 3,
              background: 'linear-gradient(135deg, #38BDF8 0%, #F43F5E 50%, #10B981 100%)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              marginBottom: 10
            }}
          >
            <img
              src={previewAvatar}
              alt={profile.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Avatar Live Preview
          </span>
        </div>

        {/* Upload from Local Device (Image or GIF) */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px',
              borderRadius: '16px',
              border: '1.5px dashed rgba(99, 102, 241, 0.4)',
              background: 'rgba(238, 242, 255, 0.6)',
              color: '#4F46E5',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 700,
              transition: 'all 0.2s ease'
            }}
          >
            <Upload size={18} />
            <span>Upload Photo or Animated GIF</span>
            <input type="file" accept="image/*,image/gif" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Or Image / GIF URL */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
            OR PASTE IMAGE / ANIMATED GIF URL
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="https://... (.gif, .png, .jpg)"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.12)',
                background: '#FFFFFF',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            <button
              onClick={handleApplyUrl}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                background: '#1E1E24',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Apply
            </button>
          </div>
        </div>

        {/* Animated GIF Presets */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 800, color: '#7C3AED', marginBottom: 8 }}>
            <Sparkles size={13} />
            <span>ANIMATED GIF AVATARS</span>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {PRESET_GIF_AVATARS.map((gif, idx) => (
              <div
                key={idx}
                onClick={() => setPreviewAvatar(gif.url)}
                title={gif.name}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  padding: 2,
                  cursor: 'pointer',
                  border: previewAvatar === gif.url ? '2.5px solid #8B5CF6' : '2px solid rgba(0,0,0,0.08)',
                  transform: previewAvatar === gif.url ? 'scale(1.12)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  boxShadow: previewAvatar === gif.url ? '0 0 12px rgba(139, 92, 246, 0.4)' : 'none'
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
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
            STATIC HD PRESETS
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {PRESET_STATIC_AVATARS.map((url, idx) => (
              <div
                key={idx}
                onClick={() => setPreviewAvatar(url)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  padding: 2,
                  cursor: 'pointer',
                  border: previewAvatar === url ? '2px solid #38BDF8' : '2px solid transparent',
                  transform: previewAvatar === url ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s ease'
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

        {/* Save & Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={logout}
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(254, 242, 242, 0.7)',
              color: '#DC2626',
              fontFamily: 'var(--font-tech)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Log Out / Switch
          </button>

          <button
            onClick={handleSave}
            className="charcoal-pill-btn"
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '0.94rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Check size={18} />
            <span>{isSaved ? 'Saved!' : 'Save Avatar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
