'use client';

import { useState } from 'react';
import { copyToCopilot, copyToClipboard, openInOutlook } from '@/lib/utils';

/* ─────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────── */
const EMAIL_STAGES = [
  { key: 'outreach', label: '📨 Initial Outreach' },
  { key: 'follow-up', label: '🔄 Follow-up' },
  { key: 'scheduling', label: '📅 Interview Scheduling' },
  { key: 'post-interview', label: '💬 Post-Interview Update' },
  { key: 'next-steps', label: '✅ Next Steps Confirmation' },
  { key: 'rejection', label: '🚫 Rejection' },
  { key: 'offer', label: '🤝 Offer' },
  { key: 'keep-warm', label: '🔥 Keep Warm' },
  { key: 'feedback', label: '📝 Feedback' },
] as const;

const SUMMARY_TYPES = [
  { key: 'interview-notes', label: '📝 Interview Notes', desc: 'Summarize interview feedback' },
  { key: 'pipeline', label: '📊 Pipeline Status', desc: 'Hiring pipeline update' },
  { key: 'debrief', label: '💬 Panel Debrief', desc: 'Summarize panel discussion' },
  { key: 'candidate-comparison', label: '⚖️ Candidate Compare', desc: 'Compare multiple candidates' },
] as const;

/* ─────────────────────────────────────────────
   Tools definition
   ───────────────────────────────────────────── */
type ToolKey = 'email' | 'summary' | 'jobpost' | 'custom';

const TOOLS: { key: ToolKey; icon: string; title: string; desc: string; cta: string }[] = [
  { key: 'email', icon: '✉️', title: 'Email Generator', desc: 'Create ready-to-send recruiting emails', cta: 'Write an Email' },
  { key: 'jobpost', icon: '📝', title: 'Job Post Generator', desc: 'Create LinkedIn job posting templates', cta: 'Write a Post' },
  { key: 'summary', icon: '📊', title: 'Hiring Summary', desc: 'Summarize notes, pipeline, or debriefs', cta: 'Create Summary' },
  { key: 'custom', icon: '🔧', title: 'Custom Prompt', desc: 'Build any recruiting prompt for Copilot', cta: 'Build Prompt' },
];

/* ─────────────────────────────────────────────
   Email template generator
   ───────────────────────────────────────────── */
type EmailFields = {
  candidateName: string; role: string; stage: string; recipient: string;
  hiringManagerName: string; jd: string; candidateInfo: string; additionalContext: string; tone: string;
};

