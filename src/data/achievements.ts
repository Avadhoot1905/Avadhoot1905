export type Achievement = {
  id: string
  title: string
  date: string
  summary: string
  content: string
}

export const achievements: Achievement[] = [
  {
    id: "ai-sustainability-hackathon-winner",
    title: "Hackathon Winner — AI Sustainability Hackathon",
    date: "March 2025",
    summary: "Won 1st place for building an AI-powered waste segregation and route-optimization platform.",
    content:
      "Secured 1st place at the AI Sustainability Hackathon after developing a solution that combined computer vision with predictive routing to improve municipal waste collection efficiency.\n\nI led the engineering track, designed the model-serving pipeline, and implemented the dashboard used by the jury for real-time impact simulation. The final prototype demonstrated measurable reductions in route overlap and processing delays, and was commended for practical deployment readiness.",
  },
  {
    id: "national-web3-hackathon-top5",
    title: "Top 5 Finalist — National Level Web3 Hackathon",
    date: "November 2024",
    summary: "Ranked among top 5 teams nationally for a transparent credential-verification platform on blockchain.",
    content:
      "Selected as a Top 5 finalist out of a large national cohort at a competitive Web3 hackathon focused on real-world trust and verification systems.\n\nOur team built a credential-verification workflow using smart contracts and role-based validation, enabling institutions to issue tamper-resistant digital records with efficient audit trails. I contributed to architecture decisions, contract integration, and frontend reliability under tight submission timelines.",
  },
]
