"use client"

import { useState, useEffect, useCallback } from "react"
import { MenuBar } from "@/components/menu-bar"
import { Dock } from "@/components/dock"
import { Window } from "@/components/window"
import { AppIcon } from "@/components/app-icon"
import { LockScreen } from "@/components/lock-screen"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FaFolder, 
  FaSafari, 
  FaCommentDots, 
  FaImages, 
  FaEnvelope, 
  FaMusic,
  FaFilePdf,
  FaFileExcel,
  FaFilePowerpoint,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCode,
  FaGraduationCap,
  FaBriefcase
} from "react-icons/fa"
import { 
  SiApple,
  SiGithub,
  SiLinkedin,
  SiLeetcode
} from "react-icons/si"

export function MacOSDesktop() {
  const [openWindows, setOpenWindows] = useState<string[]>([])
  const [activeWindow, setActiveWindow] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isLocked, setIsLocked] = useState(true) // Start with lock screen
  const [lastActivity, setLastActivity] = useState(Date.now())
  const { theme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Activity tracking
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
    if (isLocked) {
      setIsLocked(false)
    }
  }, [isLocked])

  // Inactivity detection
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
    }
  }, [updateActivity])

  // Auto-lock after 1 minute of inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 60000) { // 60 seconds
        setIsLocked(true)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [lastActivity])

  const handleUnlock = () => {
    setIsLocked(false)
    setLastActivity(Date.now())
  }

  const toggleWindow = (appId: string) => {
    // Handle external links for social media apps
    if (appId === "linkedin") {
      window.open("https://www.linkedin.com/in/avadhoot-mahadik-125362295/", "_blank")
      return
    }
    if (appId === "github") {
      window.open("https://github.com/Avadhoot1905", "_blank")
      return
    }
    if (appId === "leetcode") {
      window.open("https://leetcode.com/u/arcsmo19/", "_blank")
      return
    }
    
    // Handle regular window toggling
    if (openWindows.includes(appId)) {
      setOpenWindows(openWindows.filter((id) => id !== appId))
      setActiveWindow(openWindows.length > 1 ? openWindows[0] : null)
    } else {
      setOpenWindows([...openWindows, appId])
      setActiveWindow(appId)
    }
  }

  const activateWindow = (appId: string) => {
    setActiveWindow(appId)
  }

  if (!mounted) return null

  return (
    <div
      className="h-screen w-full overflow-hidden font-sans transition-colors duration-300 text-white relative"
      style={{
        backgroundImage: `url(/assets/${theme === 'dark' ? 'v-light.jpg' : 'v-dark.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <AnimatePresence mode="wait">
        <LockScreen 
          key="lockscreen"
          isLocked={isLocked} 
          onUnlock={handleUnlock} 
        />
      </AnimatePresence>
      {!isLocked && (
        <>
          <MenuBar />

          <div className="relative h-screen w-full overflow-hidden p-4 pt-14">
        <motion.div
          className="grid grid-cols-6 gap-4 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          <AppIcon
            id="finder"
            name="Finder"
            icon={<FaFolder className="text-blue-500" />}
            onClick={() => toggleWindow("finder")}
          />
          <AppIcon
            id="safari"
            name="Safari"
            icon={<FaSafari className="text-blue-600" />}
            onClick={() => toggleWindow("safari")}
          />
          <AppIcon
            id="messages"
            name="Messages"
            icon={<FaCommentDots className="text-green-500" />}
            onClick={() => toggleWindow("messages")}
          />
          <AppIcon
            id="photos"
            name="Photos"
            icon={<FaImages className="text-yellow-500" />}
            onClick={() => toggleWindow("photos")}
          />
          <AppIcon
            id="about"
            name="About Me"
            icon={<FaUser className="text-purple-500" />}
            onClick={() => toggleWindow("about")}
          />
          <AppIcon
            id="projects"
            name="Projects"
            icon={<FaCode className="text-green-600" />}
            onClick={() => toggleWindow("projects")}
          />
          <AppIcon
            id="education"
            name="Education"
            icon={<FaGraduationCap className="text-blue-700" />}
            onClick={() => toggleWindow("education")}
          />
          <AppIcon
            id="experience"
            name="Experience"
            icon={<FaBriefcase className="text-gray-700" />}
            onClick={() => toggleWindow("experience")}
          />
        </motion.div>

        <AnimatePresence>
          {openWindows.includes("finder") && (
            <Window
              key="finder"
              id="finder"
              title="Finder"
              isActive={activeWindow === "finder"}
              onActivate={() => activateWindow("finder")}
              onClose={() => toggleWindow("finder")}
              initialPosition={{ x: 100, y: 100 }}
              initialSize={{ width: 600, height: 400 }}
            >
              <div className="flex h-full flex-col">
                <div className="flex border-b dark:border-gray-700">
                  <div
                    className={`w-48 border-r p-2 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100"}`}
                  >
                    <div className="mb-1 font-semibold">Favorites</div>
                    <div className={`pl-2 text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                      <div className="mb-1">Applications</div>
                      <div className="mb-1">Documents</div>
                      <div className="mb-1">Downloads</div>
                      <div className="mb-1">Pictures</div>
                    </div>
                  </div>
                  <div className="flex-1 p-2">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded flex items-center justify-center">
                          <FaFilePdf className="text-4xl text-red-500" />
                        </div>
                        <div className="mt-1 text-xs">Document.pdf</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded flex items-center justify-center">
                          <FaFileExcel className="text-4xl text-green-500" />
                        </div>
                        <div className="mt-1 text-xs">Spreadsheet.xlsx</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded flex items-center justify-center">
                          <FaFilePowerpoint className="text-4xl text-orange-500" />
                        </div>
                        <div className="mt-1 text-xs">Presentation.pptx</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Window>
          )}

          {openWindows.includes("safari") && (
            <Window
              key="safari"
              id="safari"
              title="Safari"
              isActive={activeWindow === "safari"}
              onActivate={() => activateWindow("safari")}
              onClose={() => toggleWindow("safari")}
              initialPosition={{ x: 150, y: 150 }}
              initialSize={{ width: 700, height: 500 }}
            >
              <div className="flex h-full flex-col">
                <div className={`flex items-center border-b p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
                  <div
                    className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    <FaChevronLeft className={theme === "dark" ? "text-gray-300" : "text-gray-500"} />
                  </div>
                  <div
                    className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    <FaChevronRight className={theme === "dark" ? "text-gray-300" : "text-gray-500"} />
                  </div>
                  <div
                    className={`flex-1 rounded-full px-4 py-1 text-sm ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500"}`}
                  >
                    https://www.example.com
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <h1 className="mb-4 text-2xl font-bold">Welcome to Example.com</h1>
                  <p className="mb-4">This is a sample webpage displayed in our macOS Safari browser simulation.</p>
                  <div className={`rounded p-4 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.</p>
                  </div>
                </div>
              </div>
            </Window>
          )}

          {openWindows.includes("messages") && (
            <Window
              key="messages"
              id="messages"
              title="Messages"
              isActive={activeWindow === "messages"}
              onActivate={() => activateWindow("messages")}
              onClose={() => toggleWindow("messages")}
              initialPosition={{ x: 200, y: 200 }}
              initialSize={{ width: 500, height: 400 }}
            >
              <div className="flex h-full">
                <div className={`w-1/3 border-r ${theme === "dark" ? "border-gray-700" : ""}`}>
                  <div className={`border-b p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
                    <input
                      type="text"
                      placeholder="Search"
                      className={`w-full rounded-full px-3 py-1 text-sm ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100"}`}
                    />
                  </div>
                  <div className="p-2">
                    <div className={`mb-2 rounded p-2 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                      <div className="font-semibold">John Doe</div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Hey, how are you?
                      </div>
                    </div>
                    <div className={`mb-2 rounded p-2 ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"}`}>
                      <div className="font-semibold">Jane Smith</div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Did you see the new update?
                      </div>
                    </div>
                    <div className={`mb-2 rounded p-2 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                      <div className="font-semibold">Team Chat</div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Meeting at 3pm
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <div className={`border-b p-2 text-center ${theme === "dark" ? "border-gray-700" : ""}`}>
                    <div className="font-semibold">Jane Smith</div>
                    <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Online</div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-4 flex justify-start">
                      <div
                        className={`max-w-[70%] rounded-lg p-2 text-sm ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                      >
                        Hey there! How's your project going?
                      </div>
                    </div>
                    <div className="mb-4 flex justify-end">
                      <div className="max-w-[70%] rounded-lg bg-blue-500 p-2 text-sm text-white">
                        It's going well! Just working on the macOS interface.
                      </div>
                    </div>
                    <div className="mb-4 flex justify-start">
                      <div
                        className={`max-w-[70%] rounded-lg p-2 text-sm ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                      >
                        Did you see the new update?
                      </div>
                    </div>
                  </div>
                  <div className={`border-t p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
                    <input
                      type="text"
                      placeholder="iMessage"
                      className={`w-full rounded-full px-3 py-2 text-sm ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100"}`}
                    />
                  </div>
                </div>
              </div>
            </Window>
          )}

          {openWindows.includes("photos") && (
            <Window
              key="photos"
              id="photos"
              title="Photos"
              isActive={activeWindow === "photos"}
              onActivate={() => activateWindow("photos")}
              onClose={() => toggleWindow("photos")}
              initialPosition={{ x: 250, y: 150 }}
              initialSize={{ width: 650, height: 450 }}
            >
              <div className="flex h-full flex-col">
                <div className={`border-b p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
                  <div className="flex space-x-4">
                    <div className={`text-sm font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}>
                      Photos
                    </div>
                    <div className="text-sm">Memories</div>
                    <div className="text-sm">Albums</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <h2 className="mb-2 text-lg font-semibold">Recents</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </Window>
          )}

          {openWindows.includes("about") && (
            <Window
              key="about"
              id="about"
              title="About Me"
              isActive={activeWindow === "about"}
              onActivate={() => activateWindow("about")}
              onClose={() => toggleWindow("about")}
              initialPosition={{ x: 150, y: 100 }}
              initialSize={{ width: 600, height: 500 }}
            >
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-6">
                    <FaUser className="text-white text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-2">Your Name</h1>
                    <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      Full Stack Developer
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                    Passionate developer with expertise in modern web technologies. I love creating 
                    beautiful, functional applications that solve real-world problems.
                  </p>
                  <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                    When I'm not coding, you can find me exploring new technologies, contributing to 
                    open source projects, or enjoying a good cup of coffee.
                  </p>
                </div>
              </div>
            </Window>
          )}

          {openWindows.includes("projects") && (
            <Window
              key="projects"
              id="projects"
              title="Projects"
              isActive={activeWindow === "projects"}
              onActivate={() => activateWindow("projects")}
              onClose={() => toggleWindow("projects")}
              initialPosition={{ x: 200, y: 120 }}
              initialSize={{ width: 700, height: 550 }}
            >
              <div className="p-6 overflow-y-auto">
                <h1 className="text-xl font-bold mb-6">My Projects</h1>
                <div className="grid gap-6">
                  <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className="flex items-center mb-3">
                      <FaCode className="text-green-500 mr-2" />
                      <h3 className="text-lg font-semibold">Portfolio Website</h3>
                    </div>
                    <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      A responsive portfolio website built with Next.js and Tailwind CSS
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">Next.js</span>
                      <span className="px-2 py-1 bg-cyan-500 text-white text-xs rounded">Tailwind</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className="flex items-center mb-3">
                      <FaCode className="text-purple-500 mr-2" />
                      <h3 className="text-lg font-semibold">E-commerce Platform</h3>
                    </div>
                    <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      Full-stack e-commerce solution with React, Node.js, and MongoDB
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">React</span>
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Node.js</span>
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">MongoDB</span>
                    </div>
                  </div>
                </div>
              </div>
            </Window>
          )}

          {openWindows.includes("education") && (
            <Window
              key="education"
              id="education"
              title="Education"
              isActive={activeWindow === "education"}
              onActivate={() => activateWindow("education")}
              onClose={() => toggleWindow("education")}
              initialPosition={{ x: 180, y: 140 }}
              initialSize={{ width: 650, height: 500 }}
            >
              <div className="p-6 overflow-y-auto">
                <h1 className="text-xl font-bold mb-6">Education</h1>
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className="flex items-center mb-3">
                      <FaGraduationCap className="text-blue-600 mr-3 text-xl" />
                      <div>
                        <h3 className="text-lg font-semibold">Bachelor of Computer Science</h3>
                        <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                          University Name • 2019-2023
                        </p>
                      </div>
                    </div>
                    <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                      Graduated with honors. Specialized in software engineering and web development.
                      Relevant coursework: Data Structures, Algorithms, Database Systems, Web Technologies.
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className="flex items-center mb-3">
                      <FaGraduationCap className="text-green-600 mr-3 text-xl" />
                      <div>
                        <h3 className="text-lg font-semibold">Full Stack Web Development Bootcamp</h3>
                        <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                          Coding Institute • 2022
                        </p>
                      </div>
                    </div>
                    <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                      Intensive 6-month program covering modern web development technologies including 
                      React, Node.js, Express, MongoDB, and deployment strategies.
                    </p>
                  </div>
                </div>
              </div>
            </Window>
          )}

          {openWindows.includes("experience") && (
            <Window
              key="experience"
              id="experience"
              title="Experience"
              isActive={activeWindow === "experience"}
              onActivate={() => activateWindow("experience")}
              onClose={() => toggleWindow("experience")}
              initialPosition={{ x: 220, y: 160 }}
              initialSize={{ width: 700, height: 550 }}
            >
              <div className="p-6 overflow-y-auto">
                <h1 className="text-xl font-bold mb-6">Work Experience</h1>
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className="flex items-center mb-3">
                      <FaBriefcase className="text-purple-600 mr-3 text-xl" />
                      <div>
                        <h3 className="text-lg font-semibold">Senior Frontend Developer</h3>
                        <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                          Tech Company Inc. • 2023-Present
                        </p>
                      </div>
                    </div>
                    <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      Lead frontend development for multiple high-traffic web applications. 
                      Collaborate with cross-functional teams to deliver exceptional user experiences.
                    </p>
                    <ul className={`list-disc list-inside text-sm space-y-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      <li>Developed and maintained React applications serving 100k+ users</li>
                      <li>Improved application performance by 40% through code optimization</li>
                      <li>Mentored junior developers and led code review processes</li>
                    </ul>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className="flex items-center mb-3">
                      <FaBriefcase className="text-green-600 mr-3 text-xl" />
                      <div>
                        <h3 className="text-lg font-semibold">Full Stack Developer</h3>
                        <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                          StartupXYZ • 2021-2023
                        </p>
                      </div>
                    </div>
                    <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      Built scalable web applications from concept to deployment. 
                      Worked with modern technologies to create innovative solutions.
                    </p>
                    <ul className={`list-disc list-inside text-sm space-y-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      <li>Developed RESTful APIs using Node.js and Express</li>
                      <li>Created responsive frontends with React and Tailwind CSS</li>
                      <li>Implemented CI/CD pipelines and cloud deployment strategies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Window>
          )}
        </AnimatePresence>
      </div>

      <Dock
        apps={[
          { id: "finder", icon: <FaFolder className="text-blue-500" />, isOpen: openWindows.includes("finder") },
          { id: "about", icon: <FaUser className="text-purple-500" />, isOpen: openWindows.includes("about") },
          { id: "experience", icon: <FaBriefcase className="text-gray-700" />, isOpen: openWindows.includes("experience") },
          { id: "projects", icon: <FaCode className="text-green-600" />, isOpen: openWindows.includes("projects") },
          { id: "education", icon: <FaGraduationCap className="text-blue-700" />, isOpen: openWindows.includes("education") },
          { id: "safari", icon: <FaSafari className="text-blue-600" />, isOpen: openWindows.includes("safari") },
          { id: "github", icon: <SiGithub className="text-gray-800 dark:text-white" />, isOpen: false },
          { id: "linkedin", icon: <SiLinkedin className="text-blue-500" />, isOpen: false },
          { id: "leetcode", icon: <SiLeetcode className="text-orange-500" />, isOpen: false },
        ]}
        onAppClick={toggleWindow}
      />
        </>
      )}
    </div>
  )
}
