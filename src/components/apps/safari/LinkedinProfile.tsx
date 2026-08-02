import React from "react"
import { SiLinkedin } from "react-icons/si"
import {
  FaSearch,
  FaHome,
  FaUserFriends,
  FaBriefcase,
  FaCommentDots,
  FaBell,
  FaCamera,
  FaPen,
  FaPlus,
  FaExternalLinkAlt,
  FaBuilding,
} from "react-icons/fa"
import { experiences } from "@/data/experience"

interface LinkedinProfileProps {
  isDark: boolean
}

export function LinkedinProfile({ isDark }: LinkedinProfileProps) {
  const bgMain = isDark ? "bg-[#000000]" : "bg-[#f3f2ef]"
  const bgCard = isDark ? "bg-[#1d2226]" : "bg-white"
  const textMain = isDark ? "text-white/90" : "text-black/90"
  const textMuted = isDark ? "text-white/60" : "text-black/60"
  const borderMain = isDark ? "border-white/10" : "border-black/10"
  const linkColor = isDark ? "text-[#70b5f9]" : "text-[#0a66c2]"

  return (
    <div className={`w-full min-h-full ${bgMain} font-sans`}>
      {/* Top Navbar */}
      <div className={`sticky top-0 z-50 flex items-center justify-center h-[44px] md:h-[48px] border-b ${borderMain} ${bgCard} px-4 md:px-0`}>
        <div className="w-full max-w-[1128px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] text-[#0a66c2] fill-current">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a1.66 1.66 0 000 1.21V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
            </svg>
            <div className={`hidden md:flex items-center h-[30px] w-[240px] rounded-sm px-3 ${isDark ? "bg-[#38434f]" : "bg-[#edf3f8]"}`}>
              <FaSearch className={textMuted} />
              <input 
                type="text" 
                placeholder="Search" 
                className={`bg-transparent border-none outline-none ml-2 text-[13px] w-full ${textMain} placeholder:${textMuted}`} 
                readOnly
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 h-full">
            <div className={`flex flex-col items-center justify-center cursor-pointer ${textMuted} hover:${textMain}`}>
              <FaHome className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
              <span className="text-[10px] md:text-[11px] hidden md:block mt-0.5">Home</span>
            </div>
            <div className={`flex flex-col items-center justify-center cursor-pointer ${textMuted} hover:${textMain}`}>
              <FaUserFriends className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
              <span className="text-[10px] md:text-[11px] hidden md:block mt-0.5">My Network</span>
            </div>
            <div className={`flex flex-col items-center justify-center cursor-pointer ${textMuted} hover:${textMain}`}>
              <FaBriefcase className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
              <span className="text-[10px] md:text-[11px] hidden md:block mt-0.5">Jobs</span>
            </div>
            <div className={`flex flex-col items-center justify-center cursor-pointer ${textMuted} hover:${textMain}`}>
              <FaCommentDots className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
              <span className="text-[10px] md:text-[11px] hidden md:block mt-0.5">Messaging</span>
            </div>
            <div className={`flex flex-col items-center justify-center cursor-pointer ${textMuted} hover:${textMain}`}>
              <FaBell className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
              <span className="text-[10px] md:text-[11px] hidden md:block mt-0.5">Notifications</span>
            </div>
            <div className={`flex flex-col items-center justify-center cursor-pointer ${textMain} border-b-2 border-[#0a66c2]`}>
              <div className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-gray-400 overflow-hidden">
                <img src="/favicon.ico" alt="Me" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] md:text-[11px] hidden md:flex items-center gap-1 mt-0.5">Me ▼</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1128px] mx-auto pt-6 flex flex-col lg:flex-row gap-6 px-4 md:px-0">
        {/* Main Column */}
        <div className="w-full lg:w-2/3 flex flex-col gap-2">
          
          {/* View Profile Widget (Mobile) */}
          <div className="flex lg:hidden w-full flex-col mb-2">
            <div className={`w-full rounded-lg border ${borderMain} ${bgCard} p-5`}>
               <h2 className={`text-[15px] font-semibold ${textMain} mb-2`}>About this profile</h2>
               <p className={`text-[13px] ${textMuted} mb-4 leading-relaxed`}>
                 This is a mocked version of Avadhoot's LinkedIn profile built for this portfolio. To connect or view his full professional background, please visit his actual LinkedIn page.
               </p>
               <a href="https://www.linkedin.com/in/avadhoot-mahadik/" target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-[#0a66c2] text-[#0a66c2] font-semibold hover:bg-[#0a66c2]/10 transition-colors`}>
                 <SiLinkedin className="text-[16px]" />
                 View Full Profile
               </a>
            </div>
          </div>

          {/* Profile Card */}
          <div className={`w-full rounded-lg border ${borderMain} ${bgCard} overflow-hidden mb-2 relative`}>
            {/* Banner */}
            <div className="w-full h-[120px] md:h-[160px] relative bg-[#a0b4b7]">
              <div className="absolute inset-0 overflow-hidden">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/1/13/VIT_university%2C_vellore.jpg" alt="VIT Vellore" className="w-full h-full object-cover" />
              </div>
              <button className={`absolute top-4 right-4 p-2 rounded-full ${bgCard} shadow-sm ${textMain} hover:bg-black/10 transition-colors`}>
                <FaCamera />
              </button>
            </div>
            
            {/* Avatar */}
            <div className="absolute top-[60px] md:top-[90px] left-4 md:left-6">
              <div className={`w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full border-4 ${bgCard} overflow-hidden`}>
                 <img src="/favicon.ico" alt="Avadhoot Mahadik" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-[50px] md:pt-[70px] px-4 md:px-6 pb-6 relative">
              <div className="flex justify-between items-start flex-col md:flex-row gap-4 md:gap-0">
                <div className="max-w-[600px]">
                  <h1 className={`text-xl md:text-2xl font-semibold ${textMain}`}>Avadhoot Ganesh Mahadik</h1>
                  <p className={`text-sm md:text-base mt-1 ${textMain}`}>Full Stack Developer | Cloud Engineering | Seeking New Opportunities</p>
                  <p className={`text-xs md:text-sm mt-2 ${textMuted}`}>Pune, Maharashtra, India · <span className={`font-semibold ${linkColor} hover:underline cursor-pointer`}>Contact info</span></p>
                  <p className={`text-xs md:text-sm mt-1 font-semibold ${linkColor} hover:underline cursor-pointer`}>500+ connections</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex items-center gap-2 cursor-pointer hover:underline">
                     <FaBuilding className="text-[18px] text-gray-500" />
                     <span className={`text-sm font-semibold ${textMain}`}>VIT University</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button className={`px-4 py-1.5 rounded-full bg-[#0a66c2] text-white font-semibold hover:bg-[#004182] transition-colors`}>Open to</button>
                <button className={`px-4 py-1.5 rounded-full border border-[#0a66c2] ${linkColor} font-semibold hover:bg-[#0a66c2]/10 transition-colors`}>Add profile section</button>
                <button className={`px-4 py-1.5 rounded-full border ${borderMain} ${textMuted} font-semibold hover:bg-black/10 transition-colors`}>More</button>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className={`w-full rounded-lg border ${borderMain} ${bgCard} p-6 mb-2`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${textMain}`}>About</h2>
              <button className={`p-2 rounded-full hover:bg-black/10 transition-colors ${textMuted}`}><FaPen /></button>
            </div>
            <div className={`text-sm leading-relaxed ${textMain}`}>
              <p>Passionate software engineer currently pursuing a B.Tech in Computer Science and Engineering at VIT Vellore. Experienced in full-stack web development, scalable cloud architectures, and open-source contributions.</p>
              <br/>
              <p>Skilled in Next.js, React, Node.js, Go, AWS, Docker, and Kubernetes. Active senior core member of ACM-VIT, where I lead technical workshops and develop community platforms.</p>
            </div>
          </div>

          {/* Experience Section */}
          <div className={`w-full rounded-lg border ${borderMain} ${bgCard} p-6 mb-2`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold ${textMain}`}>Experience</h2>
              <div className="flex gap-2">
                <button className={`p-2 rounded-full hover:bg-black/10 transition-colors ${textMuted}`}><FaPlus /></button>
                <button className={`p-2 rounded-full hover:bg-black/10 transition-colors ${textMuted}`}><FaPen /></button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {experiences.map((exp, index) => (
                <div key={exp.id}>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12">
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <FaBuilding className="text-gray-400 text-2xl" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-base font-semibold ${textMain}`}>{exp.role}</h3>
                      <p className={`text-sm ${textMain}`}>{exp.organization}</p>
                      <p className={`text-sm ${textMuted}`}>{exp.duration} · {exp.location || "Remote"}</p>
                      
                      <div className={`mt-3 text-sm leading-relaxed ${textMain}`}>
                        <p>{exp.description}</p>
                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul className="list-disc pl-4 mt-2">
                            {exp.bullets.slice(0, 2).map((bullet, i) => (
                              <li key={i} className="mb-1">{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      
                      {exp.techStack && exp.techStack.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`text-sm font-semibold ${textMain}`}>Skills:</span>
                          <span className={`text-sm ${textMuted}`}>{exp.techStack.join(" · ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < experiences.length - 1 && <div className={`w-full h-px ${borderMain} border-b mt-6`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="hidden lg:flex w-[300px] flex-col gap-2">
          {/* View Profile Widget */}
          <div className={`w-full rounded-lg border ${borderMain} ${bgCard} p-5`}>
             <h2 className={`text-[15px] font-semibold ${textMain} mb-2`}>About this profile</h2>
             <p className={`text-[13px] ${textMuted} mb-4 leading-relaxed`}>
               This is a mocked version of Avadhoot's LinkedIn profile built for this portfolio. To connect or view his full professional background, please visit his actual LinkedIn page.
             </p>
             <a href="https://www.linkedin.com/in/avadhoot-mahadik/" target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-[#0a66c2] text-[#0a66c2] font-semibold hover:bg-[#0a66c2]/10 transition-colors`}>
               <SiLinkedin className="text-[16px]" />
               View Full Profile
             </a>
          </div>
        </div>
      </div>
    </div>
  )
}
