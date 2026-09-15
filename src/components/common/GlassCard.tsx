import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  interactive?: boolean;
  blurLevel?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'elevated' | 'banner';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  style = {},
  onClick,
  interactive = false,
  blurLevel = 'md',
  variant = 'default'
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'subtle':
        return {
          background: 'var(--glass-bg-subtle)',
          border: '1px solid var(--glass-border-subtle)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
        };
      case 'elevated':
        return {
          background: 'var(--glass-bg-elevated)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-elevated), var(--glass-inner-highlight)'
        };
      case 'banner':
        return {
          background: 'var(--gradient-premium-banner)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 12px 32px -6px rgba(199, 238, 247, 0.4), var(--glass-inner-highlight)'
        };
      default:
        return {
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-glass), var(--glass-inner-highlight)'
        };
    }
  };

  const blurValue = blurLevel === 'sm' ? '12px' : blurLevel === 'lg' ? '36px' : '24px';

  return (
    <div
      onClick={onClick}
      className={`glass-card ${interactive ? 'glass-card-hover glass-card-interactive' : ''} ${className}`}
      style={{
        backdropFilter: `blur(${blurValue}) saturate(180%)`,
        WebkitBackdropFilter: `blur(${blurValue}) saturate(180%)`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        ...getVariantStyles(),
        ...style
      }}
    >
      {children}
    </div>
  );
};
