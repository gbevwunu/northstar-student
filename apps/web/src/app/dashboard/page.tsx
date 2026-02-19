'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { complianceApi, workLogApi, permitApi, notificationApi } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, loadFromStorage, logout } = useAuthStore();

  const [permit, setPermit] = useState<any>(null);
  const [workDash, setWorkDash] = useState<any>(null);
  const [compliance, setCompliance] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('northstar_token')) {
      router.push('/login');
      return;
    }

    if (token) {
      fetchDashboardData();
    }
  }, [isAuthenticated, token]);

  async function fetchDashboardData() {
    try {
      const [permitRes, workRes, complianceRes, notifRes] = await Promise.allSettled([
        permitApi.get(token!),
        workLogApi.dashboard(token!),
        complianceApi.getChecklist(token!),
        notificationApi.getAll(token!),
      ]);

      if (permitRes.status === 'fulfilled') setPermit(permitRes.value);
      if (workRes.status === 'fulfilled') setWorkDash(workRes.value);
      if (complianceRes.status === 'fulfilled') setCompliance(complianceRes.value);
      if (notifRes.status === 'fulfilled') {
        const data = notifRes.value as any;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⭐</div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Derived data with safe defaults
  const permitData = permit?.permit;
  const daysUntilExpiry = permit?.daysUntilExpiry ?? null;
  const weekHours = workDash?.currentWeek?.totalHours ?? 0;
  const weekCap = workDash?.cap ?? 24;
  const weekRemaining = workDash?.remainingThisWeek ?? 24;
  const stats = compliance?.stats ?? { total: 0, completed: 0, overdue: 0, completionRate: 0 };
  const workPercentage = weekCap > 0 ? Math.round((weekHours / weekCap) * 100) : 0;
  const isWorkWarning = workPercentage >= 83;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⭐</span>
            <span className="font-bold">NorthStar</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="/dashboard" className="text-white">Dashboard</a>
            <a href="/dashboard/compliance" className="hover:text-white transition">Checklist</a>
            <a href="/dashboard/work-log" className="hover:text-white transition">Work Hours</a>
            <a href="/dashboard/documents" className="hover:text-white transition">Documents</a>
            <a href="/dashboard/tenancy" className="hover:text-white transition">Tenancy</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-white">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Log Out
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {user?.firstName?.[0] || '?'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {user?.firstName || 'Student'}
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Here&apos;s your compliance overview
        </p>

        {/* Onboarding prompt if no permit */}
        {!permitData && (
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-blue-300 mb-2">👋 Get Started</h2>
            <p className="text-slate-300 text-sm mb-4">
              Add your study permit details to unlock your personalized compliance checklist and deadline tracking.
            </p>
            <a
              href="/dashboard/permit"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
            >
              Add Study Permit
            </a>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Permit Status */}
          <StatusCard
            icon="🪪"
            title="Study Permit"
            value={daysUntilExpiry !== null ? `${daysUntilExpiry} days` : 'Not set'}
            subtitle={
              permitData
                ? `Expires ${new Date(permitData.expiryDate).toLocaleDateString()}`
                : 'Add your permit details'
            }
            color={
              daysUntilExpiry === null
                ? 'blue'
                : daysUntilExpiry > 90
                  ? 'green'
                  : daysUntilExpiry > 30
                    ? 'yellow'
                    : 'red'
            }
          />

          {/* Work Hours */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">⏱️</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isWorkWarning
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                }`}
              >
                {weekRemaining}h remaining
              </span>
            </div>
            <div className="text-2xl font-bold">
              {weekHours}h / {weekCap}h
            </div>
            <div className="text-xs text-slate-400 mt-1">This week&apos;s work hours</div>
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
            value={stats.total > 0 ? `${stats.completionRate}%` : 'Not initialized'}
            subtitle={
              stats.total > 0
                ? `${stats.completed}/${stats.total} items complete`
                : 'Add permit to start'
            }
            color={
              stats.total === 0
                ? 'blue'
                : stats.overdue > 0
                  ? 'red'
                  : stats.completionRate >= 80
                    ? 'green'
                    : 'yellow'
            }
          />

          {/* Notifications */}
          <StatusCard
            icon="🔔"
            title="Alerts"
            value={`${unreadCount} unread`}
            subtitle={`${notifications.length} total notifications`}
            color={unreadCount > 0 ? 'yellow' : 'green'}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Notifications */}
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="font-semibold mb-4">Recent Alerts</h2>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n: any) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      n.isRead ? 'bg-slate-700/20' : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <span className="text-lg">
                      {n.type === 'WORK_HOUR_WARNING' || n.type === 'WORK_HOUR_LIMIT'
                        ? '⏱️'
                        : n.type === 'PERMIT_EXPIRY'
                          ? '🪪'
                          : n.type === 'COMPLIANCE_OVERDUE'
                            ? '⚠️'
                            : '📋'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(n.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm">No alerts — you&apos;re in good standing!</p>
              </div>
            )}
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
