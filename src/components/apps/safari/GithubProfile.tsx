
import {
  FaBook,
  FaCodeBranch,
  FaStar,
  FaUserFriends,
  FaBuilding,
  FaMapMarkerAlt,
} from "react-icons/fa"
import { SiGithub } from "react-icons/si"

interface GitHubRepo {
  id: number
  name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
}

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  public_repos: number
  followers: number
  following: number
  location: string
  company: string
}

interface GithubProfileProps {
  user: GitHubUser
  repos: GitHubRepo[]
  isDark: boolean
}

export function GithubProfile({ user, repos, isDark }: GithubProfileProps) {
  // GitHub specific colors
  const bgMain = isDark ? "bg-[#0d1117]" : "bg-white"
  const textMain = isDark ? "text-[#c9d1d9]" : "text-[#24292f]"
  const textMuted = isDark ? "text-[#8b949e]" : "text-[#57606a]"
  const borderMain = isDark ? "border-[#30363d]" : "border-[#d0d7de]"
  const bgCard = isDark ? "bg-[#0d1117]" : "bg-white"
  const hoverCard = isDark ? "hover:bg-[#161b22]" : "hover:bg-[#f3f4f6]"
  const linkColor = isDark ? "text-[#58a6ff]" : "text-[#0969da]"

  // Sort repos by stars
  const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6)

  return (
    <div className={`w-full min-h-full ${bgMain} ${textMain} font-sans`}>
      {/* Top Navbar (Mock) */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-2 md:py-3 border-b ${borderMain} ${isDark ? "bg-[#161b22]" : "bg-[#f6f8fa]"}`}>
        <div className="flex items-center space-x-3 md:space-x-4">
          <svg height="24" viewBox="0 0 16 16" version="1.1" width="24" className={isDark ? "fill-white" : "fill-[#24292f]"}>
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.46-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
          <div className="hidden md:flex space-x-4 text-[13px] font-semibold">
            <span>Pull requests</span>
            <span>Issues</span>
            <span>Codespaces</span>
            <span>Marketplace</span>
            <span>Explore</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="w-full md:w-[240px] shrink-0">
          <div className="flex md:flex-col items-center md:items-start gap-4">
            <img
              src={user.avatar_url}
              alt={user.name}
              className={`w-20 h-20 md:w-[240px] md:h-[240px] rounded-full border ${borderMain} z-10 relative`}
            />
            <div className="pt-2 md:pt-4">
              <h1 className="text-xl md:text-2xl font-bold leading-tight">{user.name}</h1>
              <h2 className={`text-lg font-light ${textMuted}`}>{user.login}</h2>
            </div>
          </div>

          <div className="mt-4 md:mt-6 mb-4">
            <p className="text-base">{user.bio}</p>
          </div>

          <div className="mb-4">
            <a href={`https://github.com/${user.login}`} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 w-full py-1.5 px-3 text-sm font-medium rounded-md border ${borderMain} ${isDark ? "bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9]" : "bg-[#f6f8fa] hover:bg-[#f3f4f6] text-[#24292f]"} transition-colors`}>
              <SiGithub /> View profile
            </a>
          </div>

          <div className={`flex flex-wrap items-center gap-1 text-sm ${textMuted} mb-4`}>
            <FaUserFriends className="mr-1" />
            <span className={`font-semibold ${textMain}`}>{user.followers}</span> followers
            <span className="mx-1">·</span>
            <span className={`font-semibold ${textMain}`}>{user.following}</span> following
          </div>

          <div className={`flex flex-col gap-1.5 text-sm ${textMain}`}>
            {user.company && (
              <div className="flex items-center">
                <FaBuilding className={`mr-2 ${textMuted}`} />
                <span className="font-semibold">{user.company}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center">
                <FaMapMarkerAlt className={`mr-2 ${textMuted}`} />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className={`flex overflow-x-auto border-b ${borderMain} mt-4 md:mt-0 mb-6 no-scrollbar`}>
            <nav className="flex space-x-2" aria-label="Tabs">
              <a href="#" className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 border-transparent ${textMain} hover:border-[#8b949e] hover:bg-gray-500/10 rounded-t-md transition-colors`}>
                <FaBook className={`mr-2 ${textMuted}`} />
                Overview
              </a>
              <a href="#" className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 ${isDark ? "border-[#f78166]" : "border-[#fd8c73]"} ${textMain}`}>
                <FaCodeBranch className={`mr-2 ${textMuted}`} />
                Repositories
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${isDark ? "bg-[#30363d]" : "bg-[#eff1f3]"}`}>{user.public_repos}</span>
              </a>
              <a href="#" className={`hidden sm:flex items-center px-3 py-2 text-sm font-medium border-b-2 border-transparent ${textMain} hover:border-[#8b949e] hover:bg-gray-500/10 rounded-t-md transition-colors`}>
                Projects
              </a>
              <a href="#" className={`hidden sm:flex items-center px-3 py-2 text-sm font-medium border-b-2 border-transparent ${textMain} hover:border-[#8b949e] hover:bg-gray-500/10 rounded-t-md transition-colors`}>
                Packages
              </a>
            </nav>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-normal">Pinned</h2>
          </div>

          {/* Pinned Repos Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {sortedRepos.map(repo => (
              <div key={repo.id} className={`flex flex-col p-4 rounded-md border ${borderMain} ${bgCard} ${hoverCard} transition-colors`}>
                <div className="flex items-start justify-between mb-2">
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className={`font-semibold text-sm ${linkColor} hover:underline flex items-center gap-2 break-all`}>
                    <FaBook className={`${textMuted}`} />
                    {repo.name}
                  </a>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${borderMain} ${textMuted}`}>Public</span>
                </div>
                <p className={`text-xs ${textMuted} mb-4 flex-1 line-clamp-3`}>
                  {repo.description}
                </p>
                <div className={`flex items-center gap-4 text-xs ${textMuted}`}>
                  {repo.language && (
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: getLanguageColor(repo.language) }}></span>
                      {repo.language}
                    </div>
                  )}
                  {repo.stargazers_count > 0 && (
                    <a href={`${repo.html_url}/stargazers`} target="_blank" rel="noreferrer" className="flex items-center hover:text-blue-500">
                      <FaStar className="mr-1" />
                      {repo.stargazers_count}
                    </a>
                  )}
                  {repo.forks_count > 0 && (
                    <a href={`${repo.html_url}/network/members`} target="_blank" rel="noreferrer" className="flex items-center hover:text-blue-500">
                      <FaCodeBranch className="mr-1" />
                      {repo.forks_count}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contribution Graph Placeholder (Since we can't fetch real graph easily without GitHub token) */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-normal">1,337 contributions in the last year</h2>
          </div>
          <div className={`p-4 border ${borderMain} rounded-md flex flex-col items-center justify-center min-h-[160px]`}>
            <div className="w-full flex gap-1 justify-center mb-2 overflow-hidden flex-wrap">
              {/* Fake contribution graph blocks */}
              {Array.from({ length: 300 }).map((_, i) => {
                // Stable pseudo-random based on index
                const seed = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
                let colorClass = isDark ? "bg-[#161b22]" : "bg-[#ebedf0]";
                if (seed > 0.9) colorClass = isDark ? "bg-[#39d353]" : "bg-[#216e39]";
                else if (seed > 0.75) colorClass = isDark ? "bg-[#26a641]" : "bg-[#30a14e]";
                else if (seed > 0.5) colorClass = isDark ? "bg-[#006d32]" : "bg-[#40c463]";
                else if (seed > 0.25) colorClass = isDark ? "bg-[#0e4429]" : "bg-[#9be9a8]";

                return <div key={i} className={`w-2.5 h-2.5 rounded-sm ${colorClass}`} />;
              })}
            </div>
            <div className={`w-full flex justify-between text-xs ${textMuted} mt-2 max-w-[800px]`}>
              <a href="#" className="hover:text-blue-500">Learn how we count contributions</a>
              <div className="flex items-center gap-1">
                <span>Less</span>
                <div className={`w-2.5 h-2.5 rounded-sm ${isDark ? "bg-[#161b22]" : "bg-[#ebedf0]"}`} />
                <div className={`w-2.5 h-2.5 rounded-sm ${isDark ? "bg-[#0e4429]" : "bg-[#9be9a8]"}`} />
                <div className={`w-2.5 h-2.5 rounded-sm ${isDark ? "bg-[#006d32]" : "bg-[#40c463]"}`} />
                <div className={`w-2.5 h-2.5 rounded-sm ${isDark ? "bg-[#26a641]" : "bg-[#30a14e]"}`} />
                <div className={`w-2.5 h-2.5 rounded-sm ${isDark ? "bg-[#39d353]" : "bg-[#216e39]"}`} />
                <span>More</span>
              </div>
            </div>
          </div>



        </div>
      </div>
    </div>
  )
}

function getLanguageColor(lang: string) {
  const colors: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    Java: "#b07219",
    Go: "#00ADD8",
    C: "#555555",
    "C++": "#f34b7d",
    Rust: "#dea584",
    Ruby: "#701516",
    Shell: "#89e051",
    Vue: "#41b883",
    PHP: "#4F5D95",
  }
  return colors[lang] || "#8b949e"
}
