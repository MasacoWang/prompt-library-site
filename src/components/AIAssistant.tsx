'use client';

import { useState } from 'react';
import { copyToCopilot, copyToClipboard } from '@/lib/utils';

/* ─────────────────────────────────────────────
   Stage options for email generator
   ───────────────────────────────────────────── */
const EMAIL_STAGES = [
  { key: 'outreach', label: '📨 Initial Outreach', desc: 'First contact with a candidate' },
  { key: 'follow-up', label: '🔄 Follow-up', desc: 'Candidate hasn\'t replied yet' },
  { key: 'scheduling', label: '📅 Interview Scheduling', desc: 'Schedule an interview' },
  { key: 'post-interview', label: '💬 Post-Interview Update', desc: 'Update after interviews' },
  { key: 'rejection', label: '🚫 Rejection', desc: 'Declining a candidate respectfully' },
  { key: 'offer', label: '🤝 Offer Discussion', desc: 'Salary, start date, or offer details' },
  { key: 'keep-warm', label: '🔥 Keep Warm', desc: 'Maintaining relationship, no decision yet' },
  { key: 'feedback', label: '📝 Interview Feedback', desc: 'Sharing feedback with candidate' },
] as const;

/* ─────────────────────────────────────────────
   Prompt builders
   ───────────────────────────────────────────── */
function buildEmailPrompt(fields: {
  candidateName: string;
  role: string;
  stage: string;
  jd: string;
  candidateInfo: string;
  additionalContext: string;
  tone: string;
}): string {
  const stageLabel = EMAIL_STAGES.find((s) => s.key === fields.stage)?.label || fields.stage;

  return `You are an experienced recruiter at Microsoft writing candidate communication.

TASK: Write a ${stageLabel.replace(/^[^\s]+ /, '')} email.

CONTEXT:
- Candidate Name: ${fields.candidateName || '[Candidate Name]'}
- Role: ${fields.role || '[Role]'}
- Stage: ${stageLabel}
- Tone: ${fields.tone}
${fields.jd ? `\nJOB DESCRIPTION:\n${fields.jd}\n` : ''}${fields.candidateInfo ? `\nCANDIDATE BACKGROUND:\n${fields.candidateInfo}\n` : ''}${fields.additionalContext ? `\nADDITIONAL CONTEXT:\n${fields.additionalContext}\n` : ''}
REQUIREMENTS:
- Professional and warm
- Include a clear subject line
- Keep concise (under 200 words for the body)
- Include a specific call-to-action
- Personalize based on the candidate info and JD provided

OUTPUT: A ready-to-send email with subject line and body.`;
}

function buildSummaryPrompt(fields: {
  summaryType: string;
  role: string;
  content: string;
  additionalContext: string;
}): string {
  const typeInstructions: Record<string, string> = {
    'interview-notes': `Summarize the interview notes into a structured debrief.

OUTPUT FORMAT:
1. Candidate Strengths (key positives observed)
2. Concerns or Risks (areas of doubt)
3. Key Signals (hire / no-hire indicators)
4. Overall Recommendation (Strong Hire / Lean Hire / Neutral / Lean No Hire / No Hire)
5. Suggested Next Steps`,

    'pipeline': `Create a hiring pipeline status update for stakeholders.

OUTPUT FORMAT:
1. Pipeline Overview (total candidates, stages breakdown)
2. Notable Candidates (top 2–3 with brief rationale)
3. Recent Activity (interviews conducted, offers extended)
4. Risks & Blockers
5. Recommended Actions
6. Timeline Update`,

    'debrief': `Summarize the panel/debrief discussion into actionable insights.

OUTPUT FORMAT:
1. Panel Consensus (overall sentiment)
2. Strong Hire Signals
3. Major Concerns
4. Areas of Disagreement (if any)
5. Final Recommendation
6. Suggested Next Step`,

    'candidate-comparison': `Compare the candidates and provide a structured recommendation.

OUTPUT FORMAT:
1. Candidate-by-Candidate Summary (strengths, concerns)
2. Side-by-Side Comparison Table (key dimensions)
3. Overall Ranking with Rationale
4. Recommendation for Next Steps`,
  };

  return `You are an experienced recruiting strategist providing structured hiring analysis.

TASK: ${fields.summaryType === 'interview-notes' ? 'Interview Notes Summary' :
    fields.summaryType === 'pipeline' ? 'Pipeline Status Update' :
    fields.summaryType === 'debrief' ? 'Panel Debrief Summary' :
    'Candidate Comparison'}
${fields.role ? `\nROLE: ${fields.role}` : ''}

${typeInstructions[fields.summaryType] || typeInstructions['interview-notes']}

INPUT DATA:
${fields.content || '[Paste your notes / data here]'}
${fields.additionalContext ? `\nADDITIONAL CONTEXT:\n${fields.additionalContext}` : ''}
Keep the output concise, actionable, and recruiter-practical.`;
}

