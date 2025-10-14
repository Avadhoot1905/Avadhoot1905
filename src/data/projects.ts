export interface Project {
  id: number
  name: string
  description: string
  techStack: string[]
  domain: "Website Development" | "App Development" | "system" | "Extension Development" | "Data Science" | "Machine Learning" | ""
  github?: string
  live?: string
}

export const projects: Project[] = [
  {
    id: 1,
    name: "Portfolio Website Developmentsite",
    description: "A responsive macOS-inspired portfolio Website Developmentsite built with Next.js and Tailwind CSS featuring dynamic theme switching and interactive UI components",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "React Icons","Redis"],
    domain: "Website Development",
    github: "https://github.com/Avadhoot1905/Avadhoot1905",
    live: "https://avadhootmahadik.os.in"
  },
  {
    id: 2,
    name: "ExamCooker",
    description: "A scalable Website Development application for exam management and preparation, built with modern development practices and collaborative workflows",
    techStack: ["Next.js", "TypeScript", "CockroachDB", "Redis", "Python", "Prisma", "FastAPI","TailwindCSS","GCP"],
    domain: "Website Development",
    github: "https://github.com/ACM-VIT/ExamCooker-2024",
    live:"https://examcooker.acmvit.in"
  },
  {
    id: 3,
    name: "Kathuria Gun House",
    description: "Full-stack e-commerce solution with payment integration, inventory management, and admin dashboard",
    techStack: ["Next.js", "TypeScript", "PostgreSQL", "CSS", "Prisma","Fuse.js","Razorpay"],
    domain: "Website Development",
    github: "https://github.com/Avadhoot1905/KGH",
    live: "https://kathuriagunhouse.com"
  },
  {
    id: 4,
    name: "iVision",
    description: "An iOS based mobile application that leverages machine learning to identify diseases in the eye in real-time using the device camera",
    techStack: ["Swift", "Python", "Torch-Vision", "TensorFlow", "CoreML"],
    domain: "App Development",
    github: "https://github.com/Avadhoot1905/iVision-App"
  },
  {
    id: 5,
    name: "Study.ai",
    description: "Study resource tool with AI integration for personalized learning paths and content recommendations",
    techStack: ["Next.js", "TypeScript", "Gemini API", "Tailwind CSS"],
    domain: "Website Development",
    github: "https://github.com/Avadhoot1905/study-resource-allocator"
  },
  {
    id: 6,
    name: "SecureLink",
    description: "Real-time chat application with WebSocket support, file sharing, and end-to-end encryption for users in the same subnet",
    techStack: ["Python"],
    domain: "system",
    github: "https://github.com/Avadhoot1905/SecureLink"
  },
  {
    id: 7,
    name: "vit-wifi-password-automator",
    description: "Wi-Fi password automator for seamless connectivity",
    techStack: ["JavaScript","Chrome Web Extensions"],
    domain: "Extension Development",
    github: "https://github.com/Avadhoot1905/vit-wifi-password-manager"
  },
  {
    id: 8,
    name: "Arch Linux Backup Server",
    description: "Cross-platform file system storage manager with advanced search and batch operations",
    techStack: ["Bash", "Arch Linux", "rsync", "Threading", "Syncthing"],
    domain: "system",
    github: "https://github.com/yourusername/file-manager"
  },
  {
    id: 9,
    name: "Financial Statement Data Scraping and Analysis of NYSE 500 Constituents",
    description: "A comprehensive tool for scraping and analyzing financial statements of NYSE 500 companies, providing insights and visualizations.",
    techStack: ["Python", "beautifulsoup4", "requests", "pandas"],
    domain: "Data Science",
    github: "https://github.com/AasaSingh05/Finance-DA"
  },
  {
    id: 10,
    name: "Habit tracker",
    description: "Habit tracking webapp with goal setting, reminders, and progress visualization",
    techStack: ["React.js", "Vue.js", "Express.js"],
    domain: "Website Development",
    github: "https://github.com/Avadhoot1905/habit-tracker"
  },
  {
    id: 11,
    name: "ReLeaf",
    description: "A government-based platform to monitor waste management and recycling, and routing effective waste truck paths",
    techStack: ["Next.js", "Drizzle ORM", "PostgreSQL", "TypeScript", "Tailwind CSS", "Clerk"],
    domain: "Website Development",
    github: "https://github.com/Avadhoot1905/ReLeaf"
  },
  {
    id: 12,
    name: "IMDB Movie Web Scrapper",
    description: "Website Development scraper for extracting movie data from IMDB with search and filtering capabilities",
    techStack: ["Python", "beautifulsoup4"],
    domain: "Data Science",
    github: "https://github.com/Avadhoot1905/Website Development-scrapper"
  },
  {
    id: 13,
    name: "VTOP Login Automator",
    description: "Automates the login process for VTOP, enhancing user convenience and efficiency.",
    techStack: ["JavaScript","Chrome Web Extensions"],
    domain: "Extension Development",
    github: "https://github.com/Avadhoot1905/vtop-password-automater"
  },
  {
    id: 14,
    name: "FoundIt",
    description: "Lost and Found Website (frontend)",
    techStack: ["Next.js"],
    domain: "Website Development",
    github: "https://github.com/AasaSingh05/Found-It"
  },
  
]