function generateEmail(f: EmailFields): { subject: string; body: string } {
  const name = f.candidateName || '[Candidate Name]';
  const role = f.role || '[Role]';
  const isHM = f.recipient === 'hiring-manager';
  const hmName = f.hiringManagerName || '[Hiring Manager]';
  const greeting = isHM ? `Hi ${hmName},` : `Hi ${name},`;
  const toneAdj = f.tone === 'casual' ? 'Hope you\'re doing well! ' :
                  f.tone === 'warm' ? 'I hope this message finds you well. ' : '';
  const jdSnippet = f.jd ? `\n\nKey highlights from the role:\n${f.jd.split('\n').slice(0, 3).map(l => `• ${l.trim()}`).join('\n')}` : '';
  const candidateSnippet = f.candidateInfo ? `\n\nCandidate background:\n${f.candidateInfo.split('\n').slice(0, 3).map(l => `• ${l.trim()}`).join('\n')}` : '';
  const ctx = f.additionalContext ? `\n\nAdditional context: ${f.additionalContext}` : '';

  const t: Record<string, Record<string, { subject: string; body: string }>> = {
    candidate: {
      outreach: { subject: `Exciting Opportunity: ${role}`, body: `${greeting}\n\n${toneAdj}I came across your profile and was really impressed by your background. I'm currently hiring for a ${role} position and believe your experience could be a great fit.${jdSnippet}\n\nWould you be open to a brief conversation to learn more? I'd love to share details and hear about what you're looking for.\n\nLooking forward to connecting!\n\nBest regards,\n[Your Name]${ctx}` },
      'follow-up': { subject: `Following Up: ${role} Opportunity`, body: `${greeting}\n\n${toneAdj}I wanted to follow up on my previous message regarding the ${role} position. I understand things can get busy, but I'd love the chance to connect.\n\nThe role is still open and your background would be an excellent match.${jdSnippet}\n\nWould you have 15–20 minutes this week for a quick chat?\n\nBest regards,\n[Your Name]${ctx}` },
      scheduling: { subject: `Interview Scheduling: ${role}`, body: `${greeting}\n\n${toneAdj}Thank you for your interest in the ${role} position! I'd like to schedule your interview.\n\nCould you share your availability for:\n• [Option 1]\n• [Option 2]\n• [Option 3]\n\nThe interview will be ~[duration] via [Teams/Phone/On-site].\n\nBest regards,\n[Your Name]${ctx}` },
      'post-interview': { subject: `Update: ${role} Interview`, body: `${greeting}\n\n${toneAdj}Thank you for interviewing for the ${role} position. The team was impressed and we're finalizing next steps.\n\nI expect to have an update by [date/timeframe]. Please reach out if you have questions.\n\nBest regards,\n[Your Name]${ctx}` },
      'next-steps': { subject: `Next Steps: ${role} Position`, body: `${greeting}\n\n${toneAdj}Thank you for your patience! I wanted to share the next steps for the ${role} position:\n\n• Next Step: [e.g. Final round interview / Team match / Offer discussion]\n• Timeline: [Expected date/timeframe]\n• What to prepare: [Any preparation needed]\n\nPlease let me know if you have any questions or need to adjust scheduling.\n\nBest regards,\n[Your Name]${ctx}` },
      rejection:{ subject: `Update on Your Application: ${role}`, body: `${greeting}\n\n${toneAdj}Thank you for your interest in the ${role} position and for the time you invested.\n\nAfter careful consideration, we've decided to move forward with another candidate. This was a difficult decision — your qualifications are impressive.\n\nI'd love to keep in touch for future opportunities.\n\nWishing you all the best,\n[Your Name]${ctx}` },
      offer: { subject: `Great News: Offer for ${role}`, body: `${greeting}\n\n${toneAdj}I'm thrilled to share that we'd like to extend an offer for the ${role} position!\n\n• Position: ${role}\n• Start Date: [Date]\n• Compensation: [Details]\n\nI'll send the formal offer letter shortly. Let me know if you have questions.\n\nCongratulations!\n[Your Name]${ctx}` },
      'keep-warm': { subject: `Checking In: ${role}`, body: `${greeting}\n\n${toneAdj}I wanted to check in — while we don't have an immediate update on the ${role} position, you're still very much on our radar.\n\nI anticipate having more to share soon. Is there anything I can answer in the meantime?\n\nBest regards,\n[Your Name]${ctx}` },
      feedback: { subject: `Interview Feedback: ${role}`, body: `${greeting}\n\n${toneAdj}Thank you for interviewing for the ${role} position. Here's some feedback:\n\nStrengths:\n• [Strength 1]\n• [Strength 2]\n\nAreas for growth:\n• [Area 1]\n\n[Next steps or encouragement].\n\nBest regards,\n[Your Name]${ctx}` },
    },
    'hiring-manager': {
      outreach: { subject: `New Candidate for ${role}: ${name}`, body: `${greeting}\n\n${toneAdj}I've identified a strong candidate for the ${role} position.${candidateSnippet}${jdSnippet}\n\nI believe they could be a great fit. Would you like me to schedule an initial screen?\n\nBest regards,\n[Your Name]${ctx}` },
      'follow-up': { subject: `Follow-Up: ${name} for ${role}`, body: `${greeting}\n\n${toneAdj}Following up on the candidate profile I shared — ${name} for ${role}.${candidateSnippet}\n\nCould you share your thoughts so I can move forward? The candidate is actively interviewing.\n\nThanks!\n[Your Name]${ctx}` },
      scheduling: { subject: `Interview Scheduling: ${name} for ${role}`, body: `${greeting}\n\n${toneAdj}I'd like to schedule an interview with ${name} for ${role}. Proposed times:\n\n• [Option 1]\n• [Option 2]\n• [Option 3]\n\nPlease share your availability and any topics you'd like to cover.\n\nBest regards,\n[Your Name]${ctx}` },
      'post-interview': { subject: `Debrief Request: ${name} for ${role}`, body: `${greeting}\n\n${toneAdj}Thank you for interviewing ${name} for ${role}.\n\nCould you share feedback on:\n• Overall impression\n• Key strengths\n• Any concerns\n• Hire recommendation\n\nI'd like to consolidate and determine next steps.\n\nBest regards,\n[Your Name]${ctx}` },
      'next-steps': { subject: `Next Steps Confirmation: ${name} for ${role}`, body: `${greeting}\n\n${toneAdj}Thank you for screening/interviewing ${name} for ${role}. I'd like to confirm the next steps.\n\nCandidate: ${name}\nPosition: ${role}${candidateSnippet}\n\nBased on your assessment, please confirm:\n• ✅ Move forward — proceed to [next round / team match / offer]\n• ⏸️ Hold — need more information (please specify)\n• ❌ Pass — not moving forward (brief reason)\n\nIf moving forward, I'll coordinate scheduling for the next stage. Please let me know your preference and any specific interviewers you'd like involved.\n\nTimeline: I'd like to move quickly as the candidate is actively interviewing elsewhere.\n\nBest regards,\n[Your Name]${ctx}` },
      rejection:{ subject: `Update: ${name} — Not Moving Forward`, body: `${greeting}\n\n${toneAdj}We've decided not to move forward with ${name} for ${role}.\n\nReason: [Brief rationale]\n\nI'm continuing to source and will share additional candidates shortly.\n\nBest regards,\n[Your Name]${ctx}` },
      offer: { subject: `Offer Approval: ${name} for ${role}`, body: `${greeting}\n\n${toneAdj}I'm preparing to extend an offer to ${name} for ${role}:\n\n• Candidate: ${name}\n• Position: ${role}\n• Proposed Compensation: [Details]\n• Proposed Start Date: [Date]\n\nPlease confirm approval so I can proceed.\n\nBest regards,\n[Your Name]${ctx}` },
      'keep-warm': { subject: `Pipeline Update: ${role}`, body: `${greeting}\n\n${toneAdj}Quick update on the ${role} pipeline:\n\n• Active candidates: [Number]\n• Interview stage: [Details]\n• Notable: ${name}${candidateSnippet}\n\nWill share updates as they develop.\n\nBest regards,\n[Your Name]${ctx}` },
      feedback: { subject: `Feedback Summary: ${name} for ${role}`, body: `${greeting}\n\n${toneAdj}Interview feedback summary for ${name} (${role}):\n\nPanel Feedback:\n• [Interviewer 1]: [Summary]\n• [Interviewer 2]: [Summary]\n\nConsensus: [Strong Hire / Lean Hire / Neutral / No Hire]\n\nStrengths:\n• [Strength 1]\n\nConcerns:\n• [Concern 1]\n\nNext Steps: [Action]\n\nBest regards,\n[Your Name]${ctx}` },
    },
  };

  const recipient = t[isHM ? 'hiring-manager' : 'candidate'];
  return recipient[f.stage] || recipient['outreach'];
}