function buildCustomPrompt(fields: {
  description: string;
  audience: string;
  outputFormat: string;
  additionalContext: string;
}): string {
  return `You are an AI assistant helping a recruiter. Create a polished, reusable prompt based on the following request.

WHAT THE RECRUITER NEEDS:
${fields.description}

${fields.audience ? `AUDIENCE: ${fields.audience}` : ''}
${fields.outputFormat ? `DESIRED OUTPUT FORMAT: ${fields.outputFormat}` : ''}
${fields.additionalContext ? `ADDITIONAL CONTEXT:\n${fields.additionalContext}` : ''}

INSTRUCTIONS:
- Write a clear, structured prompt that a recruiter can reuse
- Include placeholder variables in [brackets] for customizable fields
- Make it specific to recruiting workflows
- Keep it practical and actionable
- Format it so it's ready to paste into an AI assistant

OUTPUT: The complete reusable prompt.`;
}

/* ─────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────── */
type GeneratorKey = 'email' | 'summary' | 'prompt-builder';

const GENERATORS: { key: GeneratorKey; icon: string; title: string; desc: string }[] = [
  { key: 'email', icon: '📧', title: 'Email Generator', desc: 'Generate tailored candidate emails based on role, stage, and context' },
  { key: 'summary', icon: '📊', title: 'Hiring Summary', desc: 'Summarize interview notes, pipeline status, or panel debriefs' },
  { key: 'prompt-builder', icon: '🔧', title: 'Custom Prompt Builder', desc: 'Describe what you need and get a polished, reusable prompt' },
];

