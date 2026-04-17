import { useState } from 'react';

const AVATAR_GRADIENTS = [
  ['#E50914', '#8B0000'],   // brand red
  ['#F59E0B', '#B45309'],   // amber
  ['#10B981', '#047857'],   // emerald
  ['#3B82F6', '#1E3A8A'],   // blue
  ['#EC4899', '#9D174D'],   // pink
  ['#8B5CF6', '#5B21B6'],   // violet
  ['#F97316', '#9A3412'],   // orange
  ['#14B8A6', '#115E59'],   // teal
  ['#6366F1', '#3730A3'],   // indigo
  ['#EF4444', '#7F1D1D'],   // red
  ['#FACC15', '#854D0E'],   // yellow
  ['#06B6D4', '#155E75'],   // cyan
];

export function getAvatarGradient(nameOrIndex) {
  let idx;
  if (typeof nameOrIndex === 'number') {
    idx = nameOrIndex;
  } else if (typeof nameOrIndex === 'string') {
    idx = nameOrIndex.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  } else {
    idx = 0;
  }
  return AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
}

export default function ProfileAvatar({
  name = '',
  avatar,
  size = 'md',
  index,
  rounded = 'xl',
  className = '',
  glow = false,
}) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    xs: { box: 28, font: 13, radius: 8 },
    sm: { box: 36, font: 15, radius: 10 },
    md: { box: 48, font: 18, radius: 12 },
    lg: { box: 72, font: 28, radius: 16 },
    xl: { box: 96, font: 38, radius: 20 },
    '2xl': { box: 128, font: 52, radius: 24 },
  };
  const { box, font, radius } = sizes[size];
  const [c1, c2] = getAvatarGradient(index ?? name);
  const letter = (name?.[0] || '?').toUpperCase();

  const roundedMap = { full: '9999px', xl: `${radius}px`, lg: `${radius - 2}px` };
  const borderRadius = roundedMap[rounded] || `${radius}px`;

  const hasAvatar = avatar && !imgError;

  if (hasAvatar) {
    return (
      <div
        className={`overflow-hidden select-none ${className}`}
        style={{
          width: box,
          height: box,
          borderRadius,
          boxShadow: glow ? `0 8px 24px -6px ${c1}80` : 'none',
          flexShrink: 0,
        }}
      >
        <img
          src={`/assets/avatars/${avatar}.svg`}
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover"
          draggable={false}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-bold text-white select-none ${className}`}
      style={{
        width: box,
        height: box,
        fontSize: font,
        borderRadius,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        boxShadow: glow ? `0 8px 24px -6px ${c1}80` : 'none',
        fontFamily: 'var(--font-display)',
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}
