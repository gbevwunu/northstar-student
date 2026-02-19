'use client';

import { useState } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Hero Section */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <span className="text-xl font-bold">NorthStar Student</span>
        </div>
        <div className="flex gap-4">
          <a href="/login" className="px-4 py-2 text-sm text-blue-300 hover:text-white transition">
            Log In
          </a>
          <a
            href="/register"
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition"
          >
            Get Started
          </a>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <div className="inline-block px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full mb-6">
            Built for International Students in Manitoba
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Insurance for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Your Future
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl">
            One missed deadline can mean deportation. NorthStar keeps your study permit
            compliant, tracks your work hours, and protects your tenancy rights in Winnipeg.
          </p>
          <div className="flex gap-4">
            <a
              href="/register"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-lg font-semibold transition"
            >
              Protect Your Status
            </a>
            <a
              href="#features"
              className="px-8 py-3 border border-slate-600 hover:border-blue-400 rounded-lg text-lg transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem value="50%" label="Permit cuts in Manitoba" />
          <StatItem value="24hrs" label="Weekly work cap" />
          <StatItem value="$0" label="Max deposit: half month" />
          <StatItem value="30 days" label="Renewal deadline buffer" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Three layers of protection
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📋"
            title="Compliance Checklist"
            description="Track every requirement to maintain your study permit. Auto-generated deadlines, document uploads, and real-time status monitoring."
          />
          <FeatureCard
            icon="⏱️"
            title="Work Hour Tracker"
            description="Log your hours and get instant alerts when approaching the 24-hour weekly cap. Never risk your status by accidentally working too much."
          />
          <FeatureCard
            icon="🏠"
            title="Tenancy Rights Wizard"
            description="Know your rights under Manitoba's Residential Tenancies Act. Dispute templates, deposit rules, and landlord communication tools."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-12 border border-blue-500/20">
          <h2 className="text-3xl font-bold mb-4">
            Don&apos;t leave your future to chance
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Join hundreds of international students in Winnipeg who use NorthStar
            to stay compliant and protected.
          </p>
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-lg font-semibold transition"
          >
            Get Started Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span>⭐</span>
            <span className="text-sm">NorthStar Student &copy; 2026. Built in Winnipeg, MB.</span>
          </div>
          <div className="text-sm text-slate-500">
            Not legal advice. Always consult IRCC or a licensed immigration consultant.
          </div>
        </div>
      </footer>
    </main>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-blue-400">{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
