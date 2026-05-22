export interface Idea {
  id: string;
  title: string;
  pitch: string;
  description: string;
  slopScore: number; // 1-100, higher = more slop
}

// Mock data only — no real user data (per challenge rule).
export const IDEAS: Idea[] = [
  {
    id: "1",
    title: "Quantum-AI Blockchain Synergy Platform for Web4 Productivity",
    pitch: "Revolutionary decentralized hyperplatform that 10x's cognitive output.",
    description:
      "A revolutionary Web4 metaverse-as-a-service hyperplatform that leverages quantum-powered AI and decentralized blockchain ledgers to disrupt every industry simultaneously. Our self-evolving AGI uses zero-knowledge sentiment graphs to monetize human dreams and unlock a guaranteed multi-trillion dollar total addressable market across all countries within six months. We have no competitors because we have transcended the very concept of competition itself. Our proprietary neuro-synergistic engine cross-pollinates Web3 primitives with hyperlocal edge intelligence to deliver frictionless, infinitely scalable, self-optimizing value loops that compound autonomously while you sleep. Early signals from our private beta of stakeholder vision boards indicate paradigm-defining product-market fit across every vertical we have not yet entered. We are raising a pre-seed round at a generationally favorable valuation with no team, no product, no users, and no demo — only unstoppable momentum and a whitepaper co-authored by three frontier models. Investors who hesitate will be structurally excluded from the post-scarcity economy our platform is destined to bootstrap.",
    slopScore: 97,
  },
  {
    id: "2",
    title: "Local Bakery Inventory Tracker",
    pitch: "A small offline app that helps a single bakery track daily stock.",
    description:
      "A focused mobile tool for one bakery owner to log how much flour, butter and sugar is left at end of day, and to flag when an item drops below a threshold. No accounts, no cloud, no AI. It stores data on the device and exports a weekly shopping list as plain text. The target user is the owner herself, who currently uses a paper notebook.",
    slopScore: 12,
  },
  {
    id: "3",
    title: "AI Supply Chain Oracle",
    pitch: "Machine learning that predicts inventory shortages before they happen.",
    description:
      "An AI-driven supply chain solution for mid-sized e-commerce brands that integrates into Shopify and guarantees a fifty percent revenue increase within the first month. The model is described as the smartest on the market and unlocks next-level synergy across warehouse operations, though the actual prediction methodology and the source of the revenue guarantee are not specified anywhere in the materials.",
    slopScore: 71,
  },
  {
    id: "4",
    title: "Freelance Invoice Helper",
    pitch: "Logs hours from design files and generates itemized invoices.",
    description:
      "A SaaS tool for freelance graphic designers that integrates with Adobe Creative Cloud to log hours spent on specific project files and automatically generate itemized bills. The team has a working MVP and five hundred active beta users. The pitch states the target market plainly and avoids guaranteed-return language, which is rare for this category.",
    slopScore: 28,
  },
];

export function getIdea(id: string): Idea | undefined {
  return IDEAS.find((i) => i.id === id);
}