export default function AIAssistant() {
  const [activeGenerator, setActiveGenerator] = useState<GeneratorKey>('email');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Email generator state
  const [emailFields, setEmailFields] = useState({
    candidateName: '', role: '', stage: 'outreach', jd: '', candidateInfo: '', additionalContext: '', tone: 'professional',
  });

  // Summary generator state
  const [summaryFields, setSummaryFields] = useState({
    summaryType: 'interview-notes', role: '', content: '', additionalContext: '',
  });

  // Custom prompt builder state
  const [customFields, setCustomFields] = useState({
    description: '', audience: '', outputFormat: '', additionalContext: '',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleGenerate = () => {
    let prompt = '';
    if (activeGenerator === 'email') prompt = buildEmailPrompt(emailFields);
    else if (activeGenerator === 'summary') prompt = buildSummaryPrompt(summaryFields);
    else prompt = buildCustomPrompt(customFields);
    setGeneratedPrompt(prompt);
  };

  const handleSendToCopilot = async () => {
    if (!generatedPrompt) return;
    await copyToCopilot(generatedPrompt);
    showToast('Copied & opened Copilot ✓');
  };

  const handleCopy = async () => {
    if (!generatedPrompt) return;
    await copyToClipboard(generatedPrompt);
    showToast('Copied to clipboard ✓');
  };

  const inputClass = 'input-field';
  const labelClass = 'block text-xs font-semibold text-text-secondary mb-1.5';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">🤖 AI Assistant</h1>
        <p className="text-sm text-text-secondary">
          Fill in the details below → generate an optimized prompt → send to Copilot with one click.
        </p>
      </div>

      {/* Generator picker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {GENERATORS.map((g) => (
          <button
            key={g.key}
            onClick={() => { setActiveGenerator(g.key); setGeneratedPrompt(''); }}
            className={`text-left rounded-2xl p-4 transition-all ${
              activeGenerator === g.key
                ? 'bg-white border-2 border-primary shadow-md'
                : 'card hover:border-primary/30'
            }`}
          >
            <div className="text-2xl mb-2">{g.icon}</div>
            <h3 className="font-semibold text-sm text-text-primary">{g.title}</h3>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{g.desc}</p>
          </button>
        ))}
      </div>

      {/* Two-column layout: form + preview */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Form */}
        <div className="flex-1 min-w-0">
          <div className="card p-5 sm:p-6">
            <h3 className="font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
              {GENERATORS.find((g) => g.key === activeGenerator)?.icon}
              {GENERATORS.find((g) => g.key === activeGenerator)?.title}
            </h3>

            {/* ── Email Generator Form ── */}
            {activeGenerator === 'email' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Candidate Name</label>
                    <input
                      value={emailFields.candidateName}
                      onChange={(e) => setEmailFields({ ...emailFields, candidateName: e.target.value })}
                      placeholder="e.g. Jane Chen"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Role</label>
                    <input
                      value={emailFields.role}
                      onChange={(e) => setEmailFields({ ...emailFields, role: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email Stage</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EMAIL_STAGES.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setEmailFields({ ...emailFields, stage: s.key })}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition ${
                          emailFields.stage === s.key
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-border text-text-secondary hover:border-primary/30'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Tone</label>
                  <div className="flex gap-2">
                    {['professional', 'casual', 'warm'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setEmailFields({ ...emailFields, tone: t })}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition capitalize ${
                          emailFields.tone === t
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-border text-text-secondary hover:border-primary/30'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Job Description (optional)</label>
                  <textarea
                    value={emailFields.jd}
                    onChange={(e) => setEmailFields({ ...emailFields, jd: e.target.value })}
                    placeholder="Paste key requirements from the JD..."
                    rows={3}
                    className={`${inputClass} resize-y text-[13px]`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Candidate Info (optional)</label>
                  <textarea
                    value={emailFields.candidateInfo}
                    onChange={(e) => setEmailFields({ ...emailFields, candidateInfo: e.target.value })}
                    placeholder="Paste CV highlights, LinkedIn summary, or notes..."
                    rows={3}
                    className={`${inputClass} resize-y text-[13px]`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Additional Context (optional)</label>
                  <textarea
                    value={emailFields.additionalContext}
                    onChange={(e) => setEmailFields({ ...emailFields, additionalContext: e.target.value })}
                    placeholder="Any other details — referral source, timeline, special notes..."
                    rows={2}
                    className={`${inputClass} resize-y text-[13px]`}
                  />
                </div>
              </div>
            )}

            {/* ── Hiring Summary Form ── */}
            {activeGenerator === 'summary' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Summary Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'interview-notes', label: '📝 Interview Notes', desc: 'Summarize interview feedback' },
                      { key: 'pipeline', label: '📊 Pipeline Status', desc: 'Hiring pipeline update' },
                      { key: 'debrief', label: '💬 Panel Debrief', desc: 'Summarize panel discussion' },
                      { key: 'candidate-comparison', label: '⚖️ Candidate Compare', desc: 'Compare multiple candidates' },
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => setSummaryFields({ ...summaryFields, summaryType: st.key })}
                        className={`text-left px-3 py-2.5 rounded-xl border transition ${
                          summaryFields.summaryType === st.key
                            ? 'bg-primary/10 border-primary'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="text-xs font-semibold text-text-primary">{st.label}</div>
                        <div className="text-[11px] text-text-muted">{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Role (optional)</label>
                  <input
                    value={summaryFields.role}
                    onChange={(e) => setSummaryFields({ ...summaryFields, role: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    {summaryFields.summaryType === 'interview-notes' ? 'Interview Notes' :
                     summaryFields.summaryType === 'pipeline' ? 'Pipeline Data' :
                     summaryFields.summaryType === 'debrief' ? 'Discussion Notes' :
                     'Candidate Profiles'}
                  </label>
                  <textarea
                    value={summaryFields.content}
                    onChange={(e) => setSummaryFields({ ...summaryFields, content: e.target.value })}
                    placeholder="Paste your notes, data, or profiles here..."
                    rows={8}
                    className={`${inputClass} resize-y text-[13px] font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Additional Context (optional)</label>
                  <textarea
                    value={summaryFields.additionalContext}
                    onChange={(e) => setSummaryFields({ ...summaryFields, additionalContext: e.target.value })}
                    placeholder="Hiring urgency, team preferences, special considerations..."
                    rows={2}
                    className={`${inputClass} resize-y text-[13px]`}
                  />
                </div>
              </div>
            )}

            {/* ── Custom Prompt Builder Form ── */}
            {activeGenerator === 'prompt-builder' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>What do you need? *</label>
                  <textarea
                    value={customFields.description}
                    onChange={(e) => setCustomFields({ ...customFields, description: e.target.value })}
                    placeholder="Describe what you want the AI to help with, e.g.:\n• 'Help me write a Boolean search string for sourcing data engineers'\n• 'Create a scorecard template for frontend interviews'\n• 'Draft talking points for a compensation negotiation'"
                    rows={4}
                    className={`${inputClass} resize-y text-[13px]`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Target Audience (optional)</label>
                    <input
                      value={customFields.audience}
                      onChange={(e) => setCustomFields({ ...customFields, audience: e.target.value })}
                      placeholder="e.g. Hiring Manager, Candidate"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Output Format (optional)</label>
                    <input
                      value={customFields.outputFormat}
                      onChange={(e) => setCustomFields({ ...customFields, outputFormat: e.target.value })}
                      placeholder="e.g. Bullet points, Email, Table"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Additional Context (optional)</label>
                  <textarea
                    value={customFields.additionalContext}
                    onChange={(e) => setCustomFields({ ...customFields, additionalContext: e.target.value })}
                    placeholder="Any extra details to make the prompt more specific..."
                    rows={2}
                    className={`${inputClass} resize-y text-[13px]`}
                  />
                </div>
              </div>
            )}

            {/* Generate button */}
            <div className="mt-6 flex items-center gap-3">
              <button onClick={handleGenerate} className="btn-primary px-6 py-2.5 text-sm">
                ✨ Generate Prompt
              </button>
              {generatedPrompt && (
                <span className="text-xs text-green-600 font-medium">✓ Prompt ready — see preview →</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview + Actions */}
        <div className="lg:w-[420px] shrink-0">
          <div className="card p-5 sm:p-6 sticky top-20">
            <h3 className="font-semibold text-text-primary text-sm mb-3">Generated Prompt Preview</h3>

            {generatedPrompt ? (
              <>
                <div className="bg-surface-alt rounded-xl p-4 mb-4 max-h-[400px] overflow-y-auto">
                  <pre className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-mono">
                    {generatedPrompt}
                  </pre>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={handleSendToCopilot} className="btn-primary px-5 py-2.5 text-sm w-full">
                    🤖 Send to Copilot
                  </button>
                  <button onClick={handleCopy} className="btn-secondary px-5 py-2.5 text-sm w-full">
                    📋 Copy to Clipboard
                  </button>
                </div>

                <p className="text-[11px] text-text-muted mt-3 leading-relaxed">
                  The prompt is copied to your clipboard and Copilot opens in a new tab. Just paste and go!
                </p>
              </>
            ) : (
              <div className="bg-surface-alt rounded-xl p-8 text-center">
                <div className="text-3xl mb-3 opacity-40">✨</div>
                <p className="text-sm text-text-muted">Fill in the form and click <strong>Generate Prompt</strong> to see your optimized prompt here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-primary text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-toast z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
