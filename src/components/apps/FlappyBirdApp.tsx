"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Application, Container, Graphics, Text } from "pixi.js"

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
const GRAVITY = 0.15
const JUMP_VELOCITY = -4.5
const PIPE_WIDTH = 64
const PIPE_GAP = 150
const PIPE_SPEED = 2.0 
const PIPE_SPAWN_GAP = 230
const GROUND_HEIGHT = 26

function randomGapY() {
  const min = 120
  const max = WORLD_HEIGHT - 120
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function FlappyBirdApp() {
  const { theme } = useTheme()
  const pixiHostRef = useRef<HTMLDivElement | null>(null)
  const appRef = useRef<Application | null>(null)
  const birdGraphicsRef = useRef<Graphics | null>(null)
  const pipesGraphicsRef = useRef<Graphics | null>(null)
  const hudScoreRef = useRef<Text | null>(null)
  const hudBestRef = useRef<Text | null>(null)
  const hintTextRef = useRef<Text | null>(null)
  const gameOverTextRef = useRef<Text | null>(null)

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
  const bestScoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const startedRef = useRef(false)
  const nextPipeIdRef = useRef(2)

  useEffect(() => {
    bestScoreRef.current = bestScore
  }, [bestScore])

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

    if (scoreRef.current > bestScoreRef.current) {
      setBestScore(scoreRef.current)
      localStorage.setItem("flappy-best-score", String(scoreRef.current))
    }
  }, [])

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
    let isMounted = true

    const init = async () => {
      if (!pixiHostRef.current) return

      const app = new Application()
      await app.init({
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
        antialias: true,
        backgroundAlpha: 0,
      })

      if (!isMounted || !pixiHostRef.current) {
        app.destroy(true)
        return
      }

      appRef.current = app
      pixiHostRef.current.innerHTML = ""
      app.canvas.style.width = "100%"
      app.canvas.style.height = "100%"
      app.canvas.style.display = "block"
      pixiHostRef.current.appendChild(app.canvas)

      const root = new Container()
      app.stage.addChild(root)

      const background = new Graphics()
      background.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT).fill(theme === "dark" ? 0x0c2b48 : 0x76d3ff)
      root.addChild(background)

      const clouds = new Graphics()
      const cloudColor = theme === "dark" ? 0x9fc2dd : 0xffffff
      const cloudAlpha = theme === "dark" ? 0.25 : 0.75
      const cloudSets = [
        { x: 65, y: 70, s: 1 },
        { x: 260, y: 120, s: 0.8 },
        { x: 170, y: 185, s: 0.65 },
      ]
      cloudSets.forEach((cloud) => {
        const radius = 16 * cloud.s
        clouds.circle(cloud.x, cloud.y, radius).fill({ color: cloudColor, alpha: cloudAlpha })
        clouds.circle(cloud.x + 15 * cloud.s, cloud.y - 6 * cloud.s, radius * 0.85).fill({ color: cloudColor, alpha: cloudAlpha })
        clouds.circle(cloud.x + 30 * cloud.s, cloud.y, radius * 0.95).fill({ color: cloudColor, alpha: cloudAlpha })
      })
      root.addChild(clouds)

      const pipesGraphics = new Graphics()
      pipesGraphicsRef.current = pipesGraphics
      root.addChild(pipesGraphics)

      const ground = new Graphics()
      ground.rect(0, WORLD_HEIGHT - GROUND_HEIGHT, WORLD_WIDTH, GROUND_HEIGHT).fill(0xcd8c42)
      ground.rect(0, WORLD_HEIGHT - GROUND_HEIGHT, WORLD_WIDTH, 5).fill(0xb47033)
      root.addChild(ground)

      const bird = new Graphics()
      birdGraphicsRef.current = bird
      root.addChild(bird)

      const scoreText = new Text({
        text: "Score: 0",
        style: {
          fill: 0xffffff,
          fontSize: 20,
          fontWeight: "700",
          stroke: { color: 0x223344, width: 4 },
        },
      })
      scoreText.position.set(14, 14)
      hudScoreRef.current = scoreText
      root.addChild(scoreText)

      const bestText = new Text({
        text: `Best: ${bestScoreRef.current}`,
        style: {
          fill: 0xffea74,
          fontSize: 20,
          fontWeight: "700",
          stroke: { color: 0x5a3e00, width: 4 },
        },
      })
      bestText.anchor.set(1, 0)
      bestText.position.set(WORLD_WIDTH - 14, 14)
      hudBestRef.current = bestText
      root.addChild(bestText)

      const hintText = new Text({
        text: isMobile ? "Tap to fly" : "Press Space to fly",
        style: {
          fill: 0xffffff,
          fontSize: 22,
          fontWeight: "700",
          stroke: { color: 0x223344, width: 5 },
        },
      })
      hintText.anchor.set(0.5)
      hintText.position.set(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)
      hintTextRef.current = hintText
      root.addChild(hintText)

      const gameOverText = new Text({
        text: "",
        style: {
          fill: 0xffffff,
          fontSize: 24,
          fontWeight: "700",
          align: "center",
          stroke: { color: 0x000000, width: 5 },
        },
      })
      gameOverText.anchor.set(0.5)
      gameOverText.position.set(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)
      gameOverText.visible = false
      gameOverTextRef.current = gameOverText
      root.addChild(gameOverText)
    }

    init()

    return () => {
      isMounted = false
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
      birdGraphicsRef.current = null
      pipesGraphicsRef.current = null
      hudScoreRef.current = null
      hudBestRef.current = null
      hintTextRef.current = null
      gameOverTextRef.current = null
    }
  }, [isMobile, theme])

  const renderScene = useCallback(() => {
    const birdGraphics = birdGraphicsRef.current
    const pipesGraphics = pipesGraphicsRef.current
    const scoreText = hudScoreRef.current
    const bestText = hudBestRef.current
    const hintText = hintTextRef.current
    const gameOverText = gameOverTextRef.current

    if (!birdGraphics || !pipesGraphics || !scoreText || !bestText || !hintText || !gameOverText) return

    pipesGraphics.clear()

    pipesRef.current.forEach((pipe) => {
      const gapTopHeight = Math.max(0, pipe.gapY - PIPE_GAP / 2)
      const gapBottomTop = pipe.gapY + PIPE_GAP / 2
      const gapBottomHeight = Math.max(0, WORLD_HEIGHT - GROUND_HEIGHT - gapBottomTop)

      pipesGraphics.rect(pipe.x, 0, PIPE_WIDTH, gapTopHeight).fill(0x33b551)
      pipesGraphics.rect(pipe.x - 5, Math.max(0, gapTopHeight - 14), PIPE_WIDTH + 10, 14).fill(0x258842)
      pipesGraphics.rect(pipe.x, gapBottomTop, PIPE_WIDTH, gapBottomHeight).fill(0x33b551)
      pipesGraphics.rect(pipe.x - 5, gapBottomTop, PIPE_WIDTH + 10, 14).fill(0x258842)
    })

    birdGraphics.clear()
    birdGraphics.ellipse(0, 0, 12, 10).fill(0xffd84d)
    birdGraphics.ellipse(-3, 1, 6, 5).fill(0xffc61f)
    birdGraphics.roundRect(11, -1, 5, 3, 1).fill(0xff8c42)
    birdGraphics.circle(7, -3, 2.5).fill(0xffffff)
    birdGraphics.circle(8, -3, 1.2).fill(0x111111)
    birdGraphics.position.set(BIRD_X + BIRD_SIZE / 2 - 2, birdYRef.current + BIRD_SIZE / 2)
    birdGraphics.rotation = Math.max(-0.5, Math.min(0.45, birdVelocityRef.current * 0.08))

    scoreText.text = `Score: ${scoreRef.current}`
    bestText.text = `Best: ${bestScoreRef.current}`
    hintText.text = isMobile ? "Tap to fly" : "Press Space to fly"
    hintText.visible = !startedRef.current && !gameOverRef.current

    if (gameOverRef.current) {
      gameOverText.visible = true
      gameOverText.text = isMobile
        ? `Game Over\nScore: ${scoreRef.current}\nTap to restart`
        : `Game Over\nScore: ${scoreRef.current}\nPress Space to restart`
    } else {
      gameOverText.visible = false
    }
  }, [isMobile])

  useEffect(() => {
    const tick = () => {
      if (!startedRef.current || gameOverRef.current) {
        renderScene()
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

      const hitBounds = birdTop <= 0 || birdBottom >= WORLD_HEIGHT - GROUND_HEIGHT
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
      setScore((prev) => (prev === nextScore ? prev : nextScore))

      if (hitBounds || hitPipe) {
        endGame()
      }

      renderScene()

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [endGame, renderScene])

  useEffect(() => {
    renderScene()
  }, [renderScene, score, started, gameOver, isMobile])

  return (
    <div
      className={`h-full w-full overflow-hidden ${theme === "dark" ? "bg-gray-900" : "bg-blue-50"}`}
      onClick={() => {
        if (isMobile || gameOver) flap()
      }}
    >
      <div className="relative h-full w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div ref={pixiHostRef} className="h-full w-full" />
      </div>
    </div>
  )
}