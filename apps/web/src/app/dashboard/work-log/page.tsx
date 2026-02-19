'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { workLogApi } from '@/lib/api';

export default function WorkLogPage() {
  const router = useRouter();
  const { token, loadFromStorage } = useAuthStore();
  const [dashboard, setDashboard] = useState<any>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    employer: '',
    notes: '',
  });
  const [alert, setAlert] = useState<any>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (token) fetchDashboard();
  }, [token]);

  async function fetchDashboard() {
    try {
      const res = await workLogApi.dashboard(token!);
      setDashboard(res);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAlert(null);

    if (!form.hoursWorked || !form.employer) {
      setError('Please fill in hours and employer');
      return;
    }

    setLoading(true);
    try {
      const res: any = await workLogApi.logHours(token!, {
        date: form.date,
        hoursWorked: parseFloat(form.hoursWorked),
        employer: form.employer,
        notes: form.notes || undefined,
      });

      if (res.alert) setAlert(res.alert);
      setSuccess('Hours logged successfully!');
      setForm({ ...form, hoursWorked: '', employer: form.employer, notes: '' });
      fetchDashboard();
    } catch (err: any) {
      setError(err.message || 'Failed to log hours');
    } finally {
      setLoading(false);
    }
  };

  const cap = dashboard?.cap ?? 24;
  const weekHours = dashboard?.currentWeek?.totalHours ?? 0;
  const remaining = dashboard?.remainingThisWeek ?? 24;
  const percentage = cap > 0 ? Math.round((weekHours / cap) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-slate-400 hover:text-white transition">← Dashboard</a>
          <span className="text-sm text-slate-500">Work Hour Tracker</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">⏱️ Work Hour Tracker</h1>
        <p className="text-slate-400 mb-8">Stay under the 24-hour weekly cap to protect your study permit.</p>

        {/* Weekly Summary */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">This Week</h2>
            <span className={`text-sm px-3 py-1 rounded-full ${
              percentage >= 100 ? 'bg-red-500/20 text-red-400' :
              percentage >= 83 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {remaining}h remaining
            </span>
          </div>
          <div className="text-4xl font-bold mb-2">{weekHours}h <span className="text-lg text-slate-500">/ {cap}h</span></div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentage >= 100 ? 'bg-red-500' :
                percentage >= 83 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          {dashboard?.month && (
            <p className="text-xs text-slate-500 mt-3">
              Monthly total: {dashboard.month.totalHours}h across {dashboard.month.logCount} entries
            </p>
          )}
        </div>

        {/* Alert Banner */}
        {alert && (
          <div className={`rounded-xl p-4 mb-6 ${
            alert.level === 'CRITICAL' ? 'bg-red-500/10 border border-red-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'
          }`}>
            <p className={`text-sm ${alert.level === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'}`}>
              {alert.level === 'CRITICAL' ? '🚨' : '⚠️'} {alert.message}
            </p>
          </div>
        )}

        {/* Log Form */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Log Work Hours</h2>

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
              <p className="text-green-400 text-sm">✅ {success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Hours Worked</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  value={form.hoursWorked}
                  onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
                  placeholder="e.g., 4.5"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Employer</label>
              <input
                type="text"
                value={form.employer}
                onChange={(e) => setForm({ ...form, employer: e.target.value })}
                placeholder="e.g., Tim Hortons, University of Manitoba"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g., Evening shift"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? 'Logging...' : 'Log Hours'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
