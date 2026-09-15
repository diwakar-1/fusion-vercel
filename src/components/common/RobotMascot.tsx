import React from 'react';

interface RobotMascotProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({
  size = 220,
  className = '',
  animate = true
}) => {
  return (
    <div
      className={`robot-mascot-container ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 14px 20px rgba(0, 0, 0, 0.08))',
        animation: animate ? 'mascotBob 4s ease-in-out infinite' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer'
      }}
    >
      <style>{`
        @keyframes mascotBob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        .robot-mascot-container:hover {
          transform: scale(1.06) rotate(-2deg);
        }
      `}</style>
      <svg
        viewBox="0 0 300 320"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow under feet */}
        <ellipse cx="160" cy="300" rx="65" ry="10" fill="rgba(30, 30, 36, 0.12)" />

        {/* 1. Antenna Stalk & Red Ball */}
        <line x1="126" y1="68" x2="120" y2="35" stroke="#1E1E24" strokeWidth="6" strokeLinecap="round" />
        <circle cx="118" cy="30" r="14" fill="#EF4444" stroke="#1E1E24" strokeWidth="5" />
        <circle cx="114" cy="26" r="4.5" fill="#FFFFFF" />

        {/* 2. Left Bendy Robot Arm (Raised) */}
        <path
          d="M 100 135 C 55 110 35 75 52 55 C 62 44 85 58 75 75"
          stroke="#1E1E24"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Left Arm Striped Ribs */}
        <path d="M 68 85 L 82 92" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <path d="M 52 105 L 66 112" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Left Hand Cartoon Fist */}
        <circle cx="48" cy="55" r="19" fill="#FFFFFF" stroke="#1E1E24" strokeWidth="5" />
        <path d="M 42 50 C 45 42 55 42 58 50" stroke="#1E1E24" strokeWidth="4" strokeLinecap="round" />

        {/* 3. Right Bendy Robot Arm (Raised in Victory) */}
        <path
          d="M 205 130 C 240 105 265 70 250 50 C 238 42 215 55 225 72"
          stroke="#1E1E24"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Right Arm Striped Ribs */}
        <path d="M 226 95 L 240 88" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <path d="M 238 115 L 252 108" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Right Hand Cartoon Fist */}
        <circle cx="255" cy="50" r="19" fill="#FFFFFF" stroke="#1E1E24" strokeWidth="5" />
        <path d="M 250 45 C 255 38 265 40 268 48" stroke="#1E1E24" strokeWidth="4" strokeLinecap="round" />

        {/* 4. Yellow Hat / Angled Visor Top */}
        <polygon
          points="85,68 175,52 210,76 110,92"
          fill="#FDE047"
          stroke="#1E1E24"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Hat Rim Depth */}
        <polygon
          points="110,92 210,76 210,86 110,102"
          fill="#EAB308"
          stroke="#1E1E24"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* 5. Head Cube: 3D Left Perspective Face */}
        <polygon
          points="72,106 110,90 110,172 72,185"
          fill="#C7D2FE"
          stroke="#1E1E24"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Vent lines on 3D side face */}
        <line x1="82" y1="125" x2="98" y2="118" stroke="#818CF8" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="82" y1="140" x2="98" y2="133" stroke="#818CF8" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="82" y1="155" x2="98" y2="148" stroke="#818CF8" strokeWidth="3.5" strokeLinecap="round" />

        {/* 6. Head Cube: Front Face */}
        <polygon
          points="110,90 220,84 220,165 110,172"
          fill="#FFDDD2"
          stroke="#1E1E24"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* 7. Red Eyeglasses Frame */}
        <rect
          x="122"
          y="108"
          width="88"
          height="34"
          rx="12"
          fill="#EF4444"
          stroke="#1E1E24"
          strokeWidth="5.5"
        />
        {/* Left Eye */}
        <circle cx="142" cy="125" r="12" fill="#FEF08A" stroke="#1E1E24" strokeWidth="4.5" />
        <circle cx="143" cy="125" r="6" fill="#1E1E24" />
        <circle cx="145" cy="123" r="2" fill="#FFFFFF" />

        {/* Right Eye */}
        <circle cx="190" cy="124" r="12" fill="#FEF08A" stroke="#1E1E24" strokeWidth="4.5" />
        <circle cx="191" cy="124" r="6" fill="#1E1E24" />
        <circle cx="193" cy="122" r="2" fill="#FFFFFF" />

        {/* Cheerful Mouth */}
        <path
          d="M 148 152 Q 165 168 184 150"
          stroke="#1E1E24"
          strokeWidth="5"
          strokeLinecap="round"
          fill="#EF4444"
        />

        {/* 8. Legs & Walking Shoes */}
        {/* Left Leg (Backwards step) */}
        <line x1="128" y1="172" x2="114" y2="238" stroke="#EF4444" strokeWidth="9" strokeLinecap="round" />
        {/* Left Back Heel & Shoe */}
        <rect
          x="94"
          y="234"
          width="36"
          height="19"
          rx="8"
          fill="#1E1E24"
          stroke="#1E1E24"
          strokeWidth="4"
        />

        {/* Right Leg (Forward step) */}
        <line x1="180" y1="168" x2="208" y2="235" stroke="#EF4444" strokeWidth="9" strokeLinecap="round" />
        {/* Right Chunky Green Sneaker */}
        <rect
          x="195"
          y="230"
          width="58"
          height="32"
          rx="12"
          fill="#22C55E"
          stroke="#1E1E24"
          strokeWidth="6"
        />
        {/* Sneaker White Sole */}
        <path
          d="M 197 254 L 251 254 C 253 254 254 257 254 260 L 254 261 C 254 262 253 263 251 263 L 197 263 C 196 263 195 262 195 261 L 195 260 C 195 257 196 254 197 254 Z"
          fill="#FFFFFF"
          stroke="#1E1E24"
          strokeWidth="4"
        />
        {/* Sneaker Toe Cap Accent */}
        <circle cx="240" cy="242" r="5" fill="#15803D" />
      </svg>
    </div>
  );
};