/* ─────────────────────────────────────────────
   Prompt generators
   ───────────────────────────────────────────── */
function buildSummaryPrompt(f: { summaryType: string; role: string; content: string; additionalContext: string }): string {
  const instructions: Record<string, string> = {
    'interview-notes': 'Summarize the interview notes into a structured debrief.\n\nFORMAT:\n1. Candidate Strengths\n2. Concerns or Risks\n3. Key Signals (hire/no-hire)\n4. Overall Recommendation\n5. Suggested Next Steps',
    'pipeline': 'Create a hiring pipeline status update.\n\nFORMAT:\n1. Pipeline Overview\n2. Notable Candidates\n3. Recent Activity\n4. Risks & Blockers\n5. Recommended Actions\n6. Timeline',
    'debrief': 'Summarize the panel debrief into actionable insights.\n\nFORMAT:\n1. Panel Consensus\n2. Strong Hire Signals\n3. Major Concerns\n4. Areas of Disagreement\n5. Final Recommendation\n6. Next Steps',
    'candidate-comparison': 'Compare the candidates with a structured recommendation.\n\nFORMAT:\n1. Candidate-by-Candidate Summary\n2. Side-by-Side Comparison\n3. Overall Ranking\n4. Recommendation',
  };
  const label = SUMMARY_TYPES.find(s => s.key === f.summaryType)?.label || 'Summary';
  return `You are an experienced recruiting strategist.\n\nTASK: ${label}${f.role ? `\nROLE: ${f.role}` : ''}\n\n${instructions[f.summaryType] || instructions['interview-notes']}\n\nINPUT DATA:\n${f.content || '[Paste your notes here]'}${f.additionalContext ? `\n\nADDITIONAL CONTEXT:\n${f.additionalContext}` : ''}\n\nKeep output concise, actionable, and recruiter-practical.`;
}

function buildCustomPrompt(f: { description: string; audience: string; outputFormat: string; additionalContext: string }): string {
  return `You are an AI assistant helping a recruiter.\n\nREQUEST:\n${f.description}${f.audience ? `\n\nAUDIENCE: ${f.audience}` : ''}${f.outputFormat ? `\n\nOUTPUT FORMAT: ${f.outputFormat}` : ''}${f.additionalContext ? `\n\nCONTEXT:\n${f.additionalContext}` : ''}\n\nINSTRUCTIONS:\n- Write a clear, structured response\n- Include [bracketed] placeholders for customizable fields\n- Make it specific to recruiting workflows\n- Keep it practical and actionable`;
}

/* ─────────────────────────────────────────────
   Step indicator
   ───────────────────────────────────────────── */
