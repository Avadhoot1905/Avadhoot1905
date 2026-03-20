"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { FaCloud, FaDove } from "react-icons/fa"

type Pipe = {
  id: number
  x: number
  gapY: number
  passed: boolean
}

const WORLD_WIDTH = 360
const WORLD_HEIGHT = 520
const BIRD_SIZE = 24
const BIRD_X = 80
const GRAVITY = 0.2
const JUMP_VELOCITY = -4.5
const PIPE_WIDTH = 64
const PIPE_GAP = 150
const PIPE_SPEED = 2.0 
const PIPE_SPAWN_GAP = 200

function randomGapY() {
  const min = 120
  const max = WORLD_HEIGHT - 120
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function FlappyBirdApp() {
  const { theme } = useTheme()
  const [birdY, setBirdY] = useState(WORLD_HEIGHT / 2)
  const [pipes, setPipes] = useState<Pipe[]>([{ id: 1, x: WORLD_WIDTH + 100, gapY: randomGapY(), passed: false }])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const frameRef = useRef<number | null>(null)
  const birdVelocityRef = useRef(0)
  const birdYRef = useRef(WORLD_HEIGHT / 2)
  const pipesRef = useRef<Pipe[]>([{ id: 1, x: WORLD_WIDTH + 100, gapY: randomGapY(), passed: false }])
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const startedRef = useRef(false)
  const nextPipeIdRef = useRef(2)

  useEffect(() => {
    const saved = localStorage.getItem("flappy-best-score")
    if (saved) {
      const parsed = Number(saved)
      if (!Number.isNaN(parsed)) setBestScore(parsed)
    }
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const resetGame = useCallback(() => {
    const initialPipes = [{ id: 1, x: WORLD_WIDTH + 100, gapY: randomGapY(), passed: false }]
    birdVelocityRef.current = 0
    birdYRef.current = WORLD_HEIGHT / 2
    pipesRef.current = initialPipes
    scoreRef.current = 0
    gameOverRef.current = false
    startedRef.current = false
    nextPipeIdRef.current = 2

    setBirdY(WORLD_HEIGHT / 2)
    setPipes(initialPipes)
    setScore(0)
    setGameOver(false)
    setStarted(false)
  }, [])

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    setStarted(false)
    startedRef.current = false

    if (scoreRef.current > bestScore) {
      setBestScore(scoreRef.current)
      localStorage.setItem("flappy-best-score", String(scoreRef.current))
    }
  }, [bestScore])

  const flap = useCallback(() => {
    if (gameOverRef.current) {
      resetGame()
      return
    }

    if (!startedRef.current) {
      startedRef.current = true
      setStarted(true)
    }

    birdVelocityRef.current = JUMP_VELOCITY
  }, [resetGame])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return
      event.preventDefault()
      if (isMobile) return
      flap()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [flap, isMobile])

  useEffect(() => {
    const tick = () => {
      if (!startedRef.current || gameOverRef.current) {
        frameRef.current = requestAnimationFrame(tick)
        return
      }

      birdVelocityRef.current += GRAVITY
      const nextBirdY = birdYRef.current + birdVelocityRef.current
      birdYRef.current = nextBirdY

      let nextPipes = pipesRef.current
        .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
        .filter((pipe) => pipe.x + PIPE_WIDTH > -10)

      const furthestX = nextPipes.length > 0 ? Math.max(...nextPipes.map((pipe) => pipe.x)) : 0
      if (nextPipes.length === 0 || furthestX < WORLD_WIDTH - PIPE_SPAWN_GAP) {
        nextPipes = [
          ...nextPipes,
          {
            id: nextPipeIdRef.current,
            x: WORLD_WIDTH + 20,
            gapY: randomGapY(),
            passed: false,
          },
        ]
        nextPipeIdRef.current += 1
      }

      let nextScore = scoreRef.current
      nextPipes = nextPipes.map((pipe) => {
        if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
          nextScore += 1
          return { ...pipe, passed: true }
        }
        return pipe
      })

      const birdTop = nextBirdY
      const birdBottom = nextBirdY + BIRD_SIZE
      const birdLeft = BIRD_X
      const birdRight = BIRD_X + BIRD_SIZE

      const hitBounds = birdTop <= 0 || birdBottom >= WORLD_HEIGHT
      const hitPipe = nextPipes.some((pipe) => {
        const pipeLeft = pipe.x
        const pipeRight = pipe.x + PIPE_WIDTH
        const overlapsX = birdRight > pipeLeft && birdLeft < pipeRight
        if (!overlapsX) return false

        const gapTop = pipe.gapY - PIPE_GAP / 2
        const gapBottom = pipe.gapY + PIPE_GAP / 2
        return birdTop < gapTop || birdBottom > gapBottom
      })

      pipesRef.current = nextPipes
      scoreRef.current = nextScore
      setBirdY(nextBirdY)
      setPipes(nextPipes)
      setScore(nextScore)

      if (hitBounds || hitPipe) {
        endGame()
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [endGame])

  return (
    <div className={`h-full w-full flex flex-col items-center justify-center p-4 ${theme === "dark" ? "bg-gray-900" : "bg-blue-50"}`}>
      <div className="w-full max-w-md flex items-center justify-between mb-3 px-1">
        <div className={`text-sm font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
          Score: <span className="text-emerald-500">{score}</span>
        </div>
        <div className={`text-sm font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
          Best: <span className="text-amber-500">{bestScore}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={flap}
        className={`relative w-full max-w-md h-[70vh] max-h-[520px] min-h-[380px] overflow-hidden rounded-2xl border-2 text-left ${
          theme === "dark" ? "border-gray-700 bg-sky-950" : "border-blue-200 bg-sky-200"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <FaCloud className={`absolute top-8 left-8 text-5xl ${theme === "dark" ? "text-white/30" : "text-white/80"}`} />
        <FaCloud className={`absolute top-16 right-12 text-4xl ${theme === "dark" ? "text-white/20" : "text-white/70"}`} />
        <FaCloud className={`absolute top-28 left-1/2 -translate-x-1/2 text-3xl ${theme === "dark" ? "text-white/20" : "text-white/60"}`} />

        {pipes.map((pipe) => {
          const gapTopHeight = Math.max(0, pipe.gapY - PIPE_GAP / 2)
          const gapBottomTop = pipe.gapY + PIPE_GAP / 2
          const gapBottomHeight = Math.max(0, WORLD_HEIGHT - gapBottomTop)

          return (
            <div key={pipe.id}>
              <div
                className="absolute bg-gradient-to-r from-green-600 to-green-500 border border-green-800"
                style={{
                  left: `${pipe.x}px`,
                  top: 0,
                  width: `${PIPE_WIDTH}px`,
                  height: `${gapTopHeight}px`,
                }}
              />
              <div
                className="absolute bg-green-700 border border-green-900 rounded-sm"
                style={{
                  left: `${pipe.x - 4}px`,
                  top: `${Math.max(0, gapTopHeight - 14)}px`,
                  width: `${PIPE_WIDTH + 8}px`,
                  height: "14px",
                }}
              />
              <div
                className="absolute bg-gradient-to-r from-green-600 to-green-500 border border-green-800"
                style={{
                  left: `${pipe.x}px`,
                  top: `${gapBottomTop}px`,
                  width: `${PIPE_WIDTH}px`,
                  height: `${gapBottomHeight}px`,
                }}
              />
              <div
                className="absolute bg-green-700 border border-green-900 rounded-sm"
                style={{
                  left: `${pipe.x - 4}px`,
                  top: `${gapBottomTop}px`,
                  width: `${PIPE_WIDTH + 8}px`,
                  height: "14px",
                }}
              />
            </div>
          )
        })}

        <div
          className="absolute flex items-center justify-center"
          style={{
            width: `${BIRD_SIZE}px`,
            height: `${BIRD_SIZE}px`,
            left: `${BIRD_X}px`,
            top: `${birdY}px`,
            transform: `rotate(${Math.min(30, Math.max(-30, birdVelocityRef.current * 4))}deg)`,
          }}
        >
          <FaDove className="text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]" size={26} />
        </div>

        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`px-4 py-3 rounded-xl text-center text-sm font-semibold ${theme === "dark" ? "bg-black/45 text-white" : "bg-white/80 text-gray-800"}`}>
              {isMobile ? "Tap to fly" : "Press Space to fly"}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`px-5 py-4 rounded-xl text-center ${theme === "dark" ? "bg-black/60 text-white" : "bg-white/90 text-gray-900"}`}>
              <p className="font-bold mb-1">Game Over</p>
              <p className="text-sm mb-3">Score: {score}</p>
              <p className="text-xs opacity-80">{isMobile ? "Tap to restart" : "Press Space or click to restart"}</p>
            </div>
          </div>
        )}
      </button>
    </div>
  )
}