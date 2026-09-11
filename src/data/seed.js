// Static curriculum content. Progress (done/notes) is layered on top of this
// from Supabase / localStorage, keyed by each item's `id`.

export const phases = [
  {
    id: 'p1',
    number: 1,
    title: 'Rebuild the foundations',
    weeks: [1, 2, 3],
    color: 'moss',
    blurb: 'Python, backend, and LLM app-engineering fundamentals that hold up without Copilot in the room.',
  },
  {
    id: 'p2',
    number: 2,
    title: 'Go deep on RAG',
    weeks: [4, 5, 6],
    color: 'honey',
    blurb: 'Move from "embeddings + vector DB" to being able to design and evaluate the whole retrieval pipeline.',
  },
  {
    id: 'p3',
    number: 3,
    title: 'Make agents + MCP interview-proof',
    weeks: [7, 8, 9],
    color: 'sky',
    blurb: 'Your strongest area on paper — now defensible under follow-up questions.',
  },
  {
    id: 'p4',
    number: 4,
    title: 'Ship one flagship project',
    weeks: [10, 11, 12],
    color: 'berry',
    blurb: 'One Enterprise Agent Platform, built deep rather than ten shallow demos.',
  },
]

export const weeks = [
  {
    number: 1,
    phaseId: 'p1',
    title: 'Python, for real this time',
    tasks: [
      { id: 'w1-t1', label: 'Functions, typing, and clean signatures' },
      { id: 'w1-t2', label: 'Classes, decorators, and when to reach for each' },
      { id: 'w1-t3', label: 'async/await and generators, from first principles' },
      { id: 'w1-t4', label: 'Exceptions, testing basics (pytest), and packaging' },
      { id: 'w1-t5', label: 'Start the daily discipline: 30 min Python / 30 min debugging' },
    ],
  },
  {
    number: 2,
    phaseId: 'p1',
    title: 'Backend that survives production',
    tasks: [
      { id: 'w2-t1', label: 'FastAPI basics: routes, dependency injection, pydantic models' },
      { id: 'w2-t2', label: 'REST and API design conventions' },
      { id: 'w2-t3', label: 'Auth: OAuth2 / JWT end to end' },
      { id: 'w2-t4', label: 'Async systems, queues, and caching' },
      { id: 'w2-t5', label: 'PostgreSQL fundamentals' },
    ],
  },
  {
    number: 3,
    phaseId: 'p1',
    title: 'System design + LLM app engineering',
    tasks: [
      { id: 'w3-t1', label: 'Scalability, reliability, load balancing, message queues' },
      { id: 'w3-t2', label: 'Observability and failure handling' },
      { id: 'w3-t3', label: 'Tokenization and context-window limits' },
      { id: 'w3-t4', label: 'Structured outputs and function/tool calling' },
      { id: 'w3-t5', label: 'Streaming, retries, rate limits, cost optimization, model routing, guardrails' },
    ],
  },
  {
    number: 4,
    phaseId: 'p2',
    title: 'The RAG pipeline, end to end',
    tasks: [
      { id: 'w4-t1', label: 'Draw the full pipeline from memory: parse → chunk → metadata → embed → store → retrieve → rerank → context → LLM → cite' },
      { id: 'w4-t2', label: 'Chunking strategies and their trade-offs' },
      { id: 'w4-t3', label: 'Hybrid search: combining BM25 with semantic search' },
      { id: 'w4-t4', label: 'Metadata filtering in retrieval' },
    ],
  },
  {
    number: 5,
    phaseId: 'p2',
    title: 'RAG, past the basics',
    tasks: [
      { id: 'w5-t1', label: 'Query rewriting and multi-query retrieval' },
      { id: 'w5-t2', label: 'Contextual compression and parent-child retrieval' },
      { id: 'w5-t3', label: 'GraphRAG basics — what it adds and when it earns its cost' },
      { id: 'w5-t4', label: 'Reranking models and where they sit in the pipeline' },
    ],
  },
  {
    number: 6,
    phaseId: 'p2',
    title: 'Evaluation — where "AI developers" get exposed',
    tasks: [
      { id: 'w6-t1', label: 'Precision, recall, hit rate, MRR' },
      { id: 'w6-t2', label: 'Groundedness and faithfulness' },
      { id: 'w6-t3', label: 'Answer relevance scoring' },
      { id: 'w6-t4', label: 'Build a small retrieval-eval harness on real data' },
    ],
  },
  {
    number: 7,
    phaseId: 'p3',
    title: 'Agentic patterns, cold',
    tasks: [
      { id: 'w7-t1', label: 'Explain and diagram the ReAct loop unaided' },
      { id: 'w7-t2', label: 'Workflow agents: planner → research → analyze → review → answer' },
      { id: 'w7-t3', label: 'Multi-agent supervisor pattern' },
      { id: 'w7-t4', label: 'Articulate when NOT to use a multi-agent architecture' },
    ],
  },
  {
    number: 8,
    phaseId: 'p3',
    title: 'MCP, below the framework',
    tasks: [
      { id: 'w8-t1', label: 'What problem MCP solves, and why not plain REST' },
      { id: 'w8-t2', label: 'MCP server vs. client, and how tools are exposed' },
      { id: 'w8-t3', label: 'Securing tool invocation, authorization, and handling tool failure' },
      { id: 'w8-t4', label: 'Preventing an agent from calling dangerous tools' },
      { id: 'w8-t5', label: 'Draw the client → agent → MCP client → servers architecture from memory' },
    ],
  },
  {
    number: 9,
    phaseId: 'p3',
    title: 'Synthesis and stack lock-in',
    tasks: [
      { id: 'w9-t1', label: 'Security and guardrails for autonomous agents' },
      { id: 'w9-t2', label: 'Mock-interview yourself on the full MCP + agent question list' },
      { id: 'w9-t3', label: 'Commit to one stack: Python + FastAPI + LangGraph + MCP + Postgres + a vector DB + one cloud + Docker' },
    ],
  },
  {
    number: 10,
    phaseId: 'p4',
    title: 'Flagship project — architecture',
    tasks: [
      { id: 'w10-t1', label: 'Design the Enterprise Agent Platform: gateway, planner, memory, router' },
      { id: 'w10-t2', label: 'Design the RAG / Databricks / Salesforce sub-agents' },
      { id: 'w10-t3', label: 'Stand up the repo, infra, and CI skeleton' },
    ],
  },
  {
    number: 11,
    phaseId: 'p4',
    title: 'Flagship project — build',
    tasks: [
      { id: 'w11-t1', label: 'Auth, authorization, and memory' },
      { id: 'w11-t2', label: 'RAG agent + MCP tool calling wired end to end' },
      { id: 'w11-t3', label: 'Human-approval step for sensitive actions' },
    ],
  },
  {
    number: 12,
    phaseId: 'p4',
    title: 'Flagship project — polish and ship',
    tasks: [
      { id: 'w12-t1', label: 'Tracing, evaluation hooks, retries, rate limiting, cost tracking, audit logs' },
      { id: 'w12-t2', label: 'Record a walkthrough demo' },
      { id: 'w12-t3', label: 'Resume, LinkedIn, and GitHub README rewritten around outcomes' },
    ],
  },
]

