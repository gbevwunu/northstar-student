'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const UNIVERSITIES = [
  { value: 'UNIVERSITY_OF_MANITOBA', label: 'University of Manitoba' },
  { value: 'UNIVERSITY_OF_WINNIPEG', label: 'University of Winnipeg' },
  { value: 'RED_RIVER_COLLEGE', label: 'Red River College Polytechnic' },
  { value: 'BRANDON_UNIVERSITY', label: 'Brandon University' },
  { value: 'OTHER', label: 'Other' },
];

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: 'UNIVERSITY_OF_MANITOBA',
    program: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res: any = await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        university: form.university,
        program: form.program || undefined,
      });

      login(res.user, res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-white">
            <span className="text-2xl">⭐</span>
            <span className="text-xl font-bold">NorthStar Student</span>
          </a>
          <p className="text-slate-400 text-sm mt-2">
            Create your account to protect your student status
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Create Account</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  placeholder="Amina"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  placeholder="Okafor"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                placeholder="amina@myumanitoba.ca"
              />
            </div>

            {/* University */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">University</label>
              <select
                name="university"
                value={form.university}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
              >
                {UNIVERSITIES.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Program */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Program</label>
              <input
                type="text"
                name="program"
                value={form.program}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                placeholder="e.g., Computer Science"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                placeholder="Min 8 characters"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                placeholder="Re-enter password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-3 rounded-lg font-semibold transition mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300 transition">
              Log in
            </a>
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Not legal advice. Always consult IRCC or a licensed immigration consultant.
        </p>
      </div>
    </div>
  );
}
