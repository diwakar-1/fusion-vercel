import React, { useState, useEffect } from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { Lock, Sparkles, KeyRound, ArrowRight, ShieldCheck, UserCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const EntryCodeGate: React.FC = () => {
  const { loginWithEntryCode, isAyushPasswordSet, setAyushPermanentPassword } = useStudentOs();
  const [selectedUser, setSelectedUser] = useState<'Diwakar' | 'Ayush'>('Diwakar');
  
  // Regular password input state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Ayush first-time setup state
  const [hasAyushPassword, setHasAyushPassword] = useState<boolean>(() => isAyushPasswordSet());
  const [ayushNewPass, setAyushNewPass] = useState('');
  const [ayushConfirmPass, setAyushConfirmPass] = useState('');
  const [showAyushNewPass, setShowAyushNewPass] = useState(false);
  const [showAyushConfirmPass, setShowAyushConfirmPass] = useState(false);

  // Unlocking animation state with UNLOCKED.gif
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockStatusText, setUnlockStatusText] = useState('Verifying credentials...');

  // Re-check Ayush password set status when selectedUser changes
  useEffect(() => {
    setHasAyushPassword(isAyushPasswordSet());
    setErrorMsg('');
    setPassword('');
  }, [selectedUser]);

  // Handle standard login for Diwakar or returning Ayush
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = password.trim();
    if (!clean) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setErrorMsg('');

    // Pre-verify password to trigger the UNLOCKED.gif animation on success
    let isMatch = false;
    if (selectedUser === 'Diwakar') {
      const diwakarCode = (import.meta.env.VITE_DIWAKAR_CODE || '').toUpperCase();
      isMatch = diwakarCode !== '' && clean.toUpperCase() === diwakarCode;
    } else {
      const stored = localStorage.getItem('fusion_ayush_password');
      isMatch = stored ? clean === stored.trim() : false;
    }

    if (!isMatch) {
      setErrorMsg(`Incorrect password for ${selectedUser}. Please try again.`);
      return;
    }

    // Credentials match! Trigger UNLOCKED.gif animation
    setIsUnlocking(true);
    setUnlockStatusText(`Access granted for ${selectedUser}. Unlocking FUSION...`);

    // Let the UNLOCKED.gif animation play for 1.8 seconds before entering
    setTimeout(async () => {
      await loginWithEntryCode(selectedUser, clean);
    }, 1800);
  };

  // Handle first-time permanent password creation for Ayush
  const handleCreateAyushPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPass = ayushNewPass.trim();
    const confirmPass = ayushConfirmPass.trim();

    if (!newPass) {
      setErrorMsg('Please enter a password.');
      return;
    }

    if (newPass.length < 3) {
      setErrorMsg('Password must be at least 3 characters long.');
      return;
    }

    if (newPass !== confirmPass) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setErrorMsg('');

    // Save permanent password (one-time setup)
    await setAyushPermanentPassword(newPass);
    setHasAyushPassword(true);

    // Trigger UNLOCKED.gif animation
    setIsUnlocking(true);
    setUnlockStatusText('Permanent password set! Unlocking FUSION...');

    setTimeout(async () => {
      await loginWithEntryCode('Ayush', newPass);
    }, 1800);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 50
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '38px 32px',
          borderRadius: '32px',
          boxShadow: '0 24px 60px -15px rgba(25, 30, 45, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
          background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: '1.5px solid rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}
      >
        {/* UNLOCKED ANIMATION STATE */}
        {isUnlocking ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 8px'
            }}
          >
            {/* Pulsing UNLOCKED.gif container */}
            <div
              style={{
                position: 'relative',
                width: 124,
                height: 124,
                borderRadius: '28px',
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.18) 0%, rgba(255, 255, 255, 0.95) 75%)',
                border: '2px solid rgba(34, 197, 94, 0.45)',
                boxShadow: '0 16px 40px rgba(34, 197, 94, 0.32), 0 0 24px rgba(34, 197, 94, 0.2) inset',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 22,
                animation: 'fusionPulseGlow 1.8s infinite ease-in-out'
              }}
            >
              <img
                src="/icons/UNLOCKED.gif"
                alt="Unlocked"
                style={{ width: 92, height: 92, objectFit: 'contain' }}
              />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#15803D',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 12
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#22C55E',
                  boxShadow: '0 0 10px #22C55E'
                }}
              />
              Access Granted • Vault Unlocked
            </div>

            <h2
              className="font-tech"
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: 6
              }}
            >
              Welcome, {selectedUser}!
            </h2>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.92rem',
                marginBottom: 26
              }}
            >
              {unlockStatusText}
            </p>

            {/* Glowing progress line */}
            <div
              style={{
                width: '100%',
                maxWidth: '280px',
                height: 6,
                borderRadius: 9999,
                background: 'rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  background: 'linear-gradient(90deg, #10B981, #06B6D4, #8B5CF6)',
                  borderRadius: 9999,
                  animation: 'unlockProgressBar 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                }}
              />
            </div>
          </div>
        ) : (
          /* STANDARD LOGIN & FIRST TIME SETUP VIEW */
          <>
            {/* Brand Icon */}
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #1E1E24 0%, #3F3F46 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 8px 24px rgba(30, 30, 36, 0.25)',
                color: '#FFFFFF'
              }}
            >
              <Lock size={26} color="#FEF08A" />
            </div>

            <h1
              className="font-tech"
              style={{
                fontSize: '2.3rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                marginBottom: 4
              }}
            >
              FUSION
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 22 }}>
              Private Co-Study Ecosystem for Diwakar & Ayush
            </p>

            {/* User Selection Tabs */}
            <div
              style={{
                display: 'flex',
                padding: 4,
                background: 'rgba(240, 243, 246, 0.85)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                marginBottom: 22
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedUser('Diwakar');
                  setErrorMsg('');
                  setPassword('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  fontFamily: 'var(--font-tech)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  background: selectedUser === 'Diwakar' ? 'var(--charcoal-pill)' : 'transparent',
                  color: selectedUser === 'Diwakar' ? '#FFFFFF' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}
              >
                <UserCheck size={16} />
                <span>Diwakar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedUser('Ayush');
                  setErrorMsg('');
                  setPassword('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  fontFamily: 'var(--font-tech)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  background: selectedUser === 'Ayush' ? 'var(--charcoal-pill)' : 'transparent',
                  color: selectedUser === 'Ayush' ? '#FFFFFF' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}
              >
                <UserCheck size={16} />
                <span>Ayush</span>
                {/* Visual badge if first-time password setup needed */}
                {!hasAyushPassword && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      background: selectedUser === 'Ayush' ? '#F59E0B' : '#FEF3C7',
                      color: selectedUser === 'Ayush' ? '#FFFFFF' : '#B45309',
                      fontWeight: 800
                    }}
                  >
                    NEW
                  </span>
                )}
              </button>
            </div>

            {/* IF AYUSH & FIRST TIME PASSWORD CREATION */}
            {selectedUser === 'Ayush' && !hasAyushPassword ? (
              <form onSubmit={handleCreateAyushPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: '12px',
                    background: 'rgba(254, 243, 199, 0.7)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#B45309',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}
                >
                  <Sparkles size={15} color="#D97706" />
                  <span>One-Time Setup: Create Permanent Password</span>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '2px 0 6px 0' }}>
                  Choose your permanent password. You'll only need to do this once.
                </p>

                {/* New Password Field */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <KeyRound size={18} />
                  </div>
                  <input
                    type={showAyushNewPass ? 'text' : 'password'}
                    placeholder="Create your permanent password"
                    value={ayushNewPass}
                    onChange={e => {
                      setAyushNewPass(e.target.value);
                      setErrorMsg('');
                    }}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '13px 44px 13px 44px',
                      borderRadius: '16px',
                      border: errorMsg ? '1.5px solid #EF4444' : '1px solid rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      fontSize: '0.94rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAyushNewPass(!showAyushNewPass)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 4
                    }}
                    title={showAyushNewPass ? 'Hide password' : 'Show password'}
                  >
                    {showAyushNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <input
                    type={showAyushConfirmPass ? 'text' : 'password'}
                    placeholder="Confirm permanent password"
                    value={ayushConfirmPass}
                    onChange={e => {
                      setAyushConfirmPass(e.target.value);
                      setErrorMsg('');
                    }}
                    style={{
                      width: '100%',
                      padding: '13px 44px 13px 44px',
                      borderRadius: '16px',
                      border: errorMsg ? '1.5px solid #EF4444' : '1px solid rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      fontSize: '0.94rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAyushConfirmPass(!showAyushConfirmPass)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 4
                    }}
                    title={showAyushConfirmPass ? 'Hide password' : 'Show password'}
                  >
                    {showAyushConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errorMsg && (
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: '#DC2626',
                      background: '#FEE2E2',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="charcoal-pill-btn"
                  style={{
                    marginTop: 6,
                    padding: '13px 24px',
                    fontSize: '0.96rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    cursor: 'pointer'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>Set Password & Unlock</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              /* RETURNING LOGIN FORM (DIWAKAR OR RETURNING AYUSH) */
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <KeyRound size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={`Enter ${selectedUser}'s password`}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '14px 44px 14px 44px',
                      borderRadius: '16px',
                      border: errorMsg ? '1.5px solid #EF4444' : '1px solid rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      fontSize: '0.94rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 4
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errorMsg && (
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: '#DC2626',
                      background: '#FEE2E2',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="charcoal-pill-btn"
                  style={{
                    padding: '14px 24px',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    cursor: 'pointer'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>Unlock FUSION</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Encrypted Protection Badge */}
            <div
              style={{
                marginTop: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4
              }}
            >
              <span>🔒 Encrypted End-to-End • Private Co-Study Session</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