export const theoryTopics = [
  'Transformers',
  'Attention',
  'Embeddings',
  'Vector search',
  'RAG',
  'Fine-tuning',
  'LoRA',
  'Prompt engineering',
  'Tool calling',
  'Agents',
  'Evaluation',
  'Hallucination',
  'Inference',
  'Context windows',
  'Temperature & sampling',
  'Structured generation',
].map((topic, i) => ({ id: `theory-${i}`, topic }))

export const systemDesignQuestions = [
  'Design a production RAG system for 10 million documents.',
  'Design an enterprise AI assistant used by 100,000 employees.',
  'Design a multi-agent system that can safely update CRM records.',
  'Design an MCP platform for 500 tools.',
  'Design an AI coding assistant.',
  'Design a document ingestion and retrieval platform.',
].map((q, i) => ({ id: `sysd-${i}`, question: q }))

export const sysDesignFramework = [
  'Requirements', 'Constraints', 'Architecture', 'Data flow',
  'Failure modes', 'Security', 'Scaling', 'Observability', 'Cost',
]

export const storyFieldOrder = [
  ['problem', 'Problem'],
  ['constraints', 'Constraints'],
  ['decision', 'Decision'],
  ['architecture', 'Architecture'],
  ['implementation', 'Implementation'],
  ['failure', 'Failure'],
  ['result', 'Result'],
  ['change', "What I'd change"],
]

export const stories = [
  { id: 'story-1', title: 'The MCP platform', hint: 'Host platform for agents, tools, and MCP servers with multi-user workspaces and observability.' },
  { id: 'story-2', title: 'The RAG system', hint: 'Embeddings, semantic retrieval, relevance filtering, no-context safeguards.' },
  { id: 'story-3', title: 'Multi-agent analytics', hint: 'Multiple visualization types, dynamic Databricks MCP tool creation, multi-chart generation.' },
  { id: 'story-4', title: 'The Veracode Agent', hint: 'Built and published a security-analysis agent and MCP server.' },
  { id: 'story-5', title: 'The Databricks MCP tool generator', hint: 'Dynamic tool creation against Databricks.' },
  { id: 'story-6', title: 'Salesforce × React integration', hint: 'Component-based UI, deployment, headless CRM exploration.' },
  { id: 'story-7', title: 'AI funding / business impact', hint: 'A POC that secured funding for two AI-engineer headcount.' },
  { id: 'story-8', title: 'Incident analysis automation', hint: 'Whatever the concrete incident-response story is — fill it in.' },
  { id: 'story-9', title: 'A failure or mistake', hint: "Interviewers ask for this on purpose — have a real one ready." },
  { id: 'story-10', title: 'A difficult stakeholder situation', hint: 'How you navigated it, and what you would do differently.' },
]

export const positioning = {
  headline: 'AI Engineer | Agentic AI | MCP | RAG | Multi-Agent Systems | Enterprise AI',
  avoid: 'Salesforce Developer',
  titles: [
    'AI Engineer', 'GenAI Engineer', 'Agentic AI Engineer', 'AI Platform Engineer',
    'LLM Engineer', 'Applied AI Engineer', 'AI Solutions Engineer', 'Generative AI Developer',
  ],
  stack: ['Python', 'FastAPI', 'LangGraph', 'MCP', 'PostgreSQL', 'a vector DB', 'one cloud', 'Docker'],
  resumeExamples: [
    {
      weak: 'Developed multiple POCs using AI technologies.',
      strong: 'Designed and implemented an enterprise MCP orchestration platform supporting multi-user agent/tool workflows with logging, metrics, tracing, and LLM integration.',
    },
    {
      weak: 'Worked on Salesforce and some AI features.',
      strong: 'Built an agentic analytics application integrating Databricks through MCP, supporting dynamic tool creation and automated multi-chart generation from natural-language queries.',
    },
    {
      weak: 'Helped with security tooling.',
      strong: 'Built and published a Veracode MCP server and AI agent to automate security-analysis workflows.',
    },
  ],
  timeline: [
    { label: 'Month 1', detail: 'Fundamentals + interview preparation' },
    { label: 'Month 2', detail: 'Flagship project + resume + GitHub' },
    { label: 'Month 3', detail: 'Applications, aggressively — quietly network throughout' },
  ],
}
