'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({ content }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="rounded-full p-1 hover:bg-gray-200"
      >
        <Info className="h-4 w-4 text-gray-600 hover:text-gray-800" />
      </button>

      {isVisible && (
        <div className="absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-gray-800 p-3 text-xs text-white shadow-xl">
          {content}
          <div className="absolute -bottom-1 right-3 h-2 w-2 -rotate-45 bg-gray-800" />
        </div>
      )}
    </div>
  );
}
