import React, { useState } from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { Lock, Sparkles, KeyRound, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const EntryCodeGate: React.FC = () => {
  const { loginWithEntryCode } = useStudentOs();
  const [selectedUser, setSelectedUser] = useState<'Diwakar' | 'Ayush'>('Diwakar');
  const [entryCode, setEntryCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryCode.trim()) {
      setErrorMsg('Please enter your secret Entry Code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const success = await loginWithEntryCode(selectedUser, entryCode.trim());
    setIsLoading(false);

    if (!success) {
      setErrorMsg(`Invalid Entry Code for ${selectedUser}. Check your private credentials.`);
    }
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
          padding: '40px 36px',
          borderRadius: '32px',
          boxShadow: '0 24px 60px -15px rgba(25, 30, 45, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
          background: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: '1.5px solid rgba(255, 255, 255, 0.9)',
          textAlign: 'center'
        }}
      >
        {/* Brand Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #1E1E24 0%, #3F3F46 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: '0 8px 24px rgba(30, 30, 36, 0.25)',
            color: '#FFFFFF'
          }}
        >
          <Lock size={28} color="#FEF08A" />
        </div>

        <h1
          className="font-tech"
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: 6
          }}
        >
          FUSION
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: 28 }}>
          Private Co-Study Ecosystem for Diwakar & Ayush
        </p>

        {/* User Selection Pills */}
        <div
          style={{
            display: 'flex',
            padding: 4,
            background: 'rgba(240, 243, 246, 0.85)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            marginBottom: 24
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedUser('Diwakar');
              setErrorMsg('');
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
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 16,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <KeyRound size={18} />
            </div>
            <input
              type="password"
              placeholder={`Enter ${selectedUser}'s Entry Code (e.g. ${selectedUser === 'Diwakar' ? 'D2026' : 'A2026'})`}
              value={entryCode}
              onChange={e => {
                setEntryCode(e.target.value);
                setErrorMsg('');
              }}
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                borderRadius: '16px',
                border: errorMsg ? '1.5px solid #EF4444' : '1px solid rgba(0, 0, 0, 0.1)',
                background: 'rgba(255, 255, 255, 0.95)',
                fontSize: '0.94rem',
                outline: 'none',
                fontFamily: 'inherit',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
              }}
            />
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
            disabled={isLoading}
            className="charcoal-pill-btn"
            style={{
              padding: '14px 24px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <ShieldCheck size={18} />
            <span>{isLoading ? 'Verifying...' : 'Unlock FUSION'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Hint Card */}
        <div
          style={{
            marginTop: 24,
            padding: '12px 16px',
            borderRadius: '14px',
            background: 'rgba(240, 253, 244, 0.7)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            fontSize: '0.78rem',
            color: '#15803D',
            textAlign: 'left',
            lineHeight: 1.5
          }}
        >
          <strong>Credentials Hint:</strong>
          <br />• Diwakar: <code>D2026</code> or <code>FUSION-DIWAKAR-2026</code>
          <br />• Ayush: <code>A2026</code> or <code>FUSION-AYUSH-2026</code>
        </div>
      </div>
    </div>
  );
};
