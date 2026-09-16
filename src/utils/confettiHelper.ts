import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  ticks?: number;
}

/**
 * Ultra-smooth, lightweight sparkle confetti tailored for mobile and desktop.
 * On mobile/Android, automatically throttles particle count and ticks so frame rates remain silky smooth at 60-120fps.
 */
export const triggerSparkleConfetti = (options: ConfettiOptions = {}) => {
  try {
    const isMobile = typeof window !== 'undefined' && (
      window.innerWidth < 768 ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );

    const baseCount = options.particleCount ?? 50;
    // On mobile, use 40% of particle count with fewer ticks so GPU doesn't stall
    const safeCount = isMobile ? Math.min(30, Math.max(15, Math.round(baseCount * 0.45))) : baseCount;
    const safeTicks = isMobile ? 120 : (options.ticks ?? 200);

    confetti({
      particleCount: safeCount,
      spread: options.spread ?? (isMobile ? 50 : 70),
      origin: options.origin ?? { y: 0.6 },
      ticks: safeTicks,
      disableForReducedMotion: true,
      colors: options.colors ?? ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6']
    });
  } catch (err) {
    // Graceful fallback if canvas is not supported
    console.debug('Confetti skipped', err);
  }
};

export default triggerSparkleConfetti;
