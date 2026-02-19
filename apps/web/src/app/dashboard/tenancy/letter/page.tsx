'use client';

import { useState } from 'react';

type LetterType = 'deposit_return' | 'repair_request' | 'rent_increase_dispute' | 'eviction_response';

interface LetterTemplate {
  id: LetterType;
  label: string;
  icon: string;
  description: string;
  fields: { name: string; label: string; placeholder: string; type?: string; required?: boolean }[];
}

const TEMPLATES: LetterTemplate[] = [
  {
    id: 'deposit_return',
    label: 'Security Deposit Return',
    icon: '💰',
    description: 'Demand the return of your security deposit after move-out.',
    fields: [
      { name: 'tenantName', label: 'Your Full Name', placeholder: 'Amina Okafor', required: true },
      { name: 'landlordName', label: 'Landlord / Property Manager Name', placeholder: 'John Smith', required: true },
      { name: 'landlordAddress', label: 'Landlord Address', placeholder: '123 Main St, Winnipeg, MB R3T 2N2' },
      { name: 'propertyAddress', label: 'Rental Unit Address', placeholder: '456 Fort Garry Dr, Unit 4B' },
      { name: 'moveOutDate', label: 'Move-out Date', placeholder: '', type: 'date', required: true },
      { name: 'depositAmount', label: 'Deposit Amount ($)', placeholder: '500', required: true },
      { name: 'monthlyRent', label: 'Monthly Rent ($)', placeholder: '1000' },
    ],
  },
  {
    id: 'repair_request',
    label: 'Repair Request',
    icon: '🔧',
    description: 'Formally request your landlord to complete necessary repairs.',
    fields: [
      { name: 'tenantName', label: 'Your Full Name', placeholder: 'Amina Okafor', required: true },
      { name: 'landlordName', label: 'Landlord / Property Manager Name', placeholder: 'John Smith', required: true },
      { name: 'landlordAddress', label: 'Landlord Address', placeholder: '123 Main St, Winnipeg, MB R3T 2N2' },
      { name: 'propertyAddress', label: 'Rental Unit Address', placeholder: '456 Fort Garry Dr, Unit 4B', required: true },
      { name: 'repairDescription', label: 'Describe the Repair Issue', placeholder: 'The kitchen faucet has been leaking for 2 weeks...', required: true },
      { name: 'firstReportedDate', label: 'Date You First Reported It', placeholder: '', type: 'date' },
      { name: 'deadlineDays', label: 'Deadline (days from now)', placeholder: '14' },
    ],
  },
  {
    id: 'rent_increase_dispute',
    label: 'Rent Increase Dispute',
    icon: '📈',
    description: 'Challenge an improper or excessive rent increase.',
    fields: [
      { name: 'tenantName', label: 'Your Full Name', placeholder: 'Amina Okafor', required: true },
      { name: 'landlordName', label: 'Landlord / Property Manager Name', placeholder: 'John Smith', required: true },
      { name: 'landlordAddress', label: 'Landlord Address', placeholder: '123 Main St, Winnipeg, MB R3T 2N2' },
      { name: 'propertyAddress', label: 'Rental Unit Address', placeholder: '456 Fort Garry Dr, Unit 4B', required: true },
      { name: 'currentRent', label: 'Current Rent ($)', placeholder: '1000', required: true },
      { name: 'proposedRent', label: 'Proposed New Rent ($)', placeholder: '1200', required: true },
      { name: 'increaseDate', label: 'Proposed Increase Date', placeholder: '', type: 'date' },
      { name: 'noticeDate', label: 'Date You Received the Notice', placeholder: '', type: 'date' },
    ],
  },
  {
    id: 'eviction_response',
    label: 'Eviction Notice Response',
    icon: '🚪',
    description: 'Respond to an eviction notice you believe is invalid.',
    fields: [
      { name: 'tenantName', label: 'Your Full Name', placeholder: 'Amina Okafor', required: true },
      { name: 'landlordName', label: 'Landlord / Property Manager Name', placeholder: 'John Smith', required: true },
      { name: 'landlordAddress', label: 'Landlord Address', placeholder: '123 Main St, Winnipeg, MB R3T 2N2' },
      { name: 'propertyAddress', label: 'Rental Unit Address', placeholder: '456 Fort Garry Dr, Unit 4B', required: true },
      { name: 'noticeDate', label: 'Date on the Eviction Notice', placeholder: '', type: 'date', required: true },
      { name: 'evictionDate', label: 'Date You Must Vacate (per notice)', placeholder: '', type: 'date', required: true },
      { name: 'reason', label: 'Reason Given for Eviction', placeholder: 'e.g., Non-payment, landlord use, noise complaint', required: true },
      { name: 'disputeReason', label: 'Why You Disagree', placeholder: 'e.g., Rent was paid, no lease violation occurred', required: true },
    ],
  },
];

