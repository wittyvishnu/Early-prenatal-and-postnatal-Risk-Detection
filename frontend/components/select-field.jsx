'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

export default function SelectField({ name, label, options, value, onChange, info }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900">{label}</label>
        {info && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              className="rounded-full p-1 hover:bg-gray-200"
            >
              <Info className="h-3 w-3 text-gray-600 hover:text-gray-800" />
            </button>
            {showInfo && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-gray-800 p-2 text-xs text-white shadow-lg">
                {info}
              </div>
            )}
          </div>
        )}
      </div>

      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-colors hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