function StepBadge({ num, label, active }: { num: number; label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        active ? 'bg-primary text-white' : 'bg-surface-alt text-text-muted'
      }`}>{num}</div>
      <span className="text-xs font-medium text-text-secondary">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────── */
export default function AIAssistant() {
  const [activeTool, setActiveTool] = useState<ToolKey | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const [promptResult, setPromptResult] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(false);

  const [emailFields, setEmailFields] = useState<EmailFields>({
    candidateName: '', role: '', stage: 'outreach', recipient: 'candidate',
    hiringManagerName: '', jd: '', candidateInfo: '', additionalContext: '', tone: 'professional',
  });
  const [summaryFields, setSummaryFields] = useState({ summaryType: 'interview-notes', role: '', content: '', additionalContext: '' });
  const [customFields, setCustomFields] = useState({ description: '', audience: '', outputFormat: '', additionalContext: '' });
  const [jobPostFields, setJobPostFields] = useState({ role: '', team: '', location: '', level: '', highlights: '', requirements: '', postType: 'general' });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const inputClass = 'input-field';
  const labelClass = 'block text-xs font-semibold text-text-secondary mb-1.5';

  const handleBack = () => {
    setActiveTool(null);
    setGeneratedEmail(null);
    setPromptResult('');
    setShowOptional(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* ── Hero ── */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">🤖 AI Recruiting Assistant</h1>
        <p className="text-sm text-text-secondary max-w-lg mx-auto">
          {!activeTool
            ? 'Choose a tool below to get started. Generate emails, summarize hiring data, or build custom prompts — all in seconds.'
            : TOOLS.find(t => t.key === activeTool)?.desc}
        </p>
      </div>

      {/* ═══════════════════════════════════════
          TOOL PICKER (when no tool selected)
          ═══════════════════════════════════════ */}
      {!activeTool && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {TOOLS.map((tool) => (
            <button
              key={tool.key}
              onClick={() => setActiveTool(tool.key)}
              className="card p-6 text-center hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="font-bold text-text-primary text-base mb-1">{tool.title}</h3>
              <p className="text-xs text-text-muted mb-4 leading-relaxed">{tool.desc}</p>
              <span className="btn-primary px-4 py-2 text-xs inline-block group-hover:shadow-md transition">
                {tool.cta} →
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════
          EMAIL GENERATOR
          ═══════════════════════════════════════ */}
      {activeTool === 'email' && (
        <div>
          {/* Back + Steps */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleBack} className="text-xs text-text-secondary hover:text-primary transition flex items-center gap-1">
              ← Back to tools
            </button>
            <div className="flex items-center gap-4">
              <StepBadge num={1} label="Fill details" active={!generatedEmail} />
              <div className="w-6 h-px bg-border" />
              <StepBadge num={2} label="Review & send" active={!!generatedEmail} />
            </div>
          </div>

          {!generatedEmail ? (
            /* ── Step 1: Form ── */
            <div className="card p-6 sm:p-8 max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-text-primary mb-1">✉️ Email Generator</h2>
              <p className="text-xs text-text-muted mb-6">Fill in the key details and we&apos;ll generate a ready-to-send email.</p>

              <div className="space-y-5">
                {/* Recipient */}
                <div>
                  <label className={labelClass}>Who is this email for?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['candidate', 'hiring-manager'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setEmailFields({ ...emailFields, recipient: r })}
                        className={`px-4 py-3 rounded-xl border-2 transition text-center ${
                          emailFields.recipient === r ? 'bg-primary/10 border-primary' : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="text-lg mb-1">{r === 'candidate' ? '👤' : '👔'}</div>
                        <div className="text-sm font-semibold text-text-primary">{r === 'candidate' ? 'To Candidate' : 'To Hiring Manager'}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{emailFields.recipient === 'hiring-manager' ? 'Candidate Name (re:)' : 'Candidate Name'}</label>
                    <input value={emailFields.candidateName} onChange={(e) => setEmailFields({ ...emailFields, candidateName: e.target.value })} placeholder="e.g. Jane Chen" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Role</label>
                    <input value={emailFields.role} onChange={(e) => setEmailFields({ ...emailFields, role: e.target.value })} placeholder="e.g. Senior SWE" className={inputClass} />
                  </div>
                </div>

                {/* Hiring Manager Name */}
                {emailFields.recipient === 'hiring-manager' && (
                  <div>
                    <label className={labelClass}>Hiring Manager Name</label>
                    <input value={emailFields.hiringManagerName} onChange={(e) => setEmailFields({ ...emailFields, hiringManagerName: e.target.value })} placeholder="e.g. David Lin" className={inputClass} />
                  </div>
                )}

                {/* Stage */}
                <div>
                  <label className={labelClass}>What type of email?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EMAIL_STAGES.map((s) => (
                      <button key={s.key} onClick={() => setEmailFields({ ...emailFields, stage: s.key })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition text-center ${
                          emailFields.stage === s.key ? 'bg-primary/10 border-primary text-primary' : 'border-border text-text-secondary hover:border-primary/30'
                        }`}
                      >{s.label}</button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <label className={labelClass}>Tone</label>
                  <div className="flex gap-2">
                    {['professional', 'casual', 'warm'].map((t) => (
                      <button key={t} onClick={() => setEmailFields({ ...emailFields, tone: t })}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition capitalize ${
                          emailFields.tone === t ? 'bg-primary/10 border-primary text-primary' : 'border-border text-text-secondary hover:border-primary/30'
                        }`}
                      >{t}</button>
                    ))}
                  </div>
                </div>

                {/* Optional fields toggle */}
                <button
                  onClick={() => setShowOptional(!showOptional)}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  {showOptional ? '▼' : '▶'} Add more context (JD, CV, notes) — optional
                </button>

                {showOptional && (
                  <div className="space-y-4 pl-3 border-l-2 border-primary/20">
                    <div>
                      <label className={labelClass}>Job Description</label>
                      <textarea value={emailFields.jd} onChange={(e) => setEmailFields({ ...emailFields, jd: e.target.value })}
                        placeholder="Paste key requirements from the JD..." rows={3} className={`${inputClass} resize-y text-[13px]`} />
                    </div>
                    <div>
                      <label className={labelClass}>Candidate Info</label>
                      <textarea value={emailFields.candidateInfo} onChange={(e) => setEmailFields({ ...emailFields, candidateInfo: e.target.value })}
                        placeholder="Paste CV highlights, LinkedIn summary, or notes..." rows={3} className={`${inputClass} resize-y text-[13px]`} />
                    </div>
                    <div>
                      <label className={labelClass}>Additional Notes</label>
                      <textarea value={emailFields.additionalContext} onChange={(e) => setEmailFields({ ...emailFields, additionalContext: e.target.value })}
                        placeholder="Referral source, timeline, special notes..." rows={2} className={`${inputClass} resize-y text-[13px]`} />
                    </div>
                  </div>
                )}

                {/* Generate */}
                <button
                  onClick={() => setGeneratedEmail(generateEmail(emailFields))}
                  className="btn-primary w-full py-3 text-sm font-semibold mt-2"
                >
                  ✨ Generate Email
                </button>
              </div>
            </div>
          ) : (
            /* ── Step 2: Preview & Send ── */
            <div className="max-w-2xl mx-auto">
              <div className="card p-6 sm:p-8">
                {/* Email preview styled like an actual email */}
                <div className="border border-border rounded-xl overflow-hidden mb-6">
                  <div className="bg-surface-alt px-5 py-3 border-b border-border">
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                      <span className="font-semibold">To:</span>
                      <span>{emailFields.recipient === 'hiring-manager' ? '[Hiring Manager]' : emailFields.candidateName || '[Candidate]'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-muted">Subject:</span>
                      <span className="text-sm font-semibold text-text-primary">{generatedEmail.subject}</span>
                    </div>
                  </div>
                  <div className="px-5 py-4 bg-white">
                    <pre className="text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed font-sans">{generatedEmail.body}</pre>
                  </div>
                </div>

                <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-5 font-medium">
                  💡 Tip: Replace any [bracketed text] with your actual details before sending.
                </p>

                {/* Action buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => { openInOutlook(generatedEmail.subject, generatedEmail.body); showToast('Opened in Outlook ✓'); }}
                    className="px-5 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-90" style={{ background: '#0078d4' }}
                  >
                    ✉️ Open in Outlook
                  </button>
                  <button
                    onClick={async () => { await copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`); showToast('Copied ✓'); }}
                    className="btn-secondary px-5 py-3 text-sm font-semibold"
                  >
                    📋 Copy Email
                  </button>
                  <button
                    onClick={async () => { await copyToCopilot(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`); showToast('✅ Copied! Paste (Ctrl+V) in Copilot chat'); }}
                    className="btn-ghost px-5 py-3 text-sm font-semibold"
                  >
                    🤖 Refine in Copilot
                  </button>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                  <button onClick={() => setGeneratedEmail(null)} className="text-xs text-text-secondary hover:text-primary transition">
                    ← Edit details
                  </button>
                  <button onClick={() => { setGeneratedEmail(null); setEmailFields({ ...emailFields, candidateName: '', role: '', jd: '', candidateInfo: '', additionalContext: '' }); }}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    + New email
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          HIRING SUMMARY
          ═══════════════════════════════════════ */}
      {activeTool === 'summary' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleBack} className="text-xs text-text-secondary hover:text-primary transition flex items-center gap-1">← Back to tools</button>
            <div className="flex items-center gap-4">
              <StepBadge num={1} label="Add data" active={!promptResult} />
              <div className="w-6 h-px bg-border" />
              <StepBadge num={2} label="Send to Copilot" active={!!promptResult} />
            </div>
          </div>

          {!promptResult ? (
            <div className="card p-6 sm:p-8 max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-text-primary mb-1">📊 Hiring Summary</h2>
              <p className="text-xs text-text-muted mb-6">Paste your data and we&apos;ll create a structured prompt for Copilot to analyze.</p>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>What do you want to summarize?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUMMARY_TYPES.map((st) => (
                      <button key={st.key} onClick={() => setSummaryFields({ ...summaryFields, summaryType: st.key })}
                        className={`text-left px-3 py-2.5 rounded-xl border transition ${
                          summaryFields.summaryType === st.key ? 'bg-primary/10 border-primary' : 'border-border hover:border-primary/30'
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
                  <input value={summaryFields.role} onChange={(e) => setSummaryFields({ ...summaryFields, role: e.target.value })}
                    placeholder="e.g. Senior Software Engineer" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>
                    {summaryFields.summaryType === 'interview-notes' ? 'Paste Interview Notes' :
                     summaryFields.summaryType === 'pipeline' ? 'Paste Pipeline Data' :
                     summaryFields.summaryType === 'debrief' ? 'Paste Discussion Notes' : 'Paste Candidate Profiles'}
                  </label>
                  <textarea value={summaryFields.content} onChange={(e) => setSummaryFields({ ...summaryFields, content: e.target.value })}
                    placeholder="Paste your notes, data, or profiles here..." rows={8} className={`${inputClass} resize-y text-[13px] font-mono`} />
                </div>

                <div>
                  <label className={labelClass}>Additional Context (optional)</label>
                  <textarea value={summaryFields.additionalContext} onChange={(e) => setSummaryFields({ ...summaryFields, additionalContext: e.target.value })}
                    placeholder="Hiring urgency, team preferences, special considerations..." rows={2} className={`${inputClass} resize-y text-[13px]`} />
                </div>

                <button onClick={() => setPromptResult(buildSummaryPrompt(summaryFields))} className="btn-primary w-full py-3 text-sm font-semibold">
                  ✨ Generate Summary Prompt
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="card p-6 sm:p-8">
                <div className="bg-surface-alt rounded-xl p-4 mb-5 max-h-[400px] overflow-y-auto">
                  <pre className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-mono">{promptResult}</pre>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={async () => { await copyToCopilot(promptResult); showToast('✅ Copied! Paste (Ctrl+V) in Copilot chat'); }}
                    className="btn-primary py-3 text-sm font-semibold">🤖 Send to Copilot</button>
                  <button onClick={async () => { await copyToClipboard(promptResult); showToast('Copied ✓'); }}
                    className="btn-secondary py-3 text-sm font-semibold">📋 Copy Prompt</button>
                </div>
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-border">
                  <button onClick={() => setPromptResult('')} className="text-xs text-text-secondary hover:text-primary transition">← Edit data</button>
                  <button onClick={() => { setPromptResult(''); setSummaryFields({ summaryType: 'interview-notes', role: '', content: '', additionalContext: '' }); }}
                    className="text-xs text-primary font-medium hover:underline">+ New summary</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          JOB POST GENERATOR
          ═══════════════════════════════════════ */}
      {activeTool === 'jobpost' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleBack} className="text-xs text-text-secondary hover:text-primary transition flex items-center gap-1">← Back to tools</button>
            <div className="flex items-center gap-4">
              <StepBadge num={1} label="Fill details" active={!promptResult} />
              <div className="w-6 h-px bg-border" />
              <StepBadge num={2} label="Copy & Post" active={!!promptResult} />
            </div>
          </div>

          {!promptResult ? (
            <div className="card p-6 sm:p-8 max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-text-primary mb-1">📝 Job Post Generator</h2>
              <p className="text-xs text-text-muted mb-6">Fill in the details and we&apos;ll generate a LinkedIn-ready job posting.</p>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Post Type</label>
                  <select value={jobPostFields.postType} onChange={(e) => setJobPostFields({ ...jobPostFields, postType: e.target.value })} className={inputClass}>
                    <option value="general">General Hiring Post</option>
                    <option value="intern">Internship</option>
                    <option value="campus">Campus Recruiting</option>
                    <option value="diversity">Diversity Initiative</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Role / Job Title *</label>
                    <input value={jobPostFields.role} onChange={(e) => setJobPostFields({ ...jobPostFields, role: e.target.value })}
                      placeholder="e.g. Software Engineer" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Team / Product</label>
                    <input value={jobPostFields.team} onChange={(e) => setJobPostFields({ ...jobPostFields, team: e.target.value })}
                      placeholder="e.g. Azure, Teams, Office" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Location</label>
                    <input value={jobPostFields.location} onChange={(e) => setJobPostFields({ ...jobPostFields, location: e.target.value })}
                      placeholder="e.g. Taipei / Remote / Hybrid" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Level</label>
                    <input value={jobPostFields.level} onChange={(e) => setJobPostFields({ ...jobPostFields, level: e.target.value })}
                      placeholder="e.g. L59-63, Senior" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Key Highlights / Selling Points</label>
                  <textarea value={jobPostFields.highlights} onChange={(e) => setJobPostFields({ ...jobPostFields, highlights: e.target.value })}
                    placeholder={"What makes this role/team special?\ne.g. Work on AI-powered features, great WLB, fast-growing team"}
                    rows={3} className={`${inputClass} resize-y text-[13px]`} />
                </div>

                <div>
                  <label className={labelClass}>Requirements / Qualifications</label>
                  <textarea value={jobPostFields.requirements} onChange={(e) => setJobPostFields({ ...jobPostFields, requirements: e.target.value })}
                    placeholder={"e.g. 3+ years experience, TypeScript, Python, Azure\nStrong communication skills"}
                    rows={3} className={`${inputClass} resize-y text-[13px]`} />
                </div>

                <button
                  onClick={() => {
                    const f = jobPostFields;
                    const role = f.role || '[Job Title]';
                    const team = f.team ? ` on ${f.team}` : '';
                    const location = f.location || '[Location]';
                    const level = f.level ? `\n💼 Level: ${f.level}` : '';
                    const highlights = f.highlights ? `\nWhy this role:\n${f.highlights.split('\n').map(l => `✅ ${l.trim()}`).join('\n')}` : '\nWhy this role:\n✅ [Highlight 1]\n✅ [Highlight 2]\n✅ [Highlight 3]';
                    const reqs = f.requirements ? `\nWhat we\'re looking for:\n${f.requirements.split('\n').map(l => `• ${l.trim()}`).join('\n')}` : '\nWhat we\'re looking for:\n• [Requirement 1]\n• [Requirement 2]\n• [Requirement 3]';

                    let post = '';
                    if (f.postType === 'intern') {
                      post = `🎓 Internship Alert: ${role} @ Microsoft\n\nCalling all students! 🙋‍♀️🙋‍♂️\n\nMicrosoft is looking for curious, driven interns to join us${team} in ${location}. This is your chance to work on real projects and kick-start your tech career.\n${highlights}\n${reqs}\n\n📍 Location: ${location}${level}\n\n👉 Apply now: [Link]\n📅 Deadline: [Date]\n\nKnow someone who'd be a great fit? Tag them below! 👇\n\n#MicrosoftIntern #Internship #Hiring #TechCareers`;
                    } else if (f.postType === 'campus') {
                      post = `🏫 Campus Recruiting: ${role} @ Microsoft\n\nHey students! 👋\n\nMicrosoft will be on campus for [Event: Career Fair / Info Session / Tech Talk].\n\nCome meet our team${team} and learn about opportunities in ${location}.\n${highlights}\n\n📍 Where: [Venue]\n🕐 When: [Time]\n🎁 Swag + snacks included!\n\nCan't make it? Apply online: [Link]\n\n#CampusRecruiting #Microsoft #TechCareers #NewGrad`;
                    } else if (f.postType === 'diversity') {
                      post = `🌍 We're Hiring: ${role} @ Microsoft\n\nAt Microsoft, diverse teams build better products. We're actively looking for talent from all backgrounds to join us${team}.\n\n📍 Location: ${location}${level}\n${highlights}\n${reqs}\n\nOur commitment:\n✅ Inclusive interview process\n✅ Employee Resource Groups\n✅ Mentorship programs\n✅ Equal pay for equal work\n\n📩 DM me or apply here: [Link]\n\n#DiversityInTech #InclusiveHiring #Microsoft #Hiring`;
                    } else {
                      post = `🚀 We're Hiring: ${role} @ Microsoft\n\nI'm excited to share that my team${team} is hiring!\n\n📍 Location: ${location}${level}\n${highlights}\n${reqs}\n\nWhat we offer:\n💡 Innovation — ship fast and learn faster\n🤝 Inclusive, supportive culture\n📈 Clear career growth paths\n⚖️ Work-life balance & hybrid flexibility\n\nInterested? Drop me a DM or apply here: [Link]\n\n#Hiring #${role.replace(/\s+/g, '')} #Microsoft #TechJobs #Careers`;
                    }

                    setPromptResult(post);
                  }}
                  disabled={!jobPostFields.role}
                  className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✨ Generate Post
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="card p-6 sm:p-8">
                <div className="bg-surface-alt rounded-xl p-4 mb-5 max-h-[400px] overflow-y-auto">
                  <pre className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-mono">{promptResult}</pre>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={async () => { await copyToCopilot(promptResult); showToast('✅ Copied! Paste (Ctrl+V) in Copilot chat'); }}
                    className="btn-primary py-3 text-sm font-semibold">🤖 Copilot</button>
                  <button onClick={async () => { await copyToClipboard(promptResult); showToast('Copied ✓'); }}
                    className="btn-secondary py-3 text-sm font-semibold">📋 Copy</button>
                  <button onClick={async () => { await copyToClipboard(promptResult); showToast('Copied! Paste on LinkedIn'); window.open('https://www.linkedin.com/feed/', '_blank'); }}
                    className="btn-secondary py-3 text-sm font-semibold">💼 LinkedIn</button>
                </div>
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-border">
                  <button onClick={() => setPromptResult('')} className="text-xs text-text-secondary hover:text-primary transition">← Edit details</button>
                  <button onClick={() => { setPromptResult(''); setJobPostFields({ role: '', team: '', location: '', level: '', highlights: '', requirements: '', postType: 'general' }); }}
                    className="text-xs text-primary font-medium hover:underline">+ New post</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          CUSTOM PROMPT
          ═══════════════════════════════════════ */}
      {activeTool === 'custom' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleBack} className="text-xs text-text-secondary hover:text-primary transition flex items-center gap-1">← Back to tools</button>
            <div className="flex items-center gap-4">
              <StepBadge num={1} label="Describe need" active={!promptResult} />
              <div className="w-6 h-px bg-border" />
              <StepBadge num={2} label="Send to Copilot" active={!!promptResult} />
            </div>
          </div>

          {!promptResult ? (
            <div className="card p-6 sm:p-8 max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-text-primary mb-1">🔧 Custom Prompt Builder</h2>
              <p className="text-xs text-text-muted mb-6">Describe what you need and we&apos;ll build a structured prompt for Copilot.</p>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>What do you need help with?</label>
                  <textarea value={customFields.description} onChange={(e) => setCustomFields({ ...customFields, description: e.target.value })}
                    placeholder={"e.g.:\n• Write a Boolean search string for sourcing data engineers\n• Create a scorecard template for frontend interviews\n• Draft talking points for a compensation negotiation"}
                    rows={4} className={`${inputClass} resize-y text-[13px]`} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Audience (optional)</label>
                    <input value={customFields.audience} onChange={(e) => setCustomFields({ ...customFields, audience: e.target.value })}
                      placeholder="e.g. Hiring Manager" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Output Format (optional)</label>
                    <input value={customFields.outputFormat} onChange={(e) => setCustomFields({ ...customFields, outputFormat: e.target.value })}
                      placeholder="e.g. Bullet points, Table" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Additional Context (optional)</label>
                  <textarea value={customFields.additionalContext} onChange={(e) => setCustomFields({ ...customFields, additionalContext: e.target.value })}
                    placeholder="Any extra details..." rows={2} className={`${inputClass} resize-y text-[13px]`} />
                </div>

                <button onClick={() => setPromptResult(buildCustomPrompt(customFields))} className="btn-primary w-full py-3 text-sm font-semibold">
                  ✨ Build Prompt
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="card p-6 sm:p-8">
                <div className="bg-surface-alt rounded-xl p-4 mb-5 max-h-[400px] overflow-y-auto">
                  <pre className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-mono">{promptResult}</pre>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={async () => { await copyToCopilot(promptResult); showToast('✅ Copied! Paste (Ctrl+V) in Copilot chat'); }}
                    className="btn-primary py-3 text-sm font-semibold">🤖 Send to Copilot</button>
                  <button onClick={async () => { await copyToClipboard(promptResult); showToast('Copied ✓'); }}
                    className="btn-secondary py-3 text-sm font-semibold">📋 Copy Prompt</button>
                </div>
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-border">
                  <button onClick={() => setPromptResult('')} className="text-xs text-text-secondary hover:text-primary transition">← Edit details</button>
                  <button onClick={() => { setPromptResult(''); setCustomFields({ description: '', audience: '', outputFormat: '', additionalContext: '' }); }}
                    className="text-xs text-primary font-medium hover:underline">+ New prompt</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-primary text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-toast z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