function generateLetter(template: LetterType, data: Record<string, string>): string {
  const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  switch (template) {
    case 'deposit_return': {
      const daysSinceMoveOut = data.moveOutDate
        ? Math.floor((Date.now() - new Date(data.moveOutDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      return `${today}

${data.tenantName}
Former Tenant
${data.propertyAddress}

TO:
${data.landlordName}
${data.landlordAddress || '[Landlord Address]'}

RE: Demand for Return of Security Deposit — ${data.propertyAddress}

Dear ${data.landlordName},

I am writing to formally request the return of my security deposit in the amount of $${data.depositAmount}, which I paid at the commencement of my tenancy at ${data.propertyAddress}.

My tenancy ended on ${data.moveOutDate ? new Date(data.moveOutDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Move-out Date]'}. As of today, ${daysSinceMoveOut} days have elapsed since my move-out date.

Under Section 86(1) of the Manitoba Residential Tenancies Act (C.C.S.M. c. R119.3), you are required to return my security deposit, together with any accrued interest, within 14 business days after the termination of the tenancy.${daysSinceMoveOut > 14 ? ' This deadline has now passed.' : ''}

${data.monthlyRent ? `I note that the maximum allowable security deposit under Section 85(1) is one-half of one month's rent. Based on my monthly rent of $${data.monthlyRent}, the maximum deposit would be $${(parseFloat(data.monthlyRent) / 2).toFixed(2)}.` : ''}

I left the rental unit in good condition, accounting for normal wear and tear. I request that you:

1. Return my full security deposit of $${data.depositAmount} plus interest; OR
2. Provide a detailed written statement of any deductions with supporting documentation.

If I do not receive my deposit or a written statement of deductions within 7 days of this letter, I will file a claim with the Residential Tenancies Branch (RTB) to recover the full amount.

Please remit payment to me at the address above or contact me to arrange return of the deposit.

Sincerely,

${data.tenantName}

cc: Residential Tenancies Branch, Manitoba
    Phone: 204-945-2476`;
    }

    case 'repair_request': {
      const deadline = data.deadlineDays || '14';
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + parseInt(deadline));
      return `${today}

${data.tenantName}
Tenant
${data.propertyAddress}

TO:
${data.landlordName}
${data.landlordAddress || '[Landlord Address]'}

RE: Formal Request for Repairs — ${data.propertyAddress}

Dear ${data.landlordName},

I am writing to formally request that you attend to the following repair issue at my rental unit at ${data.propertyAddress}:

DESCRIPTION OF ISSUE:
${data.repairDescription}

${data.firstReportedDate ? `I first reported this issue on ${new Date(data.firstReportedDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}. Despite my previous report, the issue remains unresolved.` : 'I am bringing this matter to your attention in writing for the first time.'}

Under Section 58(1) of the Manitoba Residential Tenancies Act, you are obligated to maintain the rental unit in a good state of repair, fit for habitation, and in compliance with health, safety, and housing standards.

I respectfully request that you complete the necessary repairs by ${deadlineDate.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })} (${deadline} days from the date of this letter).

If the repairs are not completed within this timeframe, I may:
1. File a complaint with the Residential Tenancies Branch;
2. Request a rent reduction for the period the unit was not properly maintained;
3. Contact the City of Winnipeg regarding any health or safety code violations.

I am available to provide access to the unit at a mutually convenient time. Please contact me to arrange a time for the repairs to be completed.

Sincerely,

${data.tenantName}

cc: Residential Tenancies Branch, Manitoba
    Phone: 204-945-2476`;
    }

    case 'rent_increase_dispute': {
      const currentRent = parseFloat(data.currentRent) || 0;
      const proposedRent = parseFloat(data.proposedRent) || 0;
      const increaseAmount = proposedRent - currentRent;
      const increasePercent = currentRent > 0 ? ((increaseAmount / currentRent) * 100).toFixed(1) : '0';

      let noticeDays = 0;
      if (data.noticeDate && data.increaseDate) {
        noticeDays = Math.floor(
          (new Date(data.increaseDate).getTime() - new Date(data.noticeDate).getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return `${today}

${data.tenantName}
Tenant
${data.propertyAddress}

TO:
${data.landlordName}
${data.landlordAddress || '[Landlord Address]'}

RE: Dispute of Proposed Rent Increase — ${data.propertyAddress}

Dear ${data.landlordName},

I am writing to dispute the proposed rent increase for my unit at ${data.propertyAddress}.

CURRENT RENT: $${data.currentRent}/month
PROPOSED RENT: $${data.proposedRent}/month
INCREASE: $${increaseAmount.toFixed(2)} (${increasePercent}%)
${data.increaseDate ? `EFFECTIVE DATE: ${new Date(data.increaseDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}

I am disputing this increase for the following reason(s):

${noticeDays > 0 && noticeDays < 90 ? `1. INSUFFICIENT NOTICE: Under Section 100(2) of the Residential Tenancies Act, you must provide at least three months (90 days) written notice before a rent increase takes effect. Based on the dates provided, only ${noticeDays} days of notice were given, which is insufficient.\n\n` : ''}2. EXCEEDS GUIDELINE: The Manitoba government sets an annual rent increase guideline. If this increase exceeds the published guideline rate, you are required to obtain approval from the Residential Tenancies Branch before imposing the increase.

Under Section 100(1) of the Act, rent may only be increased once per year and must comply with the annual guideline or receive RTB approval for an above-guideline increase.

I request that you:
1. Withdraw the proposed increase; OR
2. Provide the RTB order number authorizing an above-guideline increase.

If this matter is not resolved, I will file an objection with the Residential Tenancies Branch.

Sincerely,

${data.tenantName}

cc: Residential Tenancies Branch, Manitoba
    Phone: 204-945-2476`;
    }

    case 'eviction_response': {
      let noticeDays = 0;
      if (data.noticeDate && data.evictionDate) {
        noticeDays = Math.floor(
          (new Date(data.evictionDate).getTime() - new Date(data.noticeDate).getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return `${today}

${data.tenantName}
Tenant
${data.propertyAddress}

TO:
${data.landlordName}
${data.landlordAddress || '[Landlord Address]'}

RE: Response to Notice of Termination — ${data.propertyAddress}

Dear ${data.landlordName},

I am writing in response to the notice of termination of tenancy dated ${data.noticeDate ? new Date(data.noticeDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Notice Date]'}, requiring me to vacate ${data.propertyAddress} by ${data.evictionDate ? new Date(data.evictionDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Eviction Date]'}.

REASON STATED: ${data.reason}

I am disputing this notice for the following reason(s):

${data.disputeReason}

${noticeDays > 0 && noticeDays < 90 ? `Additionally, I note that the notice period of ${noticeDays} days may be insufficient under the Residential Tenancies Act, which requires:\n- 3 months for landlord's own use\n- 3 months for month-to-month tenancies (without cause)\n- 14 days for non-payment of rent\n\n` : ''}Please be advised that under the Residential Tenancies Act:

1. Only the Residential Tenancies Branch has the authority to issue a binding Order of Possession;
2. You cannot change the locks, remove my belongings, or shut off utilities;
3. I am entitled to remain in the unit until an RTB order is issued.

I intend to file an objection with the Residential Tenancies Branch regarding this notice. I will continue to fulfill my obligations as a tenant, including the timely payment of rent, pending resolution of this matter.

If you wish to discuss this matter, please contact me in writing.

Sincerely,

${data.tenantName}

cc: Residential Tenancies Branch, Manitoba
    Phone: 204-945-2476
cc: Legal Aid Manitoba
    Phone: 204-985-8500`;
    }
  }
}

export default function LetterGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<LetterType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const template = TEMPLATES.find((t) => t.id === selectedTemplate);

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    const letter = generateLetter(selectedTemplate, formData);
    setGeneratedLetter(letter);
  };

  const handleCopy = async () => {
    if (generatedLetter) {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setFormData({});
    setGeneratedLetter(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard/tenancy" className="text-slate-400 hover:text-white transition">
            ← Tenancy Rights
          </a>
          <span className="text-sm text-slate-500">Letter Generator</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">📝 Dispute Letter Generator</h1>
        <p className="text-slate-400 mb-8">
          Generate a formal letter to your landlord based on Manitoba&apos;s Residential Tenancies Act.
        </p>

        {/* Generated Letter View */}
        {generatedLetter ? (
          <div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Your Letter</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono bg-slate-900/50 rounded-lg p-6 border border-slate-700/30 leading-relaxed">
                {generatedLetter}
              </pre>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-300">
                ⚠️ <strong>Important:</strong> Review and personalize this letter before sending.
                This is a template — not legal advice. Consider consulting Legal Aid Manitoba (204-985-8500)
                for complex situations.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setGeneratedLetter(null)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                ← Edit Details
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Generate Another Letter
              </button>
            </div>
          </div>
        ) : !selectedTemplate ? (
          /* Template Selection */
          <div className="grid md:grid-cols-2 gap-4">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className="text-left bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 rounded-xl p-6 transition"
              >
                <span className="text-3xl block mb-3">{t.icon}</span>
                <h3 className="font-semibold mb-1">{t.label}</h3>
                <p className="text-sm text-slate-400">{t.description}</p>
              </button>
            ))}
          </div>
        ) : (
          /* Form */
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{template?.icon}</span>
              <h2 className="font-semibold text-lg">{template?.label}</h2>
            </div>

            <div className="space-y-4">
              {template?.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm text-slate-400 mb-1">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.name.includes('Description') || field.name.includes('Reason') || field.name.includes('dispute') ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition resize-none"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setSelectedTemplate(null); setFormData({}); }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-semibold transition"
              >
                Generate Letter
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600">
            These letters reference the Manitoba Residential Tenancies Act (C.C.S.M. c. R119.3).
            This is not legal advice. Consult a lawyer for your specific situation.
          </p>
        </div>
      </main>
    </div>
  );
}
