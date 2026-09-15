import React from 'react';
import { Crown } from 'lucide-react';

interface GlowingCrownOrbProps {
  size?: number;
  className?: string;
}

export const GlowingCrownOrb: React.FC<GlowingCrownOrbProps> = ({
  size = 140,
  className = ''
}) => {
  return (
    <div
      className={`glowing-crown-orb-container ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto'
      }}
    >
      <style>{`
        @keyframes orbGlowPulse {
          0%, 100% {
            box-shadow: 0 0 35px 8px rgba(251, 146, 60, 0.45), 0 0 70px 18px rgba(94, 234, 212, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 45px 14px rgba(251, 146, 60, 0.6), 0 0 85px 25px rgba(94, 234, 212, 0.45);
            transform: scale(1.03);
          }
        }
      `}</style>
      
      {/* Outer ambient blur shadow */}
      <div
        style={{
          position: 'absolute',
          inset: -10,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.6) 0%, rgba(56, 189, 248, 0.5) 30%, rgba(251, 146, 60, 0.6) 70%, rgba(244, 63, 94, 0.5) 100%)',
          filter: 'blur(20px)',
          opacity: 0.75,
          zIndex: 1
        }}
      />

      {/* Main Radiant Orb */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #5EEAD4 0%, #38BDF8 25%, #FB923C 65%, #F43F5E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          animation: 'orbGlowPulse 4s ease-in-out infinite',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.6), 0 10px 25px rgba(251, 146, 60, 0.35)'
        }}
      >
        <Crown
          size={size * 0.42}
          color="#FFFFFF"
          strokeWidth={2.4}
          fill="rgba(255, 255, 255, 0.9)"
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))'
          }}
        />
      </div>
    </div>
  );
};
