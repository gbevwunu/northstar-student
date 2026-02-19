'use client';

import { useState } from 'react';

type Step = {
  id: string;
  question: string;
  options: { label: string; value: string; next: string | null; info?: string }[];
};

const WIZARD_STEPS: Step[] = [
  {
    id: 'start',
    question: 'What tenancy issue are you dealing with?',
    options: [
      { label: '🏠 Security Deposit Dispute', value: 'deposit', next: 'deposit_type' },
      { label: '📈 Rent Increase', value: 'rent_increase', next: 'rent_increase_notice' },
      { label: '🔧 Repairs Not Being Made', value: 'repairs', next: 'repairs_reported' },
      { label: '🚪 Eviction or Notice to Leave', value: 'eviction', next: 'eviction_type' },
      { label: '📋 General Rights Info', value: 'general', next: 'general_info' },
    ],
  },

  // === SECURITY DEPOSIT BRANCH ===
  {
    id: 'deposit_type',
    question: 'What is the deposit issue?',
    options: [
      { label: 'Landlord wants more than half month rent', value: 'too_high', next: 'deposit_too_high' },
      { label: 'Landlord won\'t return my deposit', value: 'not_returned', next: 'deposit_not_returned' },
      { label: 'Landlord made unfair deductions', value: 'deductions', next: 'deposit_deductions' },
    ],
  },
  {
    id: 'deposit_too_high',
    question: '',
    options: [
      {
        label: '✅ I understand my rights',
        value: 'done',
        next: null,
        info: `Under the Manitoba Residential Tenancies Act, your landlord can ONLY charge a maximum of HALF of one month's rent as a security deposit.

**Example:** If your rent is $1,000/month, the max deposit is $500.

If your landlord charged more:
1. Request a refund of the excess amount in writing
2. If they refuse, file a claim with the Residential Tenancies Branch (RTB)
3. Call RTB: 204-945-2476
4. Online: gov.mb.ca/cca/rtb/

**Important:** Keep all receipts and communications in writing.`,
      },
    ],
  },
  {
    id: 'deposit_not_returned',
    question: 'How long ago did your tenancy end?',
    options: [
      {
        label: 'Less than 14 days ago',
        value: 'recent',
        next: null,
        info: `Your landlord has **14 business days** after your tenancy ends to return your security deposit (plus interest) or provide a written statement of deductions.

**Wait until the 14 business days have passed.** If you still haven't received it, you can then file a claim with the RTB.

In the meantime, send a written request (email is fine) asking for the return of your deposit. Keep a copy for your records.`,
      },
      {
        label: 'More than 14 days ago',
        value: 'overdue',
        next: null,
        info: `Your landlord has **violated the law.** Under the RTA, they must return your deposit within 14 business days.

**What to do now:**
1. Send a formal written demand (we can generate one for you)
2. File a claim with the Residential Tenancies Branch
3. Phone: **204-945-2476**
4. You may be entitled to the FULL deposit back regardless of any damages

**Document everything:** photos of the unit when you left, your lease, deposit receipt, and all communications.`,
      },
    ],
  },
  {
    id: 'deposit_deductions',
    question: '',
    options: [
      {
        label: '✅ I understand my rights',
        value: 'done',
        next: null,
        info: `Landlords can ONLY deduct from your deposit for:
- **Unpaid rent** (not disputed)
- **Damages beyond normal wear and tear** (they must prove this)
- **Cleaning** only if the unit was left unreasonably dirty

They CANNOT deduct for:
- Normal wear and tear (scuff marks, minor nail holes, carpet wear)
- Pre-existing damage (check your move-in inspection report)
- Professional cleaning if you left the unit in reasonable condition

**If you disagree with deductions:**
1. Request an itemized list of deductions in writing
2. Dispute any unfair charges
3. File a claim with the RTB: **204-945-2476**

**Pro tip:** Always do a move-in AND move-out inspection with dated photos.`,
      },
    ],
  },

  // === RENT INCREASE BRANCH ===
  {
    id: 'rent_increase_notice',
    question: 'How much notice did your landlord give you?',
    options: [
      {
        label: 'Less than 3 months',
        value: 'insufficient',
        next: null,
        info: `**This rent increase may be invalid.** In Manitoba, landlords must give at least **3 months (90 days)** written notice before a rent increase takes effect.

The notice must:
- Be in writing
- State the new rent amount
- State the effective date (at least 90 days away)

**If the notice was less than 90 days:**
1. You do NOT have to pay the increased amount
2. Respond in writing stating the notice is insufficient
3. Contact RTB if your landlord insists: **204-945-2476**

Manitoba also has a **rent increase guideline** set annually by the government. For 2026, check gov.mb.ca for the current rate.`,
      },
      {
        label: '3 months or more',
        value: 'sufficient',
        next: 'rent_increase_amount',
      },
    ],
  },
  {
    id: 'rent_increase_amount',
    question: 'Is the increase above the annual guideline rate?',
    options: [
      {
        label: 'Yes / I\'m not sure',
        value: 'above',
        next: null,
        info: `Manitoba sets an **annual rent increase guideline**. Landlords cannot increase rent above this rate without RTB approval.

**What to do:**
1. Check the current guideline rate at gov.mb.ca/cca/rtb/
2. Calculate if your increase exceeds the guideline
3. If it does, your landlord must have applied to the RTB for an above-guideline increase
4. Ask your landlord for the RTB order number
5. If they don't have one, the excess increase is invalid

**You can object** by writing to the RTB within the notice period.

Contact RTB: **204-945-2476**`,
      },
      {
        label: 'No, it\'s within the guideline',
        value: 'within',
        next: null,
        info: `If the rent increase is within the annual guideline and your landlord gave proper 90-day notice, the increase is likely valid.

**Your options:**
- Accept the increase and continue your tenancy
- Give proper notice to end your tenancy (1 month for month-to-month)
- Negotiate with your landlord for a smaller increase

**Remember:** Even valid increases must be in writing with 90 days notice. Keep a copy of the notice for your records.`,
      },
    ],
  },

  // === REPAIRS BRANCH ===
  {
    id: 'repairs_reported',
    question: 'Have you reported the repair issue to your landlord in writing?',
    options: [
      {
        label: 'No, only verbally',
        value: 'verbal',
        next: null,
        info: `**Step 1: Put it in writing.** Verbal complaints are hard to prove.

Send your landlord an email or letter that includes:
- Description of the issue
- When you first noticed it
- How it affects your living conditions
- A reasonable deadline for repair (usually 7-14 days)

**Keep a copy** and note the date you sent it.

Under Manitoba law, landlords must maintain the unit in a **habitable condition**. This includes:
- Working plumbing, heating, and electrical
- Structural integrity
- Compliance with health and safety standards

If they don't respond within a reasonable time after your written request, you can file with the RTB.`,
      },
      {
        label: 'Yes, in writing',
        value: 'written',
        next: null,
        info: `Good — you have documentation. If your landlord hasn't responded within a reasonable time:

**Your options under Manitoba law:**
1. **File a complaint with the RTB** — they can order repairs
   - Phone: **204-945-2476**
   - Online: gov.mb.ca/cca/rtb/
2. **Request a rent reduction** until repairs are completed
3. **Contact the City of Winnipeg** for health/safety code violations
   - 311 for general city services
   - They can issue orders to the landlord

**DO NOT:**
- Withhold rent without RTB authorization (this can be used against you)
- Make repairs yourself and deduct from rent without RTB approval
- Abandon the unit — this could affect your deposit

**Document everything:** photos, dates, written communications.`,
      },
    ],
  },

  // === EVICTION BRANCH ===
  {
    id: 'eviction_type',
    question: 'What type of notice did you receive?',
    options: [
      {
        label: 'Verbal threat to evict',
        value: 'verbal',
        next: null,
        info: `**A verbal eviction threat is NOT legally valid in Manitoba.**

Your landlord MUST provide written notice to end your tenancy. The required notice depends on the reason:
- **Non-payment of rent:** 14 days written notice
- **Breach of lease:** Written notice with time to fix the issue
- **Landlord's own use:** 3 months written notice
- **No reason (month-to-month):** 3 months written notice

**What to do:**
1. Stay calm — you cannot be forced out verbally
2. Ask for everything in writing
3. Do NOT leave voluntarily based on verbal threats
4. Document the threat (write down date, time, what was said)
5. If you feel harassed, contact the RTB: **204-945-2476**

**Your landlord cannot:** change locks, remove your belongings, shut off utilities, or physically remove you. These are illegal.`,
      },
      {
        label: 'Written notice',
        value: 'written',
        next: null,
        info: `If you received a written eviction notice, check these things:

**1. Is the notice period correct?**
- Non-payment: 14 days
- Lease violation: Varies (must give time to fix)
- Landlord's own use: 3 months
- End of fixed-term lease: 3 months

**2. Does it state a valid reason?**
Landlords cannot evict for:
- Complaining about repairs
- Contacting the RTB
- Having guests
- Discrimination (race, nationality, etc.)

**3. Is it properly formatted?**
Must include: your name, address, reason, effective date, landlord signature

**If you believe the notice is invalid:**
1. Respond in writing disputing the notice
2. File an objection with the RTB within the notice period
3. Phone: **204-945-2476**

**DO NOT leave** until the RTB issues an order, even if the notice period expires. Only the RTB can legally order an eviction.`,
      },
    ],
  },

  // === GENERAL INFO ===
  {
    id: 'general_info',
    question: '',
    options: [
      {
        label: '✅ Got it',
        value: 'done',
        next: null,
        info: `## Your Key Rights as a Tenant in Manitoba

**Security Deposits:**
- Max: half of one month's rent
- Must be returned within 14 business days of move-out
- Landlord must pay interest on deposits

**Rent:**
- Increases require 3 months written notice
- Must follow annual guideline rate (or get RTB approval)
- Cannot be increased during a fixed-term lease

**Repairs:**
- Landlord must maintain the unit in habitable condition
- Put repair requests in writing
- Don't withhold rent without RTB approval

**Privacy:**
- Landlord must give 24 hours notice before entering (except emergencies)
- You can refuse entry without proper notice

**Ending Your Tenancy:**
- Month-to-month: give 1 full rental month notice
- Fixed-term: notice required before lease end date

**Resources:**
- RTB Phone: **204-945-2476**
- RTB Website: **gov.mb.ca/cca/rtb/**
- Legal Aid Manitoba: **204-985-8500**
- U of M Legal Clinic: available for students`,
      },
    ],
  },
];

