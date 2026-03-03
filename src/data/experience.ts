export interface Experience {
  id: number
  title: string
  organization: string
  role: string
  duration: string
  description: string
  bullets: string[]
  techStack: string[]
  location?: string
}

export const experiences: Experience[] = [
  {
    id: 1,
    title: "E-commerce Platform Engineering",
    organization: "Kathuria Gun House",
    role: "Full Stack Developer",
    duration: "August 2025 – December 2025",
    location: "Remote",
    description:
      "Built and operated a production-grade e-commerce platform with secure auth, role-based workflows, and cloud-native deployment practices.",
    bullets: [
      "Built and deployed a full-stack e-commerce platform supporting 2,000+ users, implementing secure OAuth-based authentication, role-based access control, and moderator-driven product workflows",
      "Improved system reliability and observability by containerizing the application with Docker, deploying on AWS EC2, and integrating monitoring and event pipelines using Prometheus, Grafana, and Kafka",
    ],
    techStack: ["Next.js", "PostgreSQL", "Prisma", "Docker", "AWS EC2", "Kubernetes"],
  },
  {
    id: 2,
    title: "Financial Event Processing Simulation",
    organization: "JP Morgan Chase & Co (Forage)",
    role: "Software Engineering Virtual Experience",
    duration: "December 2025",
    location: "Virtual",
    description:
      "Designed resilient event-driven backend workflows and integration-tested failure paths for consistent financial data processing.",
    bullets: [
      "Implemented a Kafka-backed Spring Boot service to process 100K+ financial events/day, ensuring transactional validation and ACID-compliant persistence for deterministic balance updates",
      "Designed idempotent REST APIs and validated failure scenarios through integration testing, ensuring consistency across message ingestion, database transactions, and external service calls.",
    ],
    techStack: ["Java", "Spring Boot", "Kafka", "REST APIs", "JPA", "H2"],
  },
  {
    id: 3,
    title: "Technical Community Leadership",
    organization: "ACM-VIT CHAPTER",
    role: "Senior Core Member",
    duration: "Apr 2024 - Present",
    location: "Vellore, Tamil Nadu, India",
    description:
      "Being a part of ACM-VIT has been one of the most transformative experiences of my college journey. This vibrant and dynamic club has not only sharpened my technical expertise but also shaped my management and organizational skills, offering me a platform to grow beyond just coding.",
    bullets: [
      "Progressed from Junior Core Committee (Apr 2024 - Mar 2025) to Senior Core Member (Mar 2025 - Present)",
      "Built scalable web applications like ExamCooker using modern development practices",
      "Gained hands-on experience with Git, GitHub, Docker, and collaborative workflows",
      "Organized and executed technical events, hackathons, and workshops",
      "Developed strong leadership, teamwork, and problem-solving skills",
      "Contributed to a vibrant community fostering innovation and mentorship",
    ],
    techStack: ["Next.js", "Docker", "Git", "GitHub", "Web Development"],
  },
]
