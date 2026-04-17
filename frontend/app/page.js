'use client';

import DashboardTabs from '@/components/dashboard-tabs';

export default function Home() {
  return (
    <main className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <DashboardTabs />
      </div>
    </main>
  );
}
