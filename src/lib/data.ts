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
- Company: [Company]
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

  t('Screening Disqualification — Respectful Decline', 'Screening', 'prompt',
`You are a professional recruiter writing a decline email after initial screening.

Context:
- The candidate was screened but does not meet minimum qualifications for the role.
- We want to decline respectfully while keeping the door open.

Write an email that:
- Thanks the candidate for their time and interest
- Acknowledges something positive about their background
- Explains we are moving forward with candidates whose experience more closely aligns
- Encourages them to apply for future roles
- Keeps it concise (under 150 words)

Inputs:
Candidate Name: [Candidate Name]
Role: [Role]
Positive Note: [Something positive about their background]

Output:
Professional decline email.`,
undefined, false, ['candidate-eval']),

  t('Screening Summary to Hiring Manager', 'Screening', 'prompt',
`You are a recruiter summarizing a phone screen for the hiring manager.

After screening the candidate, provide a structured summary including:
- Overall impression (1–2 sentences)
- Relevant experience highlights
- Motivation & culture fit signals
- Compensation expectations vs. budget alignment
- Availability / notice period
- Red flags or concerns (if any)
- Recruiter recommendation: Advance / Hold / Pass

Inputs:
Candidate Name: [Candidate Name]
Role: [Role]
Screen Notes: [Paste your screen notes]

Output:
Structured screening summary for hiring manager review.`,
undefined, false, ['candidate-eval', 'hm-communication']),

  t('Screening Decline — Does Not Meet Qualifications', 'Screening', 'template',
`Subject: Update on Your Application — [Role]

Dear [Candidate Name],

Thank you for taking the time to speak with me about the [Role] opportunity at [Company]. I enjoyed learning more about your background and career goals.

After careful consideration, we have decided to move forward with candidates whose experience more closely aligns with the specific requirements for this role at this time.

This is not a reflection of your abilities — we were genuinely impressed by [Positive Note]. We encourage you to keep an eye on our careers page for future opportunities that may be a stronger match.

Thank you again for your interest, and I wish you all the best in your job search.

Best regards,
[Your Name]`,
`Subject: Update on Your Application

Hey [Candidate Name],

Thanks so much for chatting with me about the [Role] role — really appreciated hearing about your experience!

After reviewing everything, we've decided to go a different direction for this one. It's not a reflection of you at all — [Positive Note] really stood out.

I'd love to keep in touch for future roles that might be a better fit. Feel free to check back anytime!

Wishing you all the best 🙌

Cheers,
[Your Name]`, false, ['candidate-eval']),

  t('Screening Summary — To Hiring Manager', 'Screening', 'template',
`Subject: Phone Screen Summary — [Candidate Name] for [Role]

Hi [Hiring Manager Name],

I completed the initial phone screen with [Candidate Name] for the [Role] position. Here's a quick summary:

📋 Overall Impression:
[1–2 sentence summary of the candidate]

✅ Strengths:
• [Strength 1]
• [Strength 2]
• [Strength 3]

⚠️ Concerns:
• [Concern 1, if any]
• [Concern 2, if any]

💰 Compensation:
• Expectation: [Candidate's expectation]
• Budget alignment: [Within range / Slightly above / Significantly above]

📅 Availability:
• Notice period: [X weeks/months]
• Preferred start: [Date]

🎯 Recruiter Recommendation: [Advance to next round / Hold / Pass]

Reasoning: [Brief explanation]

Let me know how you'd like to proceed and I'll coordinate next steps.

Best regards,
[Your Name]`,
undefined, false, ['candidate-eval', 'hm-communication']),

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

