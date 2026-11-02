'use client';

import React from 'react';

interface ProfileAvatarProps {
  id: string;
  name: string;
  accent: string;
  className?: string;
}

export function ProfileAvatar({ id, name, accent, className = '' }: ProfileAvatarProps) {
  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-md flex items-center justify-center shadow-lg select-none ${className}`}
      style={{
        background: getNetflixGradient(id)
      }}
    >
      {/* Character illustration inside avatar */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-2.5">
        {renderCharacterSvg(id)}
      </div>

      {/* Subtle bottom gradient shadow for text legibility */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </div>
  );
}

function getNetflixGradient(id: string): string {
  switch (id) {
    case 'design-patterns':
      return 'linear-gradient(145deg, #7c3aed 0%, #4c1d95 100%)'; // Purple like Jennie / Baby
    case 'database-internals':
      return 'linear-gradient(145deg, #0d9488 0%, #115e59 100%)'; // Teal like Larva
    case 'cdc-event-driven':
      return 'linear-gradient(145deg, #059669 0%, #064e3b 100%)'; // Emerald green
    case 'message-queue':
      return 'linear-gradient(145deg, #9333ea 0%, #581c87 100%)'; // Vivid Violet like Psyduck
    case 'docker-containers':
      return 'linear-gradient(145deg, #0284c7 0%, #075985 100%)'; // Sky blue
    case 'system-security':
      return 'linear-gradient(145deg, #e11d48 0%, #881337 100%)'; // Crimson red
    case 'devops-orchestration':
      return 'linear-gradient(145deg, #eab308 0%, #a16207 100%)'; // Amber yellow like Chicken
    default:
      return 'linear-gradient(145deg, #374151 0%, #1f2937 100%)';
  }
}

function renderCharacterSvg(id: string) {
  switch (id) {
    case 'design-patterns':
      // Cute Master Architect Character with glasses & creative lightbulb crown
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Hair / Head */}
          <circle cx="50" cy="50" r="30" fill="#fed7aa" />
          <path d="M 24 45 C 24 25, 76 25, 76 45 C 76 35, 70 20, 50 20 C 30 20, 24 35, 24 45 Z" fill="#4338ca" />
          {/* Architect Glasses */}
          <rect x="30" y="42" width="16" height="12" rx="3" fill="#1e1b4b" stroke="#fbbf24" strokeWidth="2.5" />
          <rect x="54" y="42" width="16" height="12" rx="3" fill="#1e1b4b" stroke="#fbbf24" strokeWidth="2.5" />
          <line x1="46" y1="48" x2="54" y2="48" stroke="#fbbf24" strokeWidth="2.5" />
          {/* Eyes behind glass reflection */}
          <circle cx="38" cy="48" r="2.5" fill="#ffffff" />
          <circle cx="62" cy="48" r="2.5" fill="#ffffff" />
          {/* Smile */}
          <path d="M 43 62 Q 50 69 57 62" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" />
          {/* Blush */}
          <ellipse cx="29" cy="57" rx="3.5" ry="2" fill="#f87171" opacity="0.6" />
          <ellipse cx="71" cy="57" rx="3.5" ry="2" fill="#f87171" opacity="0.6" />
          {/* Little spark / crown */}
          <polygon points="50,6 53,16 63,16 55,22 58,32 50,26 42,32 45,22 37,16 47,16" fill="#fbbf24" />
        </svg>
      );

    case 'database-internals':
      // Cute Disk Bot / SQL Golem Character with glowing eyes
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Bot Antenna */}
          <line x1="50" y1="12" x2="50" y2="22" stroke="#e0f2fe" strokeWidth="3" />
          <circle cx="50" cy="11" r="4.5" fill="#38bdf8" />
          {/* Bot Head (Stacked Disk shape) */}
          <rect x="22" y="24" width="56" height="48" rx="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
          {/* Screen Visor */}
          <rect x="30" y="34" width="40" height="20" rx="6" fill="#1e293b" />
          {/* Glowing Visor Eyes (horizontal happy capsules) */}
          <rect x="36" y="41" width="10" height="6" rx="3" fill="#38bdf8" />
          <rect x="54" y="41" width="10" height="6" rx="3" fill="#38bdf8" />
          {/* Disk layer stripes */}
          <line x1="28" y1="62" x2="72" y2="62" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="5 3" />
          {/* Bot cheeks */}
          <circle cx="26" cy="54" r="3" fill="#38bdf8" opacity="0.7" />
          <circle cx="74" cy="54" r="3" fill="#38bdf8" opacity="0.7" />
          {/* Small database cylinder on torso */}
          <ellipse cx="50" cy="82" rx="18" ry="6" fill="#38bdf8" opacity="0.9" />
          <path d="M 32 82 V 92 C 32 96, 68 96, 68 92 V 82" fill="#0284c7" />
        </svg>
      );

    case 'cdc-event-driven':
      // Lightning Streamer Fox with glowing tail & radar ears
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Fox Ears */}
          <polygon points="26,16 42,42 22,42" fill="#10b981" />
          <polygon points="27,24 38,40 24,40" fill="#a7f3d0" />
          <polygon points="74,16 78,42 58,42" fill="#10b981" />
          <polygon points="73,24 76,40 62,40" fill="#a7f3d0" />
          {/* Fox Head */}
          <polygon points="50,78 22,42 78,42" fill="#047857" />
          <polygon points="50,78 30,42 70,42" fill="#10b981" />
          {/* Eyes (speed squint) */}
          <path d="M 36 46 Q 42 43 46 48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <path d="M 64 46 Q 58 43 54 48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          {/* Fox Nose */}
          <circle cx="50" cy="74" r="3" fill="#064e3b" />
          {/* Lightning Stream Streak on forehead */}
          <path d="M 52 24 L 46 34 L 54 36 L 48 48" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    case 'message-queue':
      // Cute Rabbit with Headset / Earflap and glowing packet
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Rabbit Ears */}
          <ellipse cx="38" cy="24" rx="7" ry="18" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
          <ellipse cx="38" cy="24" rx="3.5" ry="12" fill="#fdf2f8" />
          <ellipse cx="62" cy="24" rx="7" ry="18" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
          <ellipse cx="62" cy="24" rx="3.5" ry="12" fill="#fdf2f8" />
          {/* Head */}
          <circle cx="50" cy="58" r="26" fill="#fdf2f8" />
          {/* Big Cartoon Eyes */}
          <ellipse cx="40" cy="54" rx="5" ry="7" fill="#18181b" />
          <circle cx="39" cy="52" r="2" fill="#ffffff" />
          <ellipse cx="60" cy="54" rx="5" ry="7" fill="#18181b" />
          <circle cx="59" cy="52" r="2" fill="#ffffff" />
          {/* Nose & Mouth */}
          <polygon points="48,63 52,63 50,65" fill="#f472b6" />
          <path d="M 46 67 Q 50 71 54 67" stroke="#db2777" strokeWidth="1.8" fill="none" />
          {/* Headset bar & mic */}
          <path d="M 23 58 C 23 35, 77 35, 77 58" stroke="#a855f7" strokeWidth="3" fill="none" />
          <rect x="20" y="52" width="7" height="13" rx="3" fill="#a855f7" />
          <rect x="73" y="52" width="7" height="13" rx="3" fill="#a855f7" />
          <path d="M 24 63 Q 32 75 42 75" stroke="#a855f7" strokeWidth="2" fill="none" />
          <circle cx="43" cy="75" r="2.5" fill="#facc15" />
        </svg>
      );

    case 'docker-containers':
      // Cute Sailor Whale carrying containers
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Containers on whale back */}
          <rect x="36" y="22" width="12" height="10" rx="1.5" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.5" />
          <rect x="52" y="22" width="12" height="10" rx="1.5" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.5" />
          <rect x="44" y="10" width="12" height="10" rx="1.5" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1.5" />
          {/* Whale Body */}
          <path
            d="M 18 58 C 18 38, 55 36, 80 44 C 84 46, 88 52, 86 58 C 84 66, 75 74, 55 76 C 36 78, 18 74, 18 58 Z"
            fill="#e0f2fe"
          />
          {/* Whale belly stripes */}
          <path d="M 28 66 Q 50 72 74 62" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" fill="none" />
          {/* Whale Eye & Smile */}
          <circle cx="72" cy="52" r="3.5" fill="#0369a1" />
          <circle cx="71" cy="51" r="1.2" fill="#ffffff" />
          <path d="M 68 59 Q 74 64 78 58" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Whale Fin */}
          <path d="M 44 60 C 44 68, 50 72, 54 68 Z" fill="#7dd3fc" />
          {/* Whale Water Spout */}
          <path d="M 32 36 Q 28 26 24 28" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 32 36 Q 32 24 34 26" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'system-security':
      // Cool Cyber Ninja / Agent with glowing visor & shield badge
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Ninja Cowl */}
          <circle cx="50" cy="52" r="30" fill="#18181b" />
          <path d="M 22 45 C 22 28, 78 28, 78 45 L 80 72 L 20 72 Z" fill="#09090b" />
          {/* Face Visor opening */}
          <rect x="28" y="42" width="44" height="18" rx="5" fill="#f43f5e" />
          {/* Glowing Eyes inside mask */}
          <polygon points="34,51 46,47 44,53" fill="#ffffff" />
          <polygon points="66,51 54,47 56,53" fill="#ffffff" />
          {/* Headband ribbon flowing */}
          <rect x="20" y="36" width="60" height="7" rx="2" fill="#e11d48" />
          <path d="M 78 39 Q 90 42 94 36" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 78 42 Q 92 50 96 46" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Mini Gold Lock on headband */}
          <rect x="46" y="34" width="8" height="6" rx="1.5" fill="#fbbf24" />
          <path d="M 48 34 V 31 C 48 29, 52 29, 52 31 V 34" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
        </svg>
      );

    case 'devops-orchestration':
      // The Funky Rooster / Chicken or Helm Captain like Netflix's chicken avatar!
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Rooster Comb (Red top) */}
          <path
            d="M 28 32 C 28 14, 42 16, 46 28 C 48 12, 64 14, 66 30 C 70 20, 80 24, 76 36 Z"
            fill="#dc2626"
          />
          {/* Head / Body (Yellow Golden Chicken like screenshot) */}
          <rect x="22" y="32" width="56" height="52" rx="12" fill="#eab308" />
          {/* Stern / Cool Straight Eyebrow Bar */}
          <rect x="24" y="44" width="52" height="6" fill="#ca8a04" />
          {/* Big Half-closed Cartoon Eyes (just like the yellow chicken in user's image!) */}
          <rect x="28" y="50" width="18" height="15" rx="3" fill="#ffffff" />
          <circle cx="37" cy="56" r="4.5" fill="#0f172a" />
          <circle cx="36" cy="54" r="1.5" fill="#ffffff" />

          <rect x="54" y="50" width="18" height="15" rx="3" fill="#ffffff" />
          <circle cx="63" cy="56" r="4.5" fill="#0f172a" />
          <circle cx="62" cy="54" r="1.5" fill="#ffffff" />
          {/* Blue Beak / Nose (exactly like screenshot's rooster!) */}
          <polygon points="46,65 54,65 50,73" fill="#0284c7" />
          {/* Red Wattle below beak */}
          <path d="M 48 73 C 48 78, 52 78, 52 73 Z" fill="#dc2626" />
        </svg>
      );

    default:
      return null;
  }
}