export default function TenancyWizardPage() {
  const [currentStepId, setCurrentStepId] = useState('start');
  const [history, setHistory] = useState<string[]>([]);
  const [resultInfo, setResultInfo] = useState<string | null>(null);

  const currentStep = WIZARD_STEPS.find((s) => s.id === currentStepId);

  const handleSelect = (option: { next: string | null; info?: string }) => {
    if (option.info) {
      setResultInfo(option.info);
    }

    if (option.next) {
      setHistory([...history, currentStepId]);
      setCurrentStepId(option.next);
      setResultInfo(null);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentStepId(prev);
      setResultInfo(null);
    }
  };

  const handleRestart = () => {
    setCurrentStepId('start');
    setHistory([]);
    setResultInfo(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            ← Back to Dashboard
          </a>
          <span className="text-sm text-slate-500">NorthStar Tenancy Rights</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <span className="text-5xl mb-4 block">🏠</span>
          <h1 className="text-3xl font-bold mb-2">Manitoba Tenancy Rights Wizard</h1>
          <p className="text-slate-400">
            Know your rights under the Residential Tenancies Act
          </p>
        </div>

        {/* Wizard Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 max-w-2xl mx-auto">
          {/* Progress */}
          {history.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={handleBack}
                className="text-sm text-blue-400 hover:text-blue-300 transition"
              >
                ← Back
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={handleRestart}
                className="text-sm text-slate-500 hover:text-slate-300 transition"
              >
                Start Over
              </button>
            </div>
          )}

          {/* Result Info */}
          {resultInfo && (
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6 mb-6">
              <div className="prose prose-invert prose-sm max-w-none">
                {resultInfo.split('\n').map((line, i) => {
                  if (line.startsWith('##')) {
                    return <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-semibold text-blue-300 mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="text-slate-300 text-sm ml-4">{formatBold(line.slice(2))}</li>;
                  }
                  if (line.match(/^\d+\./)) {
                    return <li key={i} className="text-slate-300 text-sm ml-4 list-decimal">{formatBold(line.replace(/^\d+\.\s*/, ''))}</li>;
                  }
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} className="text-slate-300 text-sm">{formatBold(line)}</p>;
                })}
              </div>
            </div>
          )}

          {/* Question */}
          {currentStep?.question && (
            <h2 className="text-xl font-semibold mb-6">{currentStep.question}</h2>
          )}

          {/* Options */}
          {!resultInfo || currentStep?.options.some(o => o.next !== null) ? (
            <div className="space-y-3">
              {currentStep?.options
                .filter(o => !resultInfo || o.next !== null)
                .map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(option)}
                    className="w-full text-left p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-blue-500/30 rounded-xl transition"
                  >
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-700/30">
              <button
                onClick={handleRestart}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition"
              >
                Ask Another Question
              </button>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
            <p className="text-sm text-slate-400">
              <strong className="text-slate-300">Need immediate help?</strong>{' '}
              Residential Tenancies Branch: <strong className="text-blue-400">204-945-2476</strong>{' '}
              | Legal Aid Manitoba: <strong className="text-blue-400">204-985-8500</strong>
            </p>
          </div>
          <p className="text-xs text-slate-600 mt-4">
            This is general information, not legal advice. Consult a lawyer for your specific situation.
          </p>
        </div>
      </main>
    </div>
  );
}

function formatBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-white font-semibold">{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
