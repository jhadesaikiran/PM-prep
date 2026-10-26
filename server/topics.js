// Interview topics. `guide` steers the interviewer; `rubric` drives the post-interview analysis.
export const TOPICS = [
  {
    id: 'product-sense',
    name: 'Product sense',
    description: 'Design or improve a product for a set of users.',
    guide:
      'Product design / improvement case. Expect clarifying questions, user segmentation, prioritised pain points, multiple solutions, trade-offs, a recommendation and success metrics.',
    rubric: ['Clarification and scoping', 'User segmentation', 'Pain point prioritisation', 'Solution creativity', 'Trade-offs and prioritisation', 'Success metrics', 'Communication'],
  },
  {
    id: 'metrics',
    name: 'Metrics',
    description: 'Define success, pick a North Star, set guardrails.',
    guide:
      'Metrics / success-measurement case. Expect product goal first, user journey, a North Star with justification, supporting and guardrail metrics, and how to act on them.',
    rubric: ['Goal and context', 'User journey coverage', 'North Star choice', 'Supporting and guardrail metrics', 'Trade-offs and pitfalls', 'Communication'],
  },
  {
    id: 'rca',
    name: 'Root cause analysis',
    description: 'A metric moved. Find out why.',
    guide:
      'Root cause analysis case (e.g. "DAU dropped 10%"). Hold back facts and reveal them only when the candidate asks the right questions. Expect clarifying the metric, internal vs external factors, segmentation, hypotheses, and a plan to validate and fix.',
    rubric: ['Clarifying the metric', 'Structured hypothesis tree', 'Internal vs external factors', 'Data and segmentation asks', 'Reaching the root cause', 'Next steps', 'Communication'],
  },
  {
    id: 'guesstimates',
    name: 'Guesstimates',
    description: 'Market sizing and estimation.',
    guide:
      'Guesstimate / market sizing. Expect clarifying scope, a stated approach (top-down or bottom-up), explicit assumptions, clean arithmetic, a sanity check and a final number.',
    rubric: ['Clarifying scope', 'Approach and structure', 'Quality of assumptions', 'Arithmetic accuracy', 'Sanity check', 'Communication'],
  },
  {
    id: 'product-critique',
    name: 'Product critique',
    description: 'Favourite product, or critique an existing one.',
    guide:
      'Product critique ("favourite product" or "critique app X"). Expect who it is for, the job it does, what works and why, what does not, concrete improvements and how to measure them.',
    rubric: ['Target user and job to be done', 'Depth of analysis', 'What works and why', 'Gaps identified', 'Quality of improvements', 'Communication'],
  },
  {
    id: 'gtm',
    name: 'Go-to-market',
    description: 'Launch a product: segments, positioning, channels, pricing.',
    guide:
      'Go-to-market case. Expect goal of the launch, target segment and ICP, positioning, pricing, channels, launch sequencing, risks and success metrics.',
    rubric: ['Launch goal', 'Target segment and ICP', 'Positioning and value prop', 'Pricing', 'Channels and sequencing', 'Metrics and risks', 'Communication'],
  },
  {
    id: 'strategy',
    name: 'Strategy',
    description: 'Enter a market, respond to a competitor, build vs buy.',
    guide:
      'Product / business strategy case. Expect clarifying the objective, market and competitive analysis, company strengths, options with trade-offs, a clear recommendation, risks and how to measure it.',
    rubric: ['Clarifying the objective', 'Market and competitor analysis', 'Company strengths and fit', 'Options and trade-offs', 'Recommendation clarity', 'Risks and metrics', 'Communication'],
  },
  {
    id: 'behavioral',
    name: 'Behavioral',
    description: 'Past experience, leadership, conflict, failure.',
    guide:
      'Behavioral interview for a PM with about 4 years of experience. Expect STAR-structured stories with specific actions, the candidate\'s own role, measurable results and reflection. Probe for detail and ownership.',
    rubric: ['Story structure (STAR)', 'Ownership and specific actions', 'Impact and results', 'Reflection and learning', 'Communication'],
  },
];

export const topicById = (id) => TOPICS.find((t) => t.id === id);