We sincerely appreciate the time and preparation you invested throughout the interview process. Thank you again for your interest and for connecting with our team. We wish you continued success in your career journey.

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

  t('Requisition Strategy Meeting Questions', 'Strategy', 'prompt',
`Please create a set of questions to focus on during the Requisition Strategy Meeting with hiring managers. The questions should be based on the information provided in the 'Goal and Discussion Points' column from the document titled 'Req Strategy Meeting Template.docx' [Upload Document]. Ensure the questions are ordered to facilitate a clear and logical flow of conversation.`,
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

  t('Offer Letter Ready for Signature', 'Offer', 'template',
`Subject: Your Offer Letter is Ready for Signature

Dear [Candidate Name],

Congratulations! We are pleased to inform you that your official offer letter has been issued and is now ready for your review and signature.

Next Steps — Please complete the following:

1. Log in to the company careers portal and navigate to the Action Center to access your offer letter.
2. Review the offer letter carefully, including your role, compensation, start date, and other terms.
3. Sign the offer letter using your official full legal name (as it appears on your government-issued ID).
4. Provide your National ID number in the designated field (if required for your country).

If you have any questions or experience any issues accessing the portal, please don't hesitate to reach out to me directly.

We are very excited to welcome you to the team and look forward to your acceptance!

[Sender Name]
[Sender Position Title]`, undefined, false, ['outreach']),

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

  t('Talent Market Deep Dive — Single Domain', 'Strategy', 'prompt',
`You are a talent intelligence analyst helping a recruiter understand a specialized technical field.

Domain / Technology: [e.g., Liquid Cooling, AI Chip Design, Quantum Computing, Edge AI, etc.]

Provide a comprehensive talent market overview:

1. **Industry Landscape**
   - What companies are leading in this space? (Top 10–15 globally)
   - Which are headquartered or have R&D centers in [Region, e.g., Taiwan / APAC]?
   - Are there startups disrupting this space?

2. **Talent Profile**
   - Common job titles for professionals in this field
   - Typical educational background (degrees, specializations)
   - Key technical skills and certifications
   - Career path — where do these professionals come from and where do they go?

3. **Market Dynamics**
   - Talent pool size: Large / Moderate / Scarce
   - Demand trend: Growing / Stable / Declining
   - Average tenure at companies in this space
   - Compensation benchmarks (if available for region)

4. **Sourcing Strategy**
   - Best channels to find this talent (conferences, communities, publications, LinkedIn groups)
   - Keywords and Boolean strings for LinkedIn search
   - Adjacent industries or roles that could be a talent bridge
   - What attracts these professionals to new opportunities?

5. **Competitive Intelligence**
   - Who else is hiring aggressively in this space?
   - What differentiators can we offer vs. competitors?

Keep insights actionable and recruiter-practical.`,
`You're my talent research buddy. I need to understand the talent market for [Domain / Technology, e.g., Liquid Cooling].

Give me the quick rundown:
- Who are the top companies in this space? (especially in [Region])
- What do these people's profiles look like? (titles, skills, background)
- Is this talent pool big or tiny?
- Where do I find them? (communities, events, keywords)
- Who's competing with us for this talent?

Keep it practical — I need to source from this tomorrow.`, true, ['hm-communication']),

  t('Emerging Tech Field — Recruiter Briefing', 'Strategy', 'prompt',
`You are a technology analyst preparing a recruiter briefing on an emerging technical field.

Field: [e.g., Immersion Cooling, Neuromorphic Computing, Synthetic Biology, AR/VR Hardware, etc.]

Create a recruiter-friendly briefing that covers:

1. **What is it?** (Explain in plain language — assume no technical background)
   - What problem does it solve?
   - Why is it important now?
   - Real-world applications

2. **Key Players & Ecosystem**
   - Major companies investing in this (tech giants + specialists)
   - Notable research labs and universities
   - Industry consortiums or standards bodies
   - Key conferences and publications

3. **Talent Landscape**
   - What roles exist in this field? (engineering, research, product, operations)
   - What's the typical background? (PhD required? Industry crossover possible?)
   - Estimated global talent pool size
   - Geographic clusters (where do these people live?)

4. **Recruiter Talking Points**
   - How to explain this field to a hiring manager in 2 sentences
   - How to pitch our opportunity to candidates in this space
   - Common candidate motivations and concerns
   - Red flags to watch for in profiles

5. **Search Strategy**
   - LinkedIn Boolean search strings (3–5 variations)
   - GitHub / patent / publication search tips
   - Professional communities to tap into
   - Adjacent talent pools to consider

Output should be comprehensive yet scannable — use bullet points and headers.`,
undefined, false, ['hm-communication']),

  t('Talent Market Insights — Sharing with Hiring Manager', 'Strategy', 'template',
`Subject: Talent Market Insights — [Domain/Field] in [Region]

Hi [Hiring Manager Name],

As we kick off sourcing for the [Role] position, I wanted to share some market intelligence on the [Domain/Field] talent landscape to help align our expectations and strategy.

📊 Market Overview:
• Talent pool size in [Region]: [Estimate — e.g., ~500 professionals in Taiwan]
• Demand level: [High / Moderate] — [X] companies actively hiring in this space
• Avg. tenure: [X] years (indicates [high/low] willingness to move)

🏢 Key Talent Sources (Companies):
• [Company 1] — [why relevant, e.g., largest team in Taiwan]
• [Company 2] — [context]
• [Company 3] — [context]
• [Company 4–5] — [context]

🎯 Candidate Profile Insights:
• Typical titles: [Title 1], [Title 2], [Title 3]
• Common background: [Degree/field], [Years of experience]
• Must-have skills: [Skill 1], [Skill 2]
• What they care about: [e.g., cutting-edge projects, work-life balance, leadership opportunities]

⚡ Competitive Landscape:
• [Competitor 1] is aggressively hiring — offering [differentiator]
• [Competitor 2] recently opened a [Region] office
• Our advantage: [What we can offer that others can't]

💡 Recommended Approach:
1. [Strategy 1 — e.g., Target passive candidates from Company X]
2. [Strategy 2 — e.g., Leverage conference network from Event Y]
3. [Strategy 3 — e.g., Consider adjacent profiles from Field Z]

⚠️ Expectations to Align:
• This is a [scarce/moderate] talent pool — typical time-to-fill: [X weeks]
• Compensation expectations may be [above/within/below] our range
• [Any other alignment needed]

Happy to discuss further — would a 15-min sync be helpful this week?

Best regards,
[Your Name]`,
undefined, false, ['hm-communication']),

  t('Domain Research Summary — Internal Brief', 'Strategy', 'template',
`Subject: Talent Intelligence Brief — [Field/Technology]

Team,

Here's a quick research summary on the [Field/Technology] talent space to support our hiring efforts.

🔬 What is [Field/Technology]?
[2–3 sentence plain-language explanation of the domain and why it matters]

🌍 Industry Landscape:
| Company | HQ | Relevance | Est. Team Size |
|---------|-----|-----------|----------------|
| [Company 1] | [Location] | [Context] | [~Size] |
| [Company 2] | [Location] | [Context] | [~Size] |
| [Company 3] | [Location] | [Context] | [~Size] |
| [Company 4] | [Location] | [Context] | [~Size] |
| [Company 5] | [Location] | [Context] | [~Size] |

👤 Typical Candidate Profile:
• Title: [Common titles]
• Education: [Typical degrees — e.g., MS/PhD in Mechanical Engineering, Thermal Science]
• Experience: [X–Y years]
• Key skills: [Skill 1], [Skill 2], [Skill 3], [Skill 4]
• Certifications: [If applicable]

🔍 Sourcing Channels:
• LinkedIn keywords: "[Keyword 1]" OR "[Keyword 2]" OR "[Keyword 3]"
• Conferences: [Conference 1], [Conference 2]
• Communities: [Online forum, Slack group, etc.]
• Publications: [Journal or blog to monitor]

📈 Market Dynamics:
• Pool availability in [Region]: [Scarce / Moderate / Available]
• Demand trend: [Growing rapidly / Steady / Emerging]
• Avg. comp range: [Range if known]
• Typical notice period: [X months]

📌 Key Takeaways:
1. [Insight 1]
2. [Insight 2]
3. [Insight 3]

Let me know if you'd like me to dig deeper into any area.

[Your Name]`,
undefined, false, ['hm-communication']),

  // ── NEXT STEPS / HM FOLLOW-UP ──────────────────────────────────
  t('Next Steps Confirmation — After Screen', 'Interview', 'template',
`Subject: Next Steps — [Candidate Name] for [Role]

Hi [Hiring Manager Name],

Thank you for taking the time to screen [Candidate Name] for the [Role] position. I'd like to confirm the next steps based on your assessment.

Candidate: [Candidate Name]
Position: [Role]
Interview completed: [Date]

Please confirm your recommendation:
• ✅ Move forward — proceed to [next round / onsite / team match]
• ⏸️ Hold — need more information (please specify)
• ❌ Pass — not moving forward

If moving forward:
• Suggested next step: [Technical interview / Hiring manager loop / Team match]
• Preferred timeline: [ASAP / Within 1 week / Flexible]
• Any specific interviewers you'd like involved?

Note: The candidate mentioned they are actively interviewing with other companies, so I'd recommend we move quickly if interested.

Please let me know and I'll coordinate scheduling.

Best regards,
[Your Name]`,
undefined, false, ['hm-communication']),

  t('Post-Interview Next Steps — To Hiring Manager', 'Interview', 'template',
`Subject: Debrief & Next Steps — [Candidate Name] for [Role]

Hi [Hiring Manager Name],

[Candidate Name] has completed [interview type] for the [Role] position. I wanted to follow up to align on next steps.

Interview Summary:
• Date: [Date]
• Interviewers: [Names]
• Format: [Phone / Video / Onsite]

Questions for you:
1. What is your overall assessment of the candidate?
2. Do you recommend moving forward to the next stage?
3. Are there any concerns we should address before proceeding?
4. If yes, what should the next step be? (e.g., additional interview, team match, offer discussion)

Timeline consideration: [Candidate is evaluating other offers / has a deadline / is flexible]

I'll consolidate all feedback and prepare the next steps once I hear back from you.

Thank you!
[Your Name]`,
undefined, false, ['hm-communication']),

  // ── RECRUITING 文案 (Job Posting Copywriting) ──────────────────────────────────
  t('Software Engineer — LinkedIn Post', 'Sourcing', 'prompt',
`🚀 We're Hiring: Software Engineer @ [Company]

Are you passionate about building products that empower millions of people worldwide?

We're looking for a Software Engineer to join our team in [Location/Remote]. You'll work on [Product/Team] — designing, building, and shipping features that make a real impact.

What you'll do:
• Build scalable services and delightful user experiences
• Collaborate with cross-functional teams (PM, Design, Data Science)
• Own your features end-to-end — from architecture to production

What we're looking for:
• Strong CS fundamentals & coding skills
• Experience with [Tech Stack, e.g., C#, TypeScript, Python, Azure]
• A growth mindset and passion for learning

Why [Company]?
✅ Inclusive culture where you can be yourself
✅ Competitive compensation & benefits
✅ Hybrid flexibility & work-life balance
✅ Career growth & learning resources

📩 Interested? Drop me a DM or apply here: [Link]

#Hiring #SoftwareEngineer #TechJobs #Careers`,
undefined, false, ['outreach', 'job-post']),

  t('Internship Opportunity — LinkedIn Post', 'Sourcing', 'prompt',
`🎓 Internship Alert: [Company] [Year] Summer Internship

Calling all students! 🙋‍♀️🙋‍♂️

[Company] is looking for curious, driven interns to join us this summer in [Location]. This is your chance to work on real projects, learn from world-class engineers, and kick-start your tech career.

What to expect:
• A meaningful project with real business impact
• Mentorship from experienced engineers & leaders
• Fun intern events, networking, and community
• Competitive pay + housing assistance

Who should apply:
• Currently pursuing a Bachelor's/Master's in CS, EE, or related field
• Graduating between [Date Range]
• Passionate about technology and problem-solving

We welcome students from all backgrounds — diversity makes us stronger 🌈

👉 Apply now: [Link]
📅 Application deadline: [Date]

Know someone who'd be a great fit? Tag them below! 👇

#Internship #TechInternship #Students #Hiring`,
undefined, false, ['outreach', 'job-post']),

  t('General Role Posting — LinkedIn Post', 'Sourcing', 'prompt',
`📢 Open Role: [Job Title] @ [Company]

I'm excited to share that my team is hiring a [Job Title]!

About the role:
We're looking for someone who [brief description of what the role does and why it matters]. You'll be part of [Team/Org] working on [Product/Mission].

Key responsibilities:
• [Responsibility 1]
• [Responsibility 2]
• [Responsibility 3]

Ideal candidate:
• [X] years of experience in [Field]
• Strong skills in [Skill 1], [Skill 2]
• Excellent communication and collaboration

What makes this team special:
💡 Innovation — we ship fast and learn faster
🤝 Culture — supportive, inclusive, and fun
📈 Growth — clear career paths and development opportunities

📍 Location: [City] / Hybrid / Remote
💼 Level: [Level Range]

If this sounds like you (or someone you know), let's connect!
Apply here: [Link]

#OpenToWork #Hiring #[JobTitle] #Careers`,
undefined, false, ['outreach', 'job-post']),

  t('Campus Recruiting — LinkedIn Post', 'Sourcing', 'prompt',
`🏫 Campus Recruiting Season is Here!

Hey [University Name] students! 👋

[Company] will be on campus [Date] for [Event: Career Fair / Info Session / Tech Talk].

Come meet our team, learn about full-time & internship opportunities, and see what it's like to build technology that changes the world.

📍 Where: [Venue]
🕐 When: [Time]
🎁 Swag + snacks included!

Roles we're hiring for:
• Software Engineer
• Product Manager
• Data Scientist
• UX Designer
• And more!

No appointment needed — just show up and say hi! 🙌

Can't make it? You can still apply online: [Link]

See you there! 👀

#CampusRecruiting #[UniversityName] #TechCareers #NewGrad`,
undefined, false, ['outreach', 'job-post']),

  t('Diversity Hiring Initiative — LinkedIn Post', 'Sourcing', 'prompt',
`🌍 Diversity in Tech Starts with Intentional Hiring

At [Company], we believe diverse teams build better products. That's why we're committed to creating opportunities for underrepresented talent in tech.

We're actively hiring for multiple roles across engineering, design, and product — and we want to hear from YOU.

🙋 Whether you're:
• A career changer breaking into tech
• A bootcamp grad looking for your first opportunity
• A professional from a non-traditional background

We see your potential and value your unique perspective.

Open roles include:
• [Role 1]
• [Role 2]
• [Role 3]

Our commitment to you:
✅ Inclusive interview process
✅ Employee Resource Groups (ERGs)
✅ Mentorship programs
✅ Equal pay for equal work

📩 DM me or apply here: [Link]

Let's build a future that represents everyone. 🤝

#DiversityInTech #InclusiveHiring #TechForAll #Hiring`,
undefined, false, ['outreach', 'job-post']),
];
