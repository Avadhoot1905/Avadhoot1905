"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Obstacle = {
  id: number
  x: number
  width: number
  height: number
  sprite: "single" | "multi"
}

interface DinoGameProps {
  className?: string
}

const GAME_WIDTH = 560
const GAME_HEIGHT = 180
const GROUND_HEIGHT = 32
const DINO_WIDTH = 36
const DINO_HEIGHT = 38
const DINO_X = 52
const DINO_GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT

const SPRITES = {
  cactusSingle: "https://upload.wikimedia.org/wikipedia/commons/a/af/1_Cactus_Chrome_Dino.webp",
  cactusMulti: "https://upload.wikimedia.org/wikipedia/commons/6/6b/3_Cactus_Chrome_Dino.webp",
  dinoLeft: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Chrome_T-Rex_Left_Run.webp",
  dinoRight: "https://upload.wikimedia.org/wikipedia/commons/9/91/Chrome_T-Rex_Right_Run.webp",
}

export function DinoGame({ className = "" }: DinoGameProps) {
  const [dinoY, setDinoY] = useState(DINO_GROUND_Y)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [score, setScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [dinoFrame, setDinoFrame] = useState<"left" | "right">("left")

  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number>(0)
  const velocityYRef = useRef(0)
  const dinoYRef = useRef(DINO_GROUND_Y)
  const obstaclesRef = useRef<Obstacle[]>([])
  const scoreRef = useRef(0)
  const nextObstacleIdRef = useRef(1)
  const spawnCooldownRef = useRef(0)
  const dinoFrameRef = useRef<"left" | "right">("left")
  const runFrameElapsedRef = useRef(0)
  const lastCactusSpriteRef = useRef<"single" | "multi">("single")
  const sameSpriteStreakRef = useRef(0)

  const syncState = useCallback(() => {
    setDinoY(dinoYRef.current)
    setObstacles([...obstaclesRef.current])
    setScore(Math.floor(scoreRef.current))
  }, [])

  const resetGame = useCallback((startRunning = false) => {
    velocityYRef.current = 0
    dinoYRef.current = DINO_GROUND_Y
    obstaclesRef.current = []
    scoreRef.current = 0
    spawnCooldownRef.current = 45
    runFrameElapsedRef.current = 0
    dinoFrameRef.current = "left"
    lastCactusSpriteRef.current = "single"
    sameSpriteStreakRef.current = 0
    setDinoFrame("left")
    setIsGameOver(false)
    setIsRunning(startRunning)
    syncState()
  }, [syncState])

  const jump = useCallback(() => {
    if (isGameOver) {
      resetGame(true)
      return
    }

    if (!isRunning) {
      setIsRunning(true)
      return
    }

    const onGround = dinoYRef.current >= DINO_GROUND_Y - 0.5
    if (onGround) {
      velocityYRef.current = -9.5
    }
  }, [isGameOver, isRunning, resetGame])

  useEffect(() => {
    const preloaded: HTMLImageElement[] = []
    Object.values(SPRITES).forEach((url) => {
      const image = new Image()
      image.src = url
      preloaded.push(image)
    })

    return () => {
      preloaded.length = 0
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault()
        jump()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [jump])

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp
      }

      const dt = Math.min(32, timestamp - lastFrameRef.current)
      lastFrameRef.current = timestamp
      const frameScale = dt / 16.67

      if (isRunning && !isGameOver) {
        velocityYRef.current += 0.48 * frameScale
        dinoYRef.current += velocityYRef.current * frameScale

        if (dinoYRef.current > DINO_GROUND_Y) {
          dinoYRef.current = DINO_GROUND_Y
          velocityYRef.current = 0
        }

        const isGrounded = dinoYRef.current >= DINO_GROUND_Y - 0.5
        if (isGrounded) {
          runFrameElapsedRef.current += dt
          if (runFrameElapsedRef.current >= 110) {
            runFrameElapsedRef.current = 0
            dinoFrameRef.current = dinoFrameRef.current === "left" ? "right" : "left"
            setDinoFrame(dinoFrameRef.current)
          }
        }

        const speed = Math.min(9, 4 + scoreRef.current / 180)
        obstaclesRef.current = obstaclesRef.current
          .map((obstacle) => ({
            ...obstacle,
            x: obstacle.x - speed * frameScale,
          }))
          .filter((obstacle) => obstacle.x + obstacle.width > -8)

        spawnCooldownRef.current -= frameScale
        if (spawnCooldownRef.current <= 0) {
          // Dynamic spawn weights with anti-streak behavior for better variety.
          const dynamicMultiChance = 0.28 + Math.random() * 0.44
          let sprite: "single" | "multi" = Math.random() < dynamicMultiChance ? "multi" : "single"

          if (sameSpriteStreakRef.current >= 2) {
            sprite = lastCactusSpriteRef.current === "multi" ? "single" : "multi"
          }

          if (sprite === lastCactusSpriteRef.current) {
            sameSpriteStreakRef.current += 1
          } else {
            sameSpriteStreakRef.current = 0
          }
          lastCactusSpriteRef.current = sprite

          const multiCactus = sprite === "multi"
          obstaclesRef.current.push({
            id: nextObstacleIdRef.current++,
            x: GAME_WIDTH + 16,
            width: multiCactus ? 46 : 19,
            height: multiCactus ? 31 : 33,
            sprite,
          })
          spawnCooldownRef.current = 52 + Math.random() * 42
        }

        const dinoLeft = DINO_X + 2
        const dinoRight = DINO_X + DINO_WIDTH - 2
        const dinoTop = dinoYRef.current + 2
        const dinoBottom = dinoYRef.current + DINO_HEIGHT - 2

        const hasCollision = obstaclesRef.current.some((obstacle) => {
          const obstacleTop = GAME_HEIGHT - GROUND_HEIGHT - obstacle.height
          const obstacleBottom = GAME_HEIGHT - GROUND_HEIGHT
          const obstacleLeft = obstacle.x
          const obstacleRight = obstacle.x + obstacle.width

          return (
            dinoRight > obstacleLeft &&
            dinoLeft < obstacleRight &&
            dinoBottom > obstacleTop &&
            dinoTop < obstacleBottom
          )
        })

        if (hasCollision) {
          setIsGameOver(true)
          setIsRunning(false)
        } else {
          scoreRef.current += 0.58 * frameScale
        }
      }

      syncState()
      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isGameOver, isRunning, syncState])

  useEffect(() => {
    resetGame()
  }, [resetGame])

  return (
    <div className={`w-full max-w-[560px] ${className}`}>
      <div
        className="relative w-full overflow-hidden rounded-xl border border-black/10 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-black/20"
        style={{ height: `${GAME_HEIGHT}px` }}
        onClick={jump}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.code === "Space" || event.code === "Enter") {
            event.preventDefault()
            jump()
          }
        }}
        aria-label="Dino mini-game"
      >
        <div className="absolute left-4 top-3 text-[11px] tracking-wide text-black/60 dark:text-white/60">
          SCORE {score}
        </div>

        <div
          className="absolute left-0 right-0 border-t border-black/10 dark:border-white/10"
          style={{ top: `${GAME_HEIGHT - GROUND_HEIGHT}px` }}
        />

        <div
          className="absolute"
          style={{
            left: `${DINO_X}px`,
            top: `${dinoY}px`,
            width: `${DINO_WIDTH}px`,
            height: `${DINO_HEIGHT}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dinoFrame === "left" ? SPRITES.dinoLeft : SPRITES.dinoRight}
            alt="Dino runner"
            className="h-full w-full select-none object-contain"
            draggable={false}
          />
        </div>

        {obstacles.map((obstacle) => (
          <div
            key={obstacle.id}
            className="absolute"
            style={{
              left: `${obstacle.x}px`,
              width: `${obstacle.width}px`,
              height: `${obstacle.height}px`,
              top: `${GAME_HEIGHT - GROUND_HEIGHT - obstacle.height}px`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={obstacle.sprite === "multi" ? SPRITES.cactusMulti : SPRITES.cactusSingle}
              alt="Cactus obstacle"
              className="h-full w-full select-none object-contain"
              draggable={false}
            />
          </div>
        ))}

        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[1px] dark:bg-black/45">
            <div className="rounded-lg border border-black/10 bg-white/70 px-4 py-2 text-center text-xs text-black/75 shadow-sm dark:border-white/15 dark:bg-black/40 dark:text-white/80">
              <p className="font-medium tracking-wide">GAME OVER</p>
              <p className="mt-1 text-[11px]">Press space or click to restart</p>
            </div>
          </div>
        )}

        {!isGameOver && score < 4 && (
          <div className="absolute inset-x-0 bottom-3 text-center text-[11px] text-black/50 dark:text-white/50">
            {isRunning ? "Press space or click to jump" : "Press space or click to start"}
          </div>
        )}
      </div>
    </div>
  )
}