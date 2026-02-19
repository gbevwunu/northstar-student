'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { permitApi, complianceApi } from '@/lib/api';

export default function PermitPage() {
  const { token, loadFromStorage } = useAuthStore();
  const [permit, setPermit] = useState<any>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [form, setForm] = useState({
    permitNumber: '',
    issueDate: '',
    expiryDate: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadFromStorage(); }, []);

  useEffect(() => {
    if (token) fetchPermit();
  }, [token]);

  async function fetchPermit() {
    try {
      const res: any = await permitApi.get(token!);
      if (res.permit) {
        setPermit(res.permit);
        setDaysLeft(res.daysUntilExpiry);
        setForm({
          permitNumber: res.permit.permitNumber || '',
          issueDate: res.permit.issueDate?.split('T')[0] || '',
          expiryDate: res.permit.expiryDate?.split('T')[0] || '',
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.expiryDate) {
      setError('Expiry date is required');
      return;
    }

    setLoading(true);
    try {
      const res: any = await permitApi.save(token!, {
        permitNumber: form.permitNumber || undefined,
        issueDate: form.issueDate || undefined,
        expiryDate: form.expiryDate,
      });

      setPermit(res.permit);
      setDaysLeft(res.daysUntilExpiry);
      setSuccess('Study permit saved! Your compliance checklist is being generated.');

      // Initialize compliance checklist
      try {
        await complianceApi.initialize(token!);
      } catch {
        // May already be initialized
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save permit');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = !daysLeft ? 'blue' : daysLeft > 90 ? 'green' : daysLeft > 30 ? 'yellow' : 'red';
  const statusLabel = !daysLeft ? 'Not Set' : daysLeft > 90 ? 'Active' : daysLeft > 30 ? 'Expiring Soon' : daysLeft > 0 ? 'Urgent' : 'Expired';

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-slate-400 hover:text-white transition">← Dashboard</a>
          <span className="text-sm text-slate-500">Study Permit</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">🪪 Study Permit</h1>
        <p className="text-slate-400 mb-8">Track your permit status and renewal deadlines.</p>

        {/* Status Card */}
        {daysLeft !== null && (
          <div className={`rounded-xl p-6 mb-8 border ${
            statusColor === 'green' ? 'bg-green-500/5 border-green-500/20' :
            statusColor === 'yellow' ? 'bg-yellow-500/5 border-yellow-500/20' :
            statusColor === 'red' ? 'bg-red-500/5 border-red-500/20' :
            'bg-blue-500/5 border-blue-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Days Until Expiry</p>
                <p className="text-4xl font-bold mt-1">{daysLeft}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                statusColor === 'green' ? 'bg-green-500/20 text-green-400' :
                statusColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                statusColor === 'red' ? 'bg-red-500/20 text-red-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {statusLabel}
              </div>
            </div>
            {daysLeft <= 90 && daysLeft > 0 && (
              <p className="text-sm text-yellow-300 mt-4">
                ⚠️ You should begin your renewal process now. Apply at least 30 days before expiry.
              </p>
            )}
            {daysLeft <= 0 && (
              <p className="text-sm text-red-300 mt-4">
                🚨 Your permit has expired. Contact your university&apos;s international office and IRCC immediately.
              </p>
            )}
          </div>
        )}

        {/* Form */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="font-semibold mb-4">{permit ? 'Update Permit Details' : 'Add Your Study Permit'}</h2>

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
            <div>
              <label className="block text-sm text-slate-400 mb-1">Permit Number</label>
              <input
                type="text"
                value={form.permitNumber}
                onChange={(e) => setForm({ ...form, permitNumber: e.target.value })}
                placeholder="e.g., F123456789"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? 'Saving...' : permit ? 'Update Permit' : 'Save Permit & Generate Checklist'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
