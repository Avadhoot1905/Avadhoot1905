
import { FaSearch, FaRegBookmark } from "react-icons/fa"
import { BsThreeDots } from "react-icons/bs"
import { PiHandsClapping } from "react-icons/pi"
import { BiMessageRounded } from "react-icons/bi"
import { SiMedium } from "react-icons/si"

interface MediumArticle {
  title: string
  link: string
  pubDate: string
  content: string
}

interface MediumProfileProps {
  articles: MediumArticle[]
  isDark: boolean
}

export function MediumProfile({ articles, isDark }: MediumProfileProps) {
  const bgMain = isDark ? "bg-[#121212]" : "bg-white"
  const textMain = isDark ? "text-[rgba(255,255,255,0.95)]" : "text-[rgba(41,41,41,1)]"
  const textMuted = isDark ? "text-[rgba(255,255,255,0.68)]" : "text-[rgba(117,117,117,1)]"
  const borderMain = isDark ? "border-[rgba(255,255,255,0.15)]" : "border-[rgba(242,242,242,1)]"

  // Strip HTML from content for the subtitle preview
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ""
  }

  return (
    <div className={`w-full min-h-full ${bgMain} font-serif selection:bg-[rgba(168,218,220,0.5)]`}>
      {/* Top Navbar */}
      <div className={`sticky top-0 z-50 flex items-center justify-center h-[48px] md:h-[50px] border-b ${borderMain} ${bgMain} px-4 md:px-6`}>
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SiMedium className={`text-[24px] md:text-[28px] ${textMain}`} />
            <div className={`hidden md:flex items-center h-[32px] md:h-[36px] rounded-full px-4 ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-[rgba(249,249,249,1)]"}`}>
              <FaSearch className={textMuted} />
              <input
                type="text"
                placeholder="Search"
                className={`bg-transparent border-none outline-none ml-2 text-[13px] md:text-sm w-[160px] md:w-[200px] font-sans ${textMain} placeholder:${textMuted}`}
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 text-[13px] md:text-[14px] font-sans">
            <div className={`hidden md:flex items-center gap-2 cursor-pointer ${textMuted} hover:${textMain}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 4a.5.5 0 0 0 0-1v1zm7 6a.5.5 0 0 0-1 0h1zm-7-7H4v1h10V3zM3 4v16h1V4H3zm1 17h16v-1H4v1zm17-1V10h-1v10h1zm-1 1a1 1 0 0 0 1-1h-1v1zM3 20a1 1 0 0 0 1 1v-1H3v1zM4 3a1 1 0 0 0-1 1h1V3z" fill="currentColor"></path><path d="M17.5 4.5l-8.46 8.46a.25.25 0 0 0-.06.1l-.82 2.47c-.07.2.12.38.31.31l2.47-.82a.25.25 0 0 0 .1-.06L19.5 6.5m-2-2l2 2" stroke="currentColor"></path></svg>
              <span>Write</span>
            </div>
            <button className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full ${isDark ? "bg-[rgba(255,255,255,0.2)]" : "bg-[rgba(242,242,242,1)]"} ${textMain} hover:bg-[rgba(0,0,0,0.1)] transition-colors`}>Sign up</button>
            <button className={`${textMain}`}>Sign in</button>
            <div className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full bg-gray-400 overflow-hidden">
              <img src="/favicon.ico" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-[900px] mx-auto flex flex-col md:flex-row mt-6 md:mt-8 px-4 md:px-0">

        {/* Left Column (Article Feed) */}
        <div className="w-full md:w-[600px] pr-0 md:pr-8 md:border-r border-[rgba(242,242,242,1)] dark:border-[rgba(255,255,255,0.15)] pb-12">

          <div className="flex items-center gap-6 border-b border-[rgba(242,242,242,1)] dark:border-[rgba(255,255,255,0.15)] mb-6 md:mb-10 font-sans text-[13px] md:text-[14px]">
            <span className={`pb-3 md:pb-4 border-b-2 ${textMain} border-current cursor-pointer`}>Home</span>
            <span className={`pb-3 md:pb-4 border-b-2 border-transparent ${textMuted} hover:${textMain} cursor-pointer`}>About</span>
          </div>

          <div className="flex flex-col">
            {articles.length > 0 ? articles.map((article, index) => {
              const plainText = stripHtml(article.content)

              return (
                <div key={index} className="flex flex-col mb-8 md:mb-12">
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <div className="w-5 h-5 rounded-full bg-gray-300 overflow-hidden">
                      <img src="/favicon.ico" alt="Avadhoot Mahadik" className="w-full h-full object-cover" />
                    </div>
                    <span className={`font-sans text-[12px] md:text-[13px] ${textMain}`}>Avadhoot Mahadik</span>
                  </div>

                  <a href={article.link} target="_blank" rel="noopener noreferrer" className="flex justify-between items-start gap-4 md:gap-8 group">
                    <div className="flex-1">
                      <h2 className={`text-[18px] md:text-[20px] font-bold ${textMain} leading-tight mb-2 group-hover:underline`}>{article.title}</h2>
                      <p className={`hidden md:block font-sans text-[14px] md:text-[15px] ${textMuted} leading-snug line-clamp-2`}>
                        {plainText}
                      </p>
                    </div>
                  </a>

                  <div className={`flex items-center justify-between mt-6 font-sans text-[13px] ${textMuted}`}>
                    <div className="flex items-center gap-2">
                      <span>{new Date(article.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <PiHandsClapping className="text-[18px]" />
                        <span>42</span>
                      </div>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <BiMessageRounded className="text-[18px]" />
                        <span>1</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <FaRegBookmark className="text-[16px] cursor-pointer" />
                      <BsThreeDots className="text-[18px] cursor-pointer" />
                    </div>
                  </div>
                </div>
              )
            }) : (
              <div className={`text-[16px] ${textMuted}`}>No articles published yet.</div>
            )}
          </div>



        </div>

        {/* Right Column (Sidebar) */}
        <div className="hidden md:block md:w-[300px] pl-8 font-sans">
          <div className="sticky top-[100px]">
            <div className="w-[64px] h-[64px] md:w-[80px] md:h-[80px] rounded-full overflow-hidden mb-4">
              <img src="/favicon.ico" alt="Avadhoot Mahadik" className="w-full h-full object-cover" />
            </div>

            <h2 className={`text-[16px] font-bold ${textMain} mb-1`}>Avadhoot Mahadik</h2>
            <p className={`text-[14px] ${textMuted} mb-4`}>65 Followers</p>

            <p className={`text-[14px] ${textMuted} mb-6 leading-relaxed`}>
              Full Stack Developer | Building scalable applications and exploring cloud engineering | Writer and community enthusiast.
            </p>

            <div className="flex items-center gap-2 mb-8">
              <a href="https://medium.com/@arcsmo19" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-[#1a8917] text-white hover:bg-[#156d12]"} text-[14px] font-bold transition-colors`}>
                <SiMedium /> View Profile
              </a>
              <button className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? "bg-[rgba(255,255,255,0.2)]" : "bg-[#1a8917] text-white"} hover:bg-opacity-80 transition-colors`}>
                <BiMessageRounded className="text-[18px]" />
              </button>
            </div>

            <h3 className={`text-[16px] font-bold ${textMain} mb-4`}>Following</h3>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-300" />
              <div className="w-8 h-8 rounded-full bg-gray-400" />
              <div className="w-8 h-8 rounded-full bg-gray-500" />
              <div className={`w-8 h-8 rounded-full ${isDark ? "bg-[rgba(255,255,255,0.1)] text-white" : "bg-gray-100 text-black"} flex items-center justify-center text-[12px]`}>
                +2
              </div>
            </div>

            <div className={`flex flex-wrap gap-x-4 gap-y-2 text-[13px] ${textMuted}`}>
              <span className="cursor-pointer hover:underline">Help</span>
              <span className="cursor-pointer hover:underline">Status</span>
              <span className="cursor-pointer hover:underline">Writers</span>
              <span className="cursor-pointer hover:underline">Blog</span>
              <span className="cursor-pointer hover:underline">Careers</span>
              <span className="cursor-pointer hover:underline">Privacy</span>
              <span className="cursor-pointer hover:underline">Terms</span>
              <span className="cursor-pointer hover:underline">About</span>
              <span className="cursor-pointer hover:underline">Knowable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
