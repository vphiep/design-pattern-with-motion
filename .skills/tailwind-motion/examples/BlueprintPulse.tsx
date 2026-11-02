'use client';

import React from 'react';

/**
 * Blueprint glowing indicator for active diagram circuits.
 */
export function BlueprintPulse() {
  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      {/* Outer Ping */}
      <span className="absolute inline-flex w-full h-full rounded-full opacity-75 bg-[var(--accent)] animate-ping" />
      {/* Middle Pulse */}
      <span className="relative inline-flex w-4 h-4 rounded-full bg-[var(--accent)]" />
      {/* Core Node */}
      <span className="absolute w-2 h-2 rounded-full bg-white" />
    </div>
  );
}
