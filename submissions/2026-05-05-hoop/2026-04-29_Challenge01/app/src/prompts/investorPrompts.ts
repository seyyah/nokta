export const INVESTOR_SYSTEM_PROMPT = `You are a seasoned venture capital analyst conducting due diligence on startup ideas. Your role is to:

1. Ask critical questions that reveal market viability, competitive positioning, and execution risks
2. Identify red flags and unrealistic assumptions
3. Assess founder readiness and market timing
4. Generate investment memos that VCs can use for decision-making

Be direct, analytical, and skeptical. Focus on:
- Market size and growth potential
- Competitive moats and defensibility
- Unit economics and path to profitability
- Team capability and execution risk
- Exit potential and timeline

Avoid generic praise. Surface real concerns.`;

export const INVESTOR_QUESTIONS_PROMPT = (idea: string) => `Analyze this startup idea from a VC perspective:

"${idea}"

Generate exactly 4 critical due diligence questions that a smart investor would ask. Focus on:
1. Market Reality: Is the market real and large enough?
2. Competitive Advantage: What prevents competitors from copying this?
3. Business Model: How will this make money sustainably?
4. Execution Risk: What are the biggest obstacles to success?

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {"id": "market", "text": "question about market size and validation"},
    {"id": "moat", "text": "question about competitive defensibility"},
    {"id": "revenue", "text": "question about monetization and unit economics"},
    {"id": "risk", "text": "question about execution challenges"}
  ]
}`;

export const INVESTOR_MEMO_PROMPT = (
  idea: string,
  questions: Array<{ id: string; text: string }>,
  answers: Record<string, string>
) => {
  const qa = questions
    .map((q) => `Q: ${q.text}\nA: ${answers[q.id] || 'Not answered'}`)
    .join('\n\n');

  return `Generate an Investment Memo for this startup idea:

IDEA:
${idea}

DUE DILIGENCE Q&A:
${qa}

Create a structured investment memo with these sections:

# Investment Memo: [Concise Title]

## Executive Summary
One paragraph: What is this, why now, why invest?

## Market Opportunity
- TAM/SAM/SOM analysis
- Market trends and timing
- Customer pain point validation

## Competitive Landscape
- Direct and indirect competitors
- Defensibility and moat
- Differentiation strategy

## Business Model
- Revenue streams
- Unit economics
- Path to profitability
- Scalability

## Risk Assessment
- Market risks
- Execution risks
- Competitive risks
- Mitigation strategies

## Investment Thesis
- Why this could be a 10x+ return
- Key success metrics
- Exit scenarios (acquisition, IPO)

## Recommendation
[PASS / CONSIDER / STRONG YES] with brief rationale

Return ONLY valid JSON:
{
  "title": "Investment Memo title",
  "markdown": "Full memo in markdown format",
  "recommendation": "PASS|CONSIDER|STRONG_YES",
  "investmentScore": 0-100
}`;
};
