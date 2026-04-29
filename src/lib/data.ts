import type { Template } from './types';

const now = new Date().toISOString();
function stableId(title: string, kind: string): string {
  return 'starter-' + kind + '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function t(
  title: string,
  category: string,
  kind: 'prompt' | 'template',
  body: string,
  casualBody?: string,
  pinned = false,
  scenario: string[] = [],
): Template {
  const phase = [category.toLowerCase()];
  return {
    id: stableId(title, kind),
    title, category, kind, body, casualBody, pinned, scenario, phase,
    createdAt: now, updatedAt: now,
  };
}

export const STARTER_TEMPLATES: Template[] = [
  // ── SOURCING ──────────────────────────────────
  t('Outreach Message', 'Sourcing', 'prompt',
`Draft a concise outreach message.

Context:
- Company: Microsoft
- Role: [Job Title]
- Candidate skill: [Key Skill]

Requirements:
- Friendly but professional
- 4–6 sentences
- Invite for 20–30 min intro call`,
`Hey! Write a quick, friendly message to reach out to someone about:
- Role: [Job Title]
- Their skill: [Key Skill]
Keep it short (4–6 sentences), warm, and invite them for a casual 20-min chat.`, true, ['outreach']),

  t('Referral Outreach', 'Sourcing', 'prompt',
`Write a warm outreach message to a referral candidate.

Include:
- Mention they were referred
- Short role intro
- Invite for brief intro call

Tone: professional and appreciative.`,
undefined, false, ['outreach']),

  t('Passive Candidate Re-engagement', 'Sourcing', 'prompt',
`Write a short follow-up message to a candidate who did not proceed previously.

Goal:
- Reconnect
- Mention new opportunity
- Invite for quick conversation

Tone: friendly and low pressure.`,
undefined, false, ['outreach']),

  t('Follow-up Outreach', 'Sourcing', 'prompt',
`Write a recruiter follow-up email to a candidate who has not replied.

Requirements:
- Brief and friendly
- Mention previous outreach
- Invite quick chat
- Under 5 sentences

Inputs:
Candidate Name: [Candidate Name]
Role: [Role]

Output:
Follow-up email.`,
undefined, false, ['outreach']),

  t('Follow-up to Candidate', 'Sourcing', 'template',
`Subject: Quick Follow-up

Hi [Candidate Name],

I just wanted to follow up on my previous message regarding the [Role] opportunity with [Company]. Based on your background, I thought the role might be of interest and would be glad to share more details.

If you happen to have 20–30 minutes for a quick introduction, I'd be happy to connect.

Best regards,
[Your Name]`,
`Subject: Quick Follow-up

Hey [Candidate Name],

Just circling back on the [Role] role at [Company] — thought it could be a great fit for you! Happy to share more if you're curious.

Got 20 min for a quick chat? No pressure at all!

Cheers,
[Your Name]`, false, ['outreach']),

  // ── SCREENING ─────────────────────────────────
  t('Candidate Profile Summary', 'Screening', 'prompt',
`You are an experienced technical recruiter.

Please summarize the following candidate profile:
- Core technical expertise
- Career level estimation
- Domain or industry experience
- IC vs leadership signals
- Notable achievements
- Any risks or concerns

Candidate:
[Paste Profile]`,
undefined, false, ['candidate-eval']),

  t('Candidate vs JD Match', 'Screening', 'prompt',
`Act as a recruiter comparing a candidate with the job description.

Provide:
- Key strengths match
- Potential gaps
- Risks
- Overall fit (Strong / Moderate / Weak)
- Suggested interview focus

Candidate:
[Candidate Profile]

Job Description:
[Job Description]`,
undefined, false, ['candidate-eval']),

  t('Phone Screen Prep', 'Screening', 'prompt',
`Generate:

- 5 recruiter screening questions
- 3 deeper technical questions
- 2 clarification / risk questions

Candidate:
[Candidate Profile]

Job:
[Job Description]`,
undefined, false, ['interview-prep', 'candidate-eval']),

  // ── INTERVIEW ─────────────────────────────────
  t('Interview Notes Summary', 'Interview', 'prompt',
`Summarize interview notes.

Output:
- Candidate strengths
- Key signals
- Concerns
- Overall recommendation (lean hire / neutral / lean no hire)

Notes:
[Paste Notes]`,
undefined, false, ['interview-prep', 'candidate-eval']),

  t('Candidate Debrief', 'Interview', 'prompt',
`Summarize panel discussion.

Include:
- Overall panel sentiment
- Strong hire signals
- Major concerns
- Suggested next step

Discussion:
[Paste Notes]`,
undefined, false, ['interview-prep', 'candidate-eval']),

  t('Candidate Finished Interviews', 'Interview', 'prompt',
`You are a professional recruiter writing candidate communication.

Scenario:
The candidate has completed all interviews but the team is still interviewing other candidates.

Write an email that:
- Thanks the candidate for their time interviewing
- Acknowledges appreciation for their conversations with the team
- Explains the team is completing interviews with other candidates
- Sets expectation for when the next update may come
- Maintains a warm and professional tone
- Avoids implying hiring decisions

Inputs:
Candidate Name: [Candidate Name]
Role: [Role]
Company: [Company]
Update Timeline: [Update Timeline]

Output:
Professional candidate email.`,
undefined, false, ['interview-prep']),

  t('Interview Scheduling', 'Interview', 'prompt',
`Write a recruiter scheduling email.

Include:
- Thanking candidate for interest
- Role title
- 2–3 suggested time options
- Reminder of time zone
- Invitation to confirm availability

Inputs:
Candidate Name: [Candidate Name]
Role: [Role]
Interviewer: [Interviewer Name]
Time Options: [Time Options]

Output:
Interview scheduling email.`,
`Write a casual, friendly scheduling email. Keep it short and warm. Include:
- Role: [Role]
- Candidate: [Candidate Name]
- Interviewer: [Interviewer Name]
- Times: [Time Options]
Make it feel like a quick note, not a formal letter.`, true, ['interview-prep']),

  t('Candidate Completed Interviews (Keep Warm)', 'Interview', 'template',
`Subject: Update on Your Interview Process

Dear [Candidate Name],

Thank you again for taking the time to interview with our team and for the thoughtful conversations throughout the process. It was great learning more about your background and experience.

At this stage, the team is still completing interviews with a few other candidates and will be reviewing feedback together before finalizing next steps. We expect to have more clarity soon and will be sure to update you as soon as we have news to share.

We truly appreciate your patience and your continued interest in the opportunity.

Best regards,
[Your Name]`,
undefined, false, ['interview-prep']),

  t('Interview Scheduling', 'Interview', 'template',
`Subject: Interview Availability – [Role]

Dear [Candidate Name],

Thank you again for your interest in the [Role] opportunity.

We would like to schedule time for you to meet with [Interviewer Name]. Please let me know if any of the following times work for you:

- [Time Option 1]
- [Time Option 2]
- [Time Option 3]

(All times listed in [Time Zone].)

If these options don't work with your schedule, feel free to share a time that would be more convenient.

Best regards,
[Your Name]`,
undefined, false, ['interview-prep']),

  // ── STRATEGY ──────────────────────────────────
  t('Hiring Manager Update', 'Strategy', 'prompt',
`Draft a concise hiring update.

Include:
- Pipeline status
- Notable candidates
- Recent interviews
- Risks
- Next recruiting actions

Format: bullet points.`,
undefined, false, ['hm-communication']),

  t('Candidate Requests Feedback', 'Interview', 'prompt',
`You are a recruiter replying to a candidate who asked for interview feedback.

Write a response that:
- Thanks the candidate for their follow-up
- Acknowledges their time and interest
- Explains the hiring process is still ongoing
- Mentions feedback is usually shared once the team aligns internally
- Keeps comments high-level and avoids detailed evaluation points

Inputs:
Candidate Name: [Candidate Name]
Role: [Role]

Output:
Professional response email.`,
undefined, false, ['interview-prep']),

  t('Candidate Feedback After Rejection', 'Interview', 'prompt',
`Write a professional, candidate-facing interview feedback email.

Context:
- Candidate completed interviews and asked for feedback.
- The team appreciated the candidate's background.
- We decided to move forward with other candidates.

Feedback guidelines:
- Acknowledge strengths
- Mention that the role requires deeper hands-on experience in specific areas
- Keep feedback high-level and non-arguable
- Avoid detailed skill gaps or statements that could invite rebuttal
- Maintain a respectful, appreciative tone

Output:
A ready-to-send email to the candidate.

[Paste Interviewer Feedback]`,
undefined, false, ['interview-prep']),

  t('Reply to Candidate Requesting Feedback', 'Interview', 'template',
`Subject: Re: Interview Feedback

Dear [Candidate Name],

Thank you for following up and for your interest in the role. I'm glad to hear you found the conversations with the team valuable.

At the moment, the hiring team is still in the process of completing interviews with other candidates, and we have not yet reached the final evaluation stage. Because of that, we're not in a position to provide detailed feedback just yet.

Once the team has finished the process and aligns on next steps, I'll be sure to provide an update.

Best regards,
[Your Name]`,
undefined, false, ['interview-prep']),

  t('Rejection After Interview', 'Interview', 'template',
`Subject: Update on Your Application

Hi [Candidate Name],

Thank you again for taking the time to interview with our team and for the thoughtful conversation. We truly appreciated the opportunity to learn more about your background and experience.

The team appreciated [Experience Highlight] during the interview discussions.

For this particular role, after careful consideration, we have decided to move forward with candidates whose experience more closely aligns with the current needs of the role.

We sincerely appreciate the time and preparation you invested throughout the interview process. Thank you again for your interest in Microsoft and for connecting with our team. We wish you continued success in your career journey.

Best regards,
[Recruiter Name]`,
`Subject: Update on Your Application

Hey [Candidate Name],

Thanks so much for chatting with us — we really enjoyed getting to know you and learning about your experience, especially [Experience Highlight].

After a lot of thought, we've decided to go in a different direction for this particular role. It was a tough call, and it's definitely not a reflection of your talent.

We'd love to stay in touch for future opportunities. Wishing you all the best!

Cheers,
[Recruiter Name]`, false, ['interview-prep']),

  // ── STRATEGY (cont.) ──────────────────────────
  t('Talent Market Mapping', 'Strategy', 'prompt',
`Act as a talent intelligence analyst.

Role:
[Job Title or JD]

Identify:
- 8–10 companies with similar talent
- Common candidate titles
- Key technical skills
- Talent clusters (Taiwan / APAC)`,
`You're a talent scout. For the role [Job Title or JD], give me a quick rundown:
- Top 8-10 companies where I'd find this talent
- What titles these people usually have
- Must-have skills
- Where they're concentrated in APAC/Taiwan
Keep it conversational and actionable.`, true, ['hm-communication']),

  t('Req Strategy Meeting Preparation', 'Strategy', 'prompt',
`You are an experienced recruiting strategist.

Based on the job description below, provide quick recruiting insights for sourcing and market targeting.

<Job Description>
[Paste JD or job posting]

Country / Hiring Location
[Specify country, e.g., Taiwan]

Return answers concisely in this format:

1. Target Companies (10–15)
List companies most likely to have strong talent for this role in the specified location.

2. Sourcing Keywords
Provide 10–15 LinkedIn search keywords or job titles that would surface relevant candidates.

3. Talent Market Insights
- Is this talent pool Large / Moderate / Scarce in this market?
- What adjacent backgrounds or industries could also be strong fits?
- One key sourcing tip to reach hidden or competitive talent.

Keep insights recruiter‑practical and specific to sourcing strategy.`,
undefined, false, ['hm-communication']),

  // ── OFFER ─────────────────────────────────────
  t('Salary Expectation Misalignment', 'Offer', 'prompt',
`Write a recruiter email explaining that the candidate's salary expectations are outside the approved budget for the role.

Requirements:
- Professional and respectful
- Thank them for their time
- Explain misalignment with current budget
- Leave the door open for future opportunities

Inputs:
Candidate Name: [Candidate Name]
Role: [Role]
Company: [Company]

Output:
Professional email draft.`),

  t('Legal Name Confirmation (Taiwan)', 'Offer', 'template',
`Hi [Candidate Name],

We're excited to move forward with your offer.

For Taiwan-based hires, the offer documents must be signed using your official legal name exactly as it appears on your National Identification Card (or passport, if applicable), and the corresponding ID number.

This is a local legal requirement and ensures the employment agreement is valid and processed without delay.

Please take a moment to confirm:
• Your full legal name (as shown on your ID)
• Your National ID number (or passport number)

Once this is confirmed and reflected in the system, you'll be able to proceed with signing the offer via the official channel.

Let me know if you have any questions — happy to help.

Best regards,
[Recruiter Name]`),

  t('Salary Expectation Misalignment', 'Offer', 'template',
`Subject: Thank You for Your Time

Dear [Candidate Name],

Thank you again for taking the time to speak with us and for your interest in the [Role] opportunity.

After reviewing the expectations for the position, it appears that the compensation range for this role may not fully align with your current expectations. While we may not be able to proceed further for this particular opportunity, we truly appreciated the chance to learn more about your background.

We would be happy to stay in touch and keep you in mind for roles that may align more closely in the future.

Best regards,
[Your Name]`),

  t('Meeting Summary Generator', 'Strategy', 'prompt',
`Summarize the following meeting notes into a structured format:
1) Key Decisions Made
2) Action Items (with owners and deadlines)
3) Open Questions
4) Next Steps

Keep it concise and actionable.

[Paste Meeting Notes]`,
undefined, false, ['hm-communication']),

  t('Email Drafter', 'Strategy', 'prompt',
`Draft a professional email for the following situation: [Describe Context].

Tone: [Tone Style]
Include: clear subject line, concise body, specific call-to-action.
Keep under 200 words.`,
undefined, false, ['outreach', 'hm-communication']),
];
