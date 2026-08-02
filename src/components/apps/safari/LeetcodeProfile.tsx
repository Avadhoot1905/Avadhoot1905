import React from "react"
import { SiLeetcode } from "react-icons/si"
import { FaCheckCircle, FaStar, FaEye, FaComments, FaFire } from "react-icons/fa"

interface LeetCodeStats {
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  ranking: number
  contributionPoints?: number
}

interface LeetCodeSubmission {
  title: string
  titleSlug: string
  timestamp: string
  statusDisplay: string
  lang: string
}

interface LeetcodeProfileProps {
  stats: LeetCodeStats
  submissions: LeetCodeSubmission[]
  isDark: boolean
}

export function LeetcodeProfile({ stats, submissions, isDark }: LeetcodeProfileProps) {
  const bgMain = isDark ? "bg-[#1a1a1a]" : "bg-[#f7f8fa]"
  const bgCard = isDark ? "bg-[#282828]" : "bg-white"
  const textMain = isDark ? "text-white" : "text-[#262626]"
  const textMuted = isDark ? "text-[#8c8c8c]" : "text-[#8c8c8c]"
  const borderMain = isDark ? "border-[#404040]" : "border-[#f0f0f0]"
  
  // Percentages for the circular progress (assuming out of ~3000 total problems on LC)
  const totalLc = 3100
  const easyLc = 800
  const mediumLc = 1600
  const hardLc = 700

  return (
    <div className={`w-full min-h-full ${bgMain} font-sans pb-10`}>
      {/* Navbar */}
      <div className={`h-[40px] md:h-[44px] w-full ${isDark ? "bg-[#282828]" : "bg-white"} border-b ${borderMain} flex items-center justify-center px-4`}>
        <div className="w-full max-w-[1200px] flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 cursor-pointer">
              <SiLeetcode className="text-[#ffa116] text-[20px]" />
              <span className={`font-semibold ${textMain} text-[14px] md:text-[15px] hidden sm:block`}>LeetCode</span>
            </div>
            <div className={`hidden md:flex items-center gap-4 md:gap-6 text-[13px] ${textMuted}`}>
              <span className="hover:text-[#ffa116] cursor-pointer transition-colors">Explore</span>
              <span className={`text-[#ffa116] font-semibold cursor-pointer`}>Problems</span>
              <span className="hover:text-[#ffa116] cursor-pointer transition-colors">Contest</span>
              <span className="hover:text-[#ffa116] cursor-pointer transition-colors">Discuss</span>
              <span className="hover:text-[#ffa116] cursor-pointer transition-colors">Interview</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className={`px-3 py-1 rounded-full ${isDark ? "bg-[#404040]" : "bg-[#f0f0f0]"} ${textMain} text-[13px] flex items-center gap-2 cursor-pointer hover:opacity-80`}>
                <FaFire className="text-[#ffa116]" />
                <span>0</span>
             </div>
             <div className="w-[28px] h-[28px] rounded-full overflow-hidden bg-gray-300">
                <img src="/favicon.ico" alt="Profile" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1200px] mx-auto mt-6 px-4 flex flex-col lg:flex-row gap-4">
        
        {/* Left Column: Profile Card */}
        <div className="w-full lg:w-[260px] shrink-0 flex flex-col gap-3 md:gap-4">
          <div className={`${bgCard} rounded-lg p-4 md:p-5 shadow-sm border ${borderMain}`}>
            <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="w-[64px] h-[64px] md:w-[82px] md:h-[82px] rounded-lg overflow-hidden shrink-0">
                <img src="/favicon.ico" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h1 className={`text-[18px] md:text-[20px] font-semibold ${textMain}`}>Avadhoot Mahadik</h1>
                <p className={`text-[12px] md:text-[13px] ${textMuted}`}>arcsmo19</p>
                <div className="mt-1 flex items-center gap-1 text-[12px] md:text-[13px] text-[#ffa116] font-medium">
                   <span>Rank ~{stats.ranking > 0 ? stats.ranking.toLocaleString() : "100,000"}</span>
                </div>
              </div>
            </div>
            <a href="https://leetcode.com/u/arcsmo19/" target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 w-full py-1.5 rounded-md ${isDark ? "bg-[#333333] hover:bg-[#404040]" : "bg-[#f2f3f4] hover:bg-[#e5e5e5]"} ${isDark ? "text-[#2cbb5d]" : "text-[#2cbb5d]"} text-[13px] md:text-[14px] font-medium transition-colors mb-4`}>
              <SiLeetcode className="text-[#ffa116]" /> View Profile
            </a>
            <div className={`flex flex-col gap-3 pt-4 border-t ${borderMain}`}>
               <div className="flex justify-between items-center text-[12px] md:text-[13px]">
                  <div className={`flex items-center gap-2 ${textMuted}`}><FaEye /> Views</div>
                  <div className={`font-medium ${textMain}`}>0</div>
               </div>
               <div className="flex justify-between items-center text-[12px] md:text-[13px]">
                  <div className={`flex items-center gap-2 ${textMuted}`}><FaCheckCircle /> Solution</div>
                  <div className={`font-medium ${textMain}`}>0</div>
               </div>
               <div className="flex justify-between items-center text-[12px] md:text-[13px]">
                  <div className={`flex items-center gap-2 ${textMuted}`}><FaComments /> Discuss</div>
                  <div className={`font-medium ${textMain}`}>0</div>
               </div>
               <div className="flex justify-between items-center text-[12px] md:text-[13px]">
                  <div className={`flex items-center gap-2 ${textMuted}`}><FaStar /> Reputation</div>
                  <div className={`font-medium ${textMain}`}>0</div>
               </div>
            </div>
          </div>

          <div className={`${bgCard} rounded-lg p-4 md:p-5 border ${borderMain}`}>
             <h2 className={`text-[14px] md:text-[16px] font-medium ${textMain} mb-4`}>Badges</h2>
             <div className={`flex items-center justify-center h-[80px] text-[13px] ${textMuted}`}>
                Locked badges
             </div>
          </div>
        </div>

        {/* Right Column: Stats & Submissions */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 md:gap-4">
          
          {/* Top Row: Solved Problems & Badges/Info */}
          <div className="flex flex-col md:flex-row gap-4">
             {/* Solved Problems Block */}
             <div className={`${bgCard} rounded-lg p-4 md:p-6 shadow-sm border ${borderMain} flex-1`}>
                <h2 className={`text-[15px] font-medium ${textMain} mb-4`}>Solved Problems</h2>
                <div className="flex items-center gap-8">
                   {/* Circular Progress Mock */}
                   <div className="relative w-[100px] h-[100px] flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90">
                         <circle cx="50" cy="50" r="46" fill="none" stroke={isDark ? "#404040" : "#f0f0f0"} strokeWidth="4" />
                         <circle cx="50" cy="50" r="46" fill="none" stroke="#ffa116" strokeWidth="4" strokeDasharray="289" strokeDashoffset={289 - (289 * (stats.totalSolved / totalLc))} className="transition-all duration-1000 ease-out" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className={`text-[24px] font-semibold ${textMain}`}>{stats.totalSolved}</span>
                         <span className={`text-[12px] ${textMuted}`}>Solved</span>
                      </div>
                   </div>
                   
                   {/* Breakdown */}
                   <div className="flex-1 flex flex-col gap-3">
                      <div className="flex flex-col">
                         <div className="flex justify-between text-[13px] mb-1">
                            <span className="text-[#00b8a3]">Easy</span>
                            <span className={`${textMain} font-medium`}>{stats.easySolved} <span className={textMuted}>/{easyLc}</span></span>
                         </div>
                         <div className={`w-full h-2 rounded-full ${isDark ? "bg-[#404040]" : "bg-[#f0f0f0]"} overflow-hidden`}>
                            <div className="h-full bg-[#00b8a3] rounded-full" style={{ width: `${(stats.easySolved / easyLc) * 100}%` }} />
                         </div>
                      </div>
                      <div className="flex flex-col">
                         <div className="flex justify-between text-[13px] mb-1">
                            <span className="text-[#ffc01e]">Medium</span>
                            <span className={`${textMain} font-medium`}>{stats.mediumSolved} <span className={textMuted}>/{mediumLc}</span></span>
                         </div>
                         <div className={`w-full h-2 rounded-full ${isDark ? "bg-[#404040]" : "bg-[#f0f0f0]"} overflow-hidden`}>
                            <div className="h-full bg-[#ffc01e] rounded-full" style={{ width: `${(stats.mediumSolved / mediumLc) * 100}%` }} />
                         </div>
                      </div>
                      <div className="flex flex-col">
                         <div className="flex justify-between text-[13px] mb-1">
                            <span className="text-[#ef4743]">Hard</span>
                            <span className={`${textMain} font-medium`}>{stats.hardSolved} <span className={textMuted}>/{hardLc}</span></span>
                         </div>
                         <div className={`w-full h-2 rounded-full ${isDark ? "bg-[#404040]" : "bg-[#f0f0f0]"} overflow-hidden`}>
                            <div className="h-full bg-[#ef4743] rounded-full" style={{ width: `${(stats.hardSolved / hardLc) * 100}%` }} />
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className={`${bgCard} rounded-lg p-5 shadow-sm border ${borderMain} w-full md:w-[280px]`}>
                 <h2 className={`text-[15px] font-medium ${textMain} mb-4`}>Contest Rating</h2>
                 <div className="flex flex-col items-center justify-center h-[100px]">
                    <div className={`text-[14px] ${textMuted}`}>Not enough data</div>
                 </div>
             </div>
          </div>

          {/* Recent Submissions */}
          <div className={`${bgCard} rounded-lg p-5 shadow-sm border ${borderMain}`}>
             <h2 className={`text-[15px] font-medium ${textMain} mb-4`}>Recent Submissions</h2>
             {submissions.length > 0 ? (
                <div className="flex flex-col gap-2">
                   {submissions.map((sub, i) => (
                      <a href={`https://leetcode.com/problems/${sub.titleSlug}/`} target="_blank" rel="noopener noreferrer" key={i} className={`flex items-center justify-between p-3 rounded-md hover:${isDark ? "bg-[#333333]" : "bg-[#f5f5f5]"} transition-colors group`}>
                         <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span className={`text-[14px] font-medium ${textMain} group-hover:text-[#ffa116] transition-colors`}>{sub.title}</span>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className={`hidden sm:block text-[13px] ${sub.statusDisplay === 'Accepted' ? 'text-[#2cbb5d]' : 'text-[#ef4743]'}`}>{sub.statusDisplay}</span>
                            <div className={`hidden sm:flex items-center justify-center w-[80px] h-[22px] rounded-full ${isDark ? "bg-[#404040]" : "bg-[#f0f0f0]"} text-[12px] ${textMain}`}>
                               {sub.lang}
                            </div>
                            <span className={`text-[13px] ${textMuted}`}>
                              {(() => {
                                 const diff = Date.now() - (parseInt(sub.timestamp) * 1000);
                                 const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                 if (days === 0) return "Today";
                                 if (days === 1) return "1 day ago";
                                 if (days < 30) return `${days} days ago`;
                                 return new Date(parseInt(sub.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              })()}
                            </span>
                         </div>
                      </a>
                   ))}
                </div>
             ) : (
                <div className="flex items-center justify-center py-8">
                   <p className={`text-[14px] ${textMuted}`}>No recent submissions</p>
                </div>
             )}
          </div>



        </div>
      </div>
    </div>
  )
}
