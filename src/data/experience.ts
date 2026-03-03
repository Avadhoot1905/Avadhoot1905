export interface ExperienceRole {
  title: string
  period: string
}

export interface ExperienceSection {
  title: string
  content: string
}

export interface ExperienceItem {
  id: number
  organization: string
  locationAndDuration: string
  roles?: ExperienceRole[]
  summary?: string
  sections?: ExperienceSection[]
  highlights: string[]
  techStack?: string[]
}

export const experiences: ExperienceItem[] = [
  {
    id: 1,
    organization: "Kathuria Gun House",
    locationAndDuration: "Remote • August 2025 – December 2025",
    roles: [
      {
        title: "Full Stack Developer",
        period: "August 2025 – December 2025",
      },
    ],
    techStack: ["Next.js", "PostgreSQL", "Prisma", "Docker", "AWS EC2", "Kubernetes"],
    highlights: [
      "Built and deployed a full-stack e-commerce platform supporting 2,000+ users, implementing secure OAuth-based authentication, role-based access control, and moderator-driven product workflows",
      "Improved system reliability and observability by containerizing the application with Docker, deploying on AWS EC2, and integrating monitoring and event pipelines using Prometheus, Grafana, and Kafka",
    ],
  },
  {
    id: 2,
    organization: "JP Morgan Chase & Co (Forage)",
    locationAndDuration: "Virtual • December 2025",
    roles: [
      {
        title: "Software Engineering Virtual Experience",
        period: "December 2025",
      },
    ],
    techStack: ["Java", "Spring Boot", "Kafka", "REST APIs", "JPA", "H2"],
    highlights: [
      "Implemented a Kafka-backed Spring Boot service to process 100K+ financial events/day, ensuring transactional validation and ACID-compliant persistence for deterministic balance updates",
      "Designed idempotent REST APIs and validated failure scenarios through integration testing, ensuring consistency across message ingestion, database transactions, and external service calls.",
    ],
  },
  {
    id: 3,
    organization: "ACM-VIT CHAPTER",
    locationAndDuration: "Vellore, Tamil Nadu, India • Apr 2024 - Present · 1 yr 7 mos",
    roles: [
      {
        title: "Senior Core Member",
        period: "Mar 2025 - Present · 8 mos · Full-time · On-site",
      },
      {
        title: "Junior Core Committee",
        period: "Apr 2024 - Mar 2025 · 1 yr",
      },
    ],
    summary:
      "Being a part of ACM-VIT has been one of the most transformative experiences of my college journey. This vibrant and dynamic club has not only sharpened my technical expertise but also shaped my management and organizational skills, offering me a platform to grow beyond just coding.",
    sections: [
      {
        title: "🚀 Tech Growth & Learning",
        content:
          "Through ACM-VIT, I deepened my understanding of web development, working on impactful projects like ExamCooker, where I learned how to build scalable, efficient web applications. The hands-on exposure to Git, GitHub, Docker, and modern development practices strengthened my ability to collaborate on real-world projects. These experiences have given me a strong foundation in frontend and backend technologies, preparing me for industry-level development.",
      },
      {
        title: "👥 Event Organization & Leadership",
        content:
          "Beyond coding, ACM-VIT introduced me to event organization and management, where I played a role in planning and executing technical events, hackathons, and workshops. Handling logistics, coordinating teams, and ensuring smooth execution taught me the value of teamwork, leadership, and problem-solving in high-pressure situations.",
      },
      {
        title: "🌟 A Community Like No Other",
        content:
          "What truly sets ACM-VIT apart is the sense of belonging it provides. Unlike any other technical chapter in college, this community fosters collaboration, mentorship, and innovation, making it an inspiring space to grow alongside like-minded peers. The friendships, guidance, and challenges I encountered here have been invaluable in shaping my technical and personal journey.",
      },
    ],
    highlights: [
      "Built scalable web applications like ExamCooker using modern development practices",
      "Gained hands-on experience with Git, GitHub, Docker, and collaborative workflows",
      "Organized and executed technical events, hackathons, and workshops",
      "Developed strong leadership, teamwork, and problem-solving skills",
      "Contributed to a vibrant community fostering innovation and mentorship",
    ],
  },
]
