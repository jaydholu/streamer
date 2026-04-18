import { useState } from 'react';
import { Check } from 'lucide-react';

const TOTAL_AVATARS = 20;
const ALL_AVATAR_IDS = Array.from({ length: TOTAL_AVATARS }, (_, i) => `avatar_${i + 1}`);

export default function AvatarPicker({
  selected,
  onChange,
  usedAvatars = [],
  columns = 5,
}) {
  const getAvatarUrl = (id) => `/assets/avatars/${id}.svg`;

  return (
    <div className="space-y-3">
      <p className="form-label">Choose Avatar</p>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {ALL_AVATAR_IDS.map((id) => {
          const isSelected = selected === id;
          const isUsed = usedAvatars.includes(id) && !isSelected;

          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (!isUsed) onChange(id);
              }}
              disabled={isUsed}
              className="relative aspect-square rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer focus-ring group"
              style={{
                border: isSelected
                  ? '3px solid var(--c-accent)'
                  : '2px solid var(--c-border)',
                opacity: isUsed ? 0.3 : 1,
                filter: isUsed ? 'grayscale(0.8)' : 'none',
                background: 'var(--c-surface)',
                boxShadow: isSelected ? 'var(--shadow-brand)' : 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <img
                src={getAvatarUrl(id)}
                alt={`Avatar ${id.split('_')[1]}`}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Selected checkmark */}
              {isSelected && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(229, 9, 20, 0.3)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--c-accent)' }}
                  >
                    <Check size={18} color="white" strokeWidth={3} />
                  </div>
                </div>
              )}

              {/* Used indicator */}
              {isUsed && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                    style={{
                      background: 'rgba(0,0,0,0.6)',
                      color: 'var(--c-dim)',
                    }}
                  >
                    In use
                  </span>
                </div>
              )}

              {/* Hover ring */}
              {!isSelected && !isUsed && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                  style={{
                    boxShadow: 'inset 0 0 0 2px var(--c-accent)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { ALL_AVATAR_IDS };
export const getAvatarUrl = (id) => `/assets/avatars/${id}.svg`;