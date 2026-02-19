'use client';

import { useState, useEffect } from 'react';

// Mock data for the dashboard (replace with API calls)
const mockData = {
  user: { firstName: 'Amina', lastName: 'Okafor' },
  permit: {
    expiryDate: '2026-09-15',
    daysUntilExpiry: 208,
    status: 'ACTIVE',
  },
  workHours: {
    currentWeek: 16,
    cap: 24,
    remaining: 8,
  },
  compliance: {
    total: 12,
    completed: 8,
    overdue: 1,
    completionRate: 67,
  },
  notifications: [
    { id: '1', title: 'Work hours at 67% of weekly cap', type: 'WARNING', time: '2h ago' },
    { id: '2', title: 'Upload enrollment letter for Winter 2026', type: 'COMPLIANCE_DUE', time: '1d ago' },
    { id: '3', title: 'Study permit renewal reminder: 208 days', type: 'PERMIT_EXPIRY', time: '3d ago' },
  ],
};

export default function DashboardPage() {
  const { user, permit, workHours, compliance, notifications } = mockData;

  const workPercentage = Math.round((workHours.currentWeek / workHours.cap) * 100);
  const isWorkWarning = workPercentage >= 83; // 20/24 threshold

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⭐</span>
            <span className="font-bold">NorthStar</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <a href="/dashboard" className="text-white">Dashboard</a>
            <a href="/dashboard/compliance" className="hover:text-white transition">Checklist</a>
            <a href="/dashboard/work-log" className="hover:text-white transition">Work Hours</a>
            <a href="/dashboard/documents" className="hover:text-white transition">Documents</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-white">
              🔔
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                {notifications.length}
              </span>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {user.firstName[0]}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {user.firstName}
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Here&apos;s your compliance overview
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Permit Status */}
          <StatusCard
            icon="🪪"
            title="Study Permit"
            value={`${permit.daysUntilExpiry} days`}
            subtitle={`Expires ${permit.expiryDate}`}
            color={permit.daysUntilExpiry > 90 ? 'green' : permit.daysUntilExpiry > 30 ? 'yellow' : 'red'}
          />

          {/* Work Hours */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">⏱️</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isWorkWarning ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {workHours.remaining}h remaining
              </span>
            </div>
            <div className="text-2xl font-bold">{workHours.currentWeek}h / {workHours.cap}h</div>
            <div className="text-xs text-slate-400 mt-1">This week&apos;s work hours</div>
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isWorkWarning ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(workPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Compliance */}
          <StatusCard
            icon="📋"
            title="Compliance"
            value={`${compliance.completionRate}%`}
            subtitle={`${compliance.completed}/${compliance.total} items complete`}
            color={compliance.overdue > 0 ? 'red' : compliance.completionRate >= 80 ? 'green' : 'yellow'}
          />

          {/* Documents */}
          <StatusCard
            icon="📁"
            title="Documents"
            value="5 uploaded"
            subtitle="2 pending verification"
            color="blue"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Notifications */}
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="font-semibold mb-4">Recent Alerts</h2>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg"
                >
                  <span className="text-lg">
                    {n.type === 'WARNING' ? '⚠️' : n.type === 'PERMIT_EXPIRY' ? '🪪' : '📋'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction icon="⏱️" label="Log Work Hours" href="/dashboard/work-log" />
              <QuickAction icon="📄" label="Upload Document" href="/dashboard/documents" />
              <QuickAction icon="📋" label="View Checklist" href="/dashboard/compliance" />
              <QuickAction icon="🏠" label="Tenancy Help" href="/dashboard/tenancy" />
              <QuickAction icon="🪪" label="Permit Details" href="/dashboard/permit" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: 'green' | 'yellow' | 'red' | 'blue';
}) {
  const colorMap = {
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
    blue: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${colorMap[color]}`}>
          {title}
        </span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition text-sm"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
