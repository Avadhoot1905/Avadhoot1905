"use client"

import React, { useState } from "react"
import { useTheme } from "next-themes"
import { FaGraduationCap, FaUniversity, FaSchool } from "react-icons/fa"
import {
  Share2,
  Star,
  MoreHorizontal,
  Clock,
  Tag,
  User,
  ChevronRight,
  ChevronDown,
  Table as TableIcon,
  List,
  GripVertical,
  Plus,
  Calendar,
  Award,
  Lightbulb,
} from "lucide-react"

type ViewTab = "page" | "table"

export function EducationApp() {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<ViewTab>("page")
  const [isStarred, setIsStarred] = useState(true)
  const [expandedBtech, setExpandedBtech] = useState(true)
  const [expandedSchool, setExpandedSchool] = useState(true)

  const isDark = theme === "dark"

  return (
    <div
      className={`flex h-full flex-col select-none font-sans ${isDark ? "bg-[#191919] text-[#D4D4D4]" : "bg-white text-[#37352F]"
        }`}
    >
      {/* Notion Top Bar */}
      <div
        className={`flex h-11 shrink-0 items-center justify-between border-b px-4 text-xs ${isDark
          ? "border-[#2F2F2F] bg-[#191919] text-[#9B9B9B]"
          : "border-[#E5E5E5] bg-white text-[#787774]"
          }`}
      >
        {/* Breadcrumb */}
        <div className="flex items-center space-x-1.5 overflow-hidden">
          <div className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
            <span className="text-xs">Avadhoot&apos;s Workspace</span>
          </div>
          <span className="text-gray-400">/</span>
          <div className={`flex items-center space-x-2 rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
            <FaGraduationCap className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="truncate text-xs">Education &amp; Academic Journey</span>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center space-x-1">
          <span className="hidden sm:inline-flex items-center text-[11px] px-2 py-0.5 rounded text-gray-400">
            Edited today
          </span>
          <button
            type="button"
            onClick={() => setIsStarred(!isStarred)}
            className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isStarred ? "text-amber-400" : ""
              }`}
            title="Favorite"
          >
            <Star className={`h-4 w-4 ${isStarred ? "fill-amber-400" : ""}`} />
          </button>
          <button
            type="button"
            className="flex items-center space-x-1 rounded.md px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5 mr-1" />
            <span>Share</span>
          </button>
          <button
            type="button"
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Notion Scrollable Page Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Notion Aesthetic Page Cover Banner */}
        <div className="group relative h-44 sm:h-56 w-full overflow-hidden bg-gray-900">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/13/VIT_university%2C_vellore.jpg"
            alt="VIT Vellore Campus"
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <span className="rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white shadow backdrop-blur-sm cursor-pointer">
              Change cover
            </span>
          </div>
        </div>

        {/* Page Content Container */}
        <div className="mx-auto max-w-3xl px-6 sm:px-10 pb-16">
          {/* Large Page Icon overlapping cover */}
          <div className="relative z-10 -mt-9 mb-5 flex items-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-xl shadow-lg border ${isDark
                ? "bg-[#1E1E1E] border-[#2F2F2F] text-blue-400"
                : "bg-white border-gray-200 text-blue-600"
                }`}
            >
              <FaGraduationCap className="h-8 w-8" />
            </div>
          </div>

          {/* Page Title */}
          <h1
            className={`mb-5 text-3xl sm:text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#37352F]"
              }`}
          >
            Education &amp; Academic Journey
          </h1>

          {/* Notion Page Properties Table */}
          <div
            className={`mb-6 space-y-2.5 border-b pb-6 text-xs ${isDark
              ? "border-[#2F2F2F] text-[#9B9B9B]"
              : "border-[#E5E5E5] text-[#787774]"
              }`}
          >
            <div className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-4 sm:col-span-3 flex items-center space-x-2">
                <User className="h-3.5 w-3.5" />
                <span>Created by</span>
              </div>
              <div className={`col-span-8 sm:col-span-9 flex items-center space-x-2 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-500 font-bold">
                  AM
                </div>
                <span className={isDark ? "text-gray-200" : "text-gray-800"}>
                  Avadhoot Mahadik
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-4 sm:col-span-3 flex items-center space-x-2">
                <Clock className="h-3.5 w-3.5" />
                <span>Status</span>
              </div>
              <div className="col-span-8 sm:col-span-9">
                <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-500">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  In Progress (B.Tech &apos;27)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-4 sm:col-span-3 flex items-center space-x-2">
                <Tag className="h-3.5 w-3.5" />
                <span>Tags</span>
              </div>
              <div className="col-span-8 sm:col-span-9 flex flex-wrap gap-1.5">
                <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  Computer Science
                </span>
                <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[11px] font-medium text-purple-600 dark:text-purple-400">
                  VIT Vellore
                </span>
                <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  GPA 8.30
                </span>
                <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-600 dark:text-sky-400">
                  Deens Academy
                </span>
              </div>
            </div>
          </div>

          {/* View Mode Tabs (Notion Database Views) */}
          <div className="mb-6 flex items-center space-x-2 border-b border-gray-200/40 dark:border-gray-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("page")}
              className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${activeTab === "page"
                ? isDark
                  ? "bg-[#2A2A2A] text-white shadow-sm"
                  : "bg-gray-200 text-gray-900 border border-gray-300 shadow-sm"
                : isDark
                  ? "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Page View</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("table")}
              className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${activeTab === "table"
                ? isDark
                  ? "bg-[#2A2A2A] text-white shadow-sm"
                  : "bg-gray-200 text-gray-900 border border-gray-300 shadow-sm"
                : isDark
                  ? "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table View</span>
            </button>
          </div>

          {activeTab === "page" ? (
            <div className="space-y-6">
              {/* Notion Callout Block */}
              <div
                className={`flex items-start space-x-3.5 rounded-lg border p-4 ${isDark
                  ? "bg-[#232323] border-[#2F2F2F]"
                  : "bg-[#FBF8F2] border-[#EADFC9]"
                  }`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div className="text-xs leading-relaxed pt-0.5">
                  <strong
                    className={isDark ? "text-gray-200" : "text-gray-800"}
                  >
                    Academic Overview:
                  </strong>{" "}
                  Currently pursuing Computer Science and Engineering with
                  Business Systems at VIT Vellore with an 0/10 GPA. Balancing
                  rigorous academics with leadership in ACM-VIT &amp; SEDS-VIT,
                  hackathon participation, and holistic development.
                </div>
              </div>

              {/* Notion Block 1: VIT Vellore */}
              <div className="group relative -ml-6 pl-6">
                {/* Notion Hover Handle */}
                <div className="absolute left-0 top-3 hidden group-hover:flex items-center space-x-0.5 text-gray-400 cursor-grab">
                  <Plus className="h-3.5 w-3.5 hover:bg-black/5 dark:hover:bg-white/5 rounded" />
                  <GripVertical className="h-3.5 w-3.5 hover:bg-black/5 dark:hover:bg-white/5 rounded" />
                </div>

                <div
                  className={`rounded-xl border transition-all ${isDark
                    ? "bg-[#202020] border-[#2F2F2F] hover:border-[#404040]"
                    : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                    }`}
                >
                  {/* Card Header Toggle */}
                  <div
                    onClick={() => setExpandedBtech(!expandedBtech)}
                    className="flex items-start justify-between p-4 cursor-pointer"
                  >
                    <div className="flex items-start space-x-3.5">
                      <button
                        type="button"
                        className="mt-1 text-gray-400 hover:text-gray-600 transition-transform duration-150"
                      >
                        {expandedBtech ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <FaUniversity className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2
                            className={`text-base font-semibold ${isDark ? "text-white" : "text-[#37352F]"
                              }`}
                          >
                            Vellore Institute of Technology, Vellore
                          </h2>
                          <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
                            B.Tech
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-blue-500 dark:text-blue-400">
                          Computer Science and Engineering with Business Systems
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="mr-1.5 h-3.5 w-3.5" />
                            Jul 2023 - Jul 2027
                          </span>
                          <span className="flex items-center font-medium text-emerald-500">
                            <Award className="mr-1.5 h-3.5 w-3.5" />
                            Grade: 8.30 / 10 (3.32 / 4)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Notion Block Content */}
                  {expandedBtech && (
                    <div
                      className={`border-t px-6 py-4 text-xs space-y-4 ${isDark
                        ? "border-[#2F2F2F] text-gray-300"
                        : "border-gray-100 text-gray-600"
                        }`}
                    >
                      <div>
                        <div className="mb-2 font-semibold uppercase tracking-wider text-[11px] text-gray-400">
                          Extracurricular &amp; Societies
                        </div>
                        <ul className="space-y-1.5 list-none">
                          <li className="flex items-start">
                            <span className="mr-2 text-blue-500 font-bold">
                              •
                            </span>
                            <span>
                              Active member of{" "}
                              <strong className={isDark ? "text-white" : "text-gray-900"}>
                                ACM-VIT
                              </strong>{" "}
                              and{" "}
                              <strong className={isDark ? "text-white" : "text-gray-900"}>
                                SEDS-VIT
                              </strong>
                              , contributing to impactful technical products &amp;
                              web applications including{" "}
                              <span className="underline decoration-blue-400 font-medium">
                                ExamCooker
                              </span>
                              .
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 text-blue-500 font-bold">
                              •
                            </span>
                            <span>
                              Actively engaged in cultural and fitness activities
                              through{" "}
                              <strong className={isDark ? "text-white" : "text-gray-900"}>
                                Yuva Marathi
                              </strong>{" "}
                              and the{" "}
                              <strong className={isDark ? "text-white" : "text-gray-900"}>
                                Cycling Club
                              </strong>
                              .
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <div className="mb-2 font-semibold uppercase tracking-wider text-[11px] text-gray-400">
                          Hackathons &amp; Achievements
                        </div>
                        <ul className="space-y-1.5 list-none">
                          <li className="flex items-start">
                            <span className="mr-2 text-blue-500 font-bold">
                              •
                            </span>
                            <span>
                              Passionate hackathon participant, having competed
                              and delivered innovative solutions in{" "}
                              <strong className={isDark ? "text-white" : "text-gray-900"}>
                                Yantra&apos;25
                              </strong>
                              ,{" "}
                              <strong className={isDark ? "text-white" : "text-gray-900"}>
                                DevJams
                              </strong>
                              , and the{" "}
                              <strong className={isDark ? "text-white" : "text-gray-900"}>
                                Caterpillar Hackathon
                              </strong>
                              .
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 text-blue-500 font-bold">
                              •
                            </span>
                            <span>
                              Demonstrated a disciplined learning mindset by
                              balancing intensive engineering coursework, competitive
                              coding, and leadership responsibilities.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notion Block 2: Deens Academy */}
              <div className="group relative -ml-6 pl-6">
                {/* Notion Hover Handle */}
                <div className="absolute left-0 top-3 hidden group-hover:flex items-center space-x-0.5 text-gray-400 cursor-grab">
                  <Plus className="h-3.5 w-3.5 hover:bg-black/5 dark:hover:bg-white/5 rounded" />
                  <GripVertical className="h-3.5 w-3.5 hover:bg-black/5 dark:hover:bg-white/5 rounded" />
                </div>

                <div
                  className={`rounded-xl border transition-all ${isDark
                    ? "bg-[#202020] border-[#2F2F2F] hover:border-[#404040]"
                    : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                    }`}
                >
                  <div
                    onClick={() => setExpandedSchool(!expandedSchool)}
                    className="flex items-start justify-between p-4 cursor-pointer"
                  >
                    <div className="flex items-start space-x-3.5">
                      <button
                        type="button"
                        className="mt-1 text-gray-400 hover:text-gray-600 transition-transform duration-150"
                      >
                        {expandedSchool ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                        <FaSchool className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2
                            className={`text-base font-semibold ${isDark ? "text-white" : "text-[#37352F]"
                              }`}
                          >
                            The Deens Academy
                          </h2>
                          <span className="rounded bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                            AISSCE (CBSE)
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                          Senior Secondary &amp; Secondary School Education
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="mr-1.5 h-3.5 w-3.5" />
                            Jun 2021 - Mar 2023
                          </span>
                          <span className="flex items-center font-medium text-emerald-500">
                            <Award className="mr-1.5 h-3.5 w-3.5" />
                            Grade 12: 90.8% | Grade 10: 92.2%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedSchool && (
                    <div
                      className={`border-t px-6 py-4 text-xs space-y-3 leading-relaxed ${isDark
                        ? "border-[#2F2F2F] text-gray-300"
                        : "border-gray-100 text-gray-600"
                        }`}
                    >
                      <p>
                        Deens Academy played a pivotal role in shaping my
                        thought process and personal development. It was where I
                        spent my formative years, learning invaluable life lessons
                        that continue to guide me today.
                      </p>
                      <p>
                        The school fostered intellectual curiosity and social
                        growth. Interacting with peers taught me to be sociable
                        and amiable, skills that remain crucial in building
                        meaningful relationships. My teachers, especially in
                        mathematics, played a key role in developing my analytical
                        and logical reasoning, which now aids me in algorithm
                        design and coding.
                      </p>
                      <p>
                        Beyond academics, Deens Academy&apos;s house system
                        fostered teamwork and camaraderie. As part of{" "}
                        <span className="font-semibold text-amber-500">
                          Flavus House (Yellow House)
                        </span>
                        , I developed leadership, a competitive spirit, and a
                        strong sense of belonging.
                      </p>
                      <p>
                        Reflecting on my journey, I am grateful for the
                        intellectual foundation and adaptability Deens Academy
                        nurtured in me. It remains integral to my growth, shaping
                        who I am today.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Notion Database Table View */
            <div
              className={`rounded-lg border overflow-hidden ${isDark ? "border-[#2F2F2F]" : "border-gray-200"
                }`}
            >
              <table className="w-full text-left text-xs">
                <thead
                  className={`border-b font-medium text-gray-400 ${isDark ? "bg-[#202020] border-[#2F2F2F]" : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <tr>
                    <th className="py-2.5 px-3">Institution</th>
                    <th className="py-2.5 px-3">Degree / Examination</th>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Score / GPA</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/20">
                  <tr
                    className={`transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                      }`}
                  >
                    <td className="py-3 px-3 font-medium flex items-center space-x-2">
                      <FaUniversity className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>Vellore Institute of Technology</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                      B.Tech CSE with Business Systems
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">2023 - 2027</td>
                    <td className="py-3 px-3 font-semibold text-emerald-500">
                      8.30 / 10
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[11px] font-medium text-blue-500">
                        In Progress
                      </span>
                    </td>
                  </tr>
                  <tr
                    className={`transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                      }`}
                  >
                    <td className="py-3 px-3 font-medium flex items-center space-x-2">
                      <FaSchool className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <span>The Deens Academy</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                      AISSCE Grade 12 (CBSE)
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">2021 - 2023</td>
                    <td className="py-3 px-3 font-semibold text-emerald-500">
                      90.8%
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-green-500/15 px-2 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr
                    className={`transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                      }`}
                  >
                    <td className="py-3 px-3 font-medium flex items-center space-x-2">
                      <FaSchool className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <span>The Deens Academy</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                      AISSE Grade 10 (CBSE)
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">2019 - 2021</td>
                    <td className="py-3 px-3 font-semibold text-emerald-500">
                      92.2%
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-green-500/15 px-2 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400">
                        Completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
