'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { complianceApi } from '@/lib/api';

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  STUDY_PERMIT: { label: 'Study Permit', icon: '🪪', color: 'text-blue-400' },
  WORK_AUTHORIZATION: { label: 'Work Authorization', icon: '💼', color: 'text-purple-400' },
  ENROLLMENT: { label: 'Enrollment', icon: '🎓', color: 'text-green-400' },
  HEALTH_INSURANCE: { label: 'Health Insurance', icon: '❤️', color: 'text-red-400' },
  HOUSING: { label: 'Housing', icon: '🏠', color: 'text-orange-400' },
  TAXES: { label: 'Taxes', icon: '🧾', color: 'text-gray-400' },
  REPORTING: { label: 'Reporting', icon: '📄', color: 'text-cyan-400' },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  COMPLETED: { label: 'Completed', bg: 'bg-green-500/20', text: 'text-green-400' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  PENDING: { label: 'Pending', bg: 'bg-slate-500/20', text: 'text-slate-400' },
  OVERDUE: { label: 'Overdue', bg: 'bg-red-500/20', text: 'text-red-400' },
  NOT_APPLICABLE: { label: 'N/A', bg: 'bg-slate-700/20', text: 'text-slate-500' },
};

export default function CompliancePage() {
  const router = useRouter();
  const { token, loadFromStorage } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { loadFromStorage(); }, []);

  useEffect(() => {
    if (token) fetchChecklist();
  }, [token]);

  async function fetchChecklist() {
    try {
      const res: any = await complianceApi.getChecklist(token!);
      setItems(res.checklist || []);
      setStats(res.stats || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(itemId: string, newStatus: string) {
    setUpdating(itemId);
    try {
      await complianceApi.updateItem(token!, itemId, { status: newStatus });
      await fetchChecklist();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  const filteredItems = filter === 'ALL'
    ? items
    : items.filter((i) => i.rule?.category === filter);

  const categories = Array.from(new Set(items.map((i) => i.rule?.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading checklist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-slate-400 hover:text-white transition">← Dashboard</a>
          <span className="text-sm text-slate-500">Compliance Checklist</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">📋 Compliance Checklist</h1>
        <p className="text-slate-400 mb-8">Track every requirement to maintain your study permit status.</p>

        {items.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <span className="text-5xl block mb-4">📋</span>
            <h2 className="text-xl font-semibold mb-2">No checklist items yet</h2>
            <p className="text-slate-400 mb-6">Add your study permit details first to generate your personalized compliance checklist.</p>
            <a href="/dashboard/permit" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">
              Add Study Permit →
            </a>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                <StatBox label="Total" value={stats.total} color="text-white" />
                <StatBox label="Completed" value={stats.completed} color="text-green-400" />
                <StatBox label="In Progress" value={stats.inProgress} color="text-blue-400" />
                <StatBox label="Pending" value={stats.pending} color="text-slate-400" />
                <StatBox label="Overdue" value={stats.overdue} color="text-red-400" />
              </div>
            )}

            {/* Progress Bar */}
            {stats && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Overall Completion</span>
                  <span className="text-sm font-bold text-blue-400">{stats.completionRate}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
            )}

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <FilterButton
                active={filter === 'ALL'}
                onClick={() => setFilter('ALL')}
                label="All"
              />
              {categories.map((cat) => (
                <FilterButton
                  key={cat}
                  active={filter === cat}
                  onClick={() => setFilter(cat)}
                  label={`${CATEGORY_CONFIG[cat]?.icon || '📌'} ${CATEGORY_CONFIG[cat]?.label || cat}`}
                />
              ))}
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const cat = CATEGORY_CONFIG[item.rule?.category] || { label: 'Other', icon: '📌', color: 'text-slate-400' };
                const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
                const isUpdating = updating === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-slate-800/50 border rounded-xl p-5 transition ${
                      item.status === 'OVERDUE' ? 'border-red-500/30' :
                      item.status === 'COMPLETED' ? 'border-green-500/20' :
                      'border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => updateStatus(
                          item.id,
                          item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
                        )}
                        disabled={isUpdating}
                        className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                          item.status === 'COMPLETED'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-500 hover:border-blue-500'
                        } ${isUpdating ? 'opacity-50' : ''}`}
                      >
                        {item.status === 'COMPLETED' && '✓'}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs ${cat.color}`}>{cat.icon} {cat.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                        <h3 className={`font-medium ${item.status === 'COMPLETED' ? 'line-through text-slate-500' : ''}`}>
                          {item.rule?.title}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">{item.rule?.description}</p>
                        {item.dueDate && (
                          <p className={`text-xs mt-2 ${
                            item.status === 'OVERDUE' ? 'text-red-400' : 'text-slate-500'
                          }`}>
                            {item.status === 'OVERDUE' ? '⚠️ Overdue — ' : '📅 '}
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        {item.rule?.helpUrl && (
                          <a
                            href={item.rule.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
                          >
                            Learn more →
                          </a>
                        )}
                      </div>

                      {/* Status Toggle */}
                      <div className="flex-shrink-0">
                        <select
                          value={item.status}
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                          disabled={isUpdating}
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="NOT_APPLICABLE">N/A</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
        active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
      }`}
    >
      {label}
    </button>
  );
}
