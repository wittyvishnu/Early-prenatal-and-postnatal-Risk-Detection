'use client';

export default function StatusBadge({ status }) {
  let bgColor = 'bg-gray-100 text-gray-700';
  let label = 'Unknown';

  if (status === 'NORMAL') {
    bgColor = 'bg-green-100 text-green-700';
    label = 'Normal';
  } else if (status === 'SUSPECT') {
    bgColor = 'bg-yellow-100 text-yellow-700';
    label = 'Suspect';
  } else if (status === 'PATHOLOGICAL') {
    bgColor = 'bg-red-100 text-red-700';
    label = 'Pathological';
  }

  return (
    <span className={`rounded-full px-4 py-2 text-sm font-semibold ${bgColor}`}>
      {label}
    </span>
  );
}
