"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"

type Board = (number | null)[][]
type Tile = {
  value: number
  id: string
  position: { row: number; col: number }
  isNew?: boolean
  isMerged?: boolean
}

const GRID_SIZE = 4
const WINNING_TILE = 2048

const getTileColor = (value: number | null): string => {
  if (!value) return "bg-gray-700/50"
  const colors: { [key: number]: string } = {
    2: "bg-yellow-200 text-gray-800",
    4: "bg-yellow-300 text-gray-800",
    8: "bg-orange-400 text-white",
    16: "bg-orange-500 text-white",
    32: "bg-orange-600 text-white",
    64: "bg-red-500 text-white",
    128: "bg-yellow-500 text-white",
    256: "bg-yellow-600 text-white",
    512: "bg-yellow-700 text-white",
    1024: "bg-amber-600 text-white",
    2048: "bg-amber-700 text-white",
  }
  return colors[value] || "bg-purple-600 text-white"
}

export function Game2048App() {
  const [board, setBoard] = useState<Board>([])
  const [tiles, setTiles] = useState<Tile[]>([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [moveDirection, setMoveDirection] = useState<"up" | "down" | "left" | "right" | null>(null)

  // Convert board to tiles for animation
  const boardToTiles = (board: Board): Tile[] => {
    const newTiles: Tile[] = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j]) {
          newTiles.push({
            value: board[i][j]!,
            id: `${i}-${j}-${board[i][j]}-${Date.now()}-${Math.random()}`,
            position: { row: i, col: j },
            isNew: false,
          })
        }
      }
    }
    return newTiles
  }

  // Initialize board
  const initializeBoard = useCallback((): Board => {
    const newBoard: Board = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null))
    addRandomTile(newBoard)
    addRandomTile(newBoard)
    return newBoard
  }, [])

  // Add random tile (2 or 4)
  const addRandomTile = (board: Board): boolean => {
    const emptyCells: [number, number][] = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!board[i][j]) emptyCells.push([i, j])
      }
    }
    if (emptyCells.length === 0) return false
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    board[row][col] = Math.random() < 0.9 ? 2 : 4
    return true
  }

  // Check if moves are available
  const canMove = (board: Board): boolean => {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!board[i][j]) return true
      }
    }
    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = board[i][j]
        if (j < GRID_SIZE - 1 && board[i][j + 1] === current) return true
        if (i < GRID_SIZE - 1 && board[i + 1][j] === current) return true
      }
    }
    return false
  }

  // Move tiles in a direction
  const move = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (gameOver || gameWon) return

      setMoveDirection(direction)
      const newBoard = board.map((row) => [...row])
      let moved = false
      let newScore = score

      const slide = (row: (number | null)[]): [(number | null)[], number] => {
        const filtered = row.filter((val) => val !== null)
        const merged: (number | null)[] = []
        let scoreGained = 0
        let i = 0

        while (i < filtered.length) {
          if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
            const mergedValue = (filtered[i]! * 2)
            merged.push(mergedValue)
            scoreGained += mergedValue
            if (mergedValue === WINNING_TILE) {
              setGameWon(true)
            }
            i += 2
          } else {
            merged.push(filtered[i])
            i++
          }
        }

        while (merged.length < GRID_SIZE) {
          merged.push(null)
        }

        return [merged, scoreGained]
      }

      if (direction === "left") {
        for (let i = 0; i < GRID_SIZE; i++) {
          const [newRow, scoreGained] = slide(newBoard[i])
          if (JSON.stringify(newRow) !== JSON.stringify(newBoard[i])) moved = true
          newBoard[i] = newRow as (number | null)[]
          newScore += scoreGained
        }
      } else if (direction === "right") {
        for (let i = 0; i < GRID_SIZE; i++) {
          const reversed = [...newBoard[i]].reverse()
          const [newRow, scoreGained] = slide(reversed)
          const final = (newRow as (number | null)[]).reverse()
          if (JSON.stringify(final) !== JSON.stringify(newBoard[i])) moved = true
          newBoard[i] = final
          newScore += scoreGained
        }
      } else if (direction === "up") {
        for (let j = 0; j < GRID_SIZE; j++) {
          const column = newBoard.map((row) => row[j])
          const [newCol, scoreGained] = slide(column)
          if (JSON.stringify(newCol) !== JSON.stringify(column)) moved = true
          for (let i = 0; i < GRID_SIZE; i++) {
            newBoard[i][j] = newCol[i]
          }
          newScore += scoreGained
        }
      } else if (direction === "down") {
        for (let j = 0; j < GRID_SIZE; j++) {
          const column = newBoard.map((row) => row[j]).reverse()
          const [newCol, scoreGained] = slide(column)
          const final = (newCol as (number | null)[]).reverse()
          if (JSON.stringify(final) !== JSON.stringify(newBoard.map((row) => row[j]))) moved = true
          for (let i = 0; i < GRID_SIZE; i++) {
            newBoard[i][j] = final[i]
          }
          newScore += scoreGained
        }
      }

      if (moved) {
        addRandomTile(newBoard)
        setBoard(newBoard)
        setTiles(boardToTiles(newBoard))
        setScore(newScore)
        if (newScore > highScore) {
          setHighScore(newScore)
          localStorage.setItem("2048-highscore", newScore.toString())
        }
        if (!canMove(newBoard)) {
          setGameOver(true)
        }
        setTimeout(() => setMoveDirection(null), 200)
      }
    },
    [board, score, gameOver, gameWon, highScore]
  )

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
        if (e.key === "ArrowUp") move("up")
        if (e.key === "ArrowDown") move("down")
        if (e.key === "ArrowLeft") move("left")
        if (e.key === "ArrowRight") move("right")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [move])

  // Initialize game
  useEffect(() => {
    const savedHighScore = localStorage.getItem("2048-highscore")
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
    const initialBoard = initializeBoard()
    setBoard(initialBoard)
    setTiles(boardToTiles(initialBoard))
  }, [initializeBoard])

  const resetGame = () => {
    const newBoard = initializeBoard()
    setBoard(newBoard)
    setTiles(boardToTiles(newBoard))
    setScore(0)
    setGameOver(false)
    setGameWon(false)
    setMoveDirection(null)
  }

  const getAnimationVariants = (direction: "up" | "down" | "left" | "right" | null) => {
    if (!direction) return { x: 0, y: 0 }
    
    const offset = 20
    switch (direction) {
      case "up":
        return { x: 0, y: offset }
      case "down":
        return { x: 0, y: -offset }
      case "left":
        return { x: offset, y: 0 }
      case "right":
        return { x: -offset, y: 0 }
      default:
        return { x: 0, y: 0 }
    }
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 flex flex-col items-center justify-center p-4 overflow-auto">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-5xl font-bold text-yellow-300 mb-2 retro-text shadow-lg">
            2048
          </h1>
          <p className="text-yellow-200 text-sm mb-3 font-mono">
            Use arrow keys to play
          </p>
        </div>

        {/* Scores */}
        <div className="flex justify-between mb-4 gap-3">
          <div className="bg-yellow-600/80 backdrop-blur-sm px-4 py-2 rounded-lg flex-1 border-2 border-yellow-400 shadow-lg">
            <div className="text-yellow-200 text-xs font-bold uppercase">Score</div>
            <div className="text-white text-2xl font-bold font-mono">{score}</div>
          </div>
          <div className="bg-orange-600/80 backdrop-blur-sm px-4 py-2 rounded-lg flex-1 border-2 border-orange-400 shadow-lg">
            <div className="text-orange-200 text-xs font-bold uppercase">Best</div>
            <div className="text-white text-2xl font-bold font-mono">{highScore}</div>
          </div>
          <button
            onClick={resetGame}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold uppercase text-sm border-2 border-red-400 shadow-lg transition-all hover:scale-105"
          >
            New Game
          </button>
        </div>

        {/* Game Board */}
        <div className="bg-yellow-800/50 backdrop-blur-sm p-3 rounded-xl border-4 border-yellow-600 shadow-2xl relative">
          {/* Background Grid */}
          <div className="grid grid-cols-4 gap-3 relative">
            {Array.from({ length: 16 }).map((_, index) => (
              <div
                key={`bg-${index}`}
                className="aspect-square rounded-lg bg-gray-700/50 border-2 border-yellow-700/30"
              />
            ))}
          </div>

          {/* Animated Tiles */}
          <div className="absolute inset-0 p-3">
            <div className="relative w-full h-full">
              {tiles.map((tile) => {
                const cellSize = `calc((100% - 2.25rem) / 4)` // Account for gaps
                const left = `calc(${tile.position.col} * (${cellSize} + 0.75rem))`
                const top = `calc(${tile.position.row} * (${cellSize} + 0.75rem))`
                const animationOffset = getAnimationVariants(moveDirection)

                return (
                  <motion.div
                    key={tile.id}
                    initial={
                      tile.isNew
                        ? { scale: 0, left, top }
                        : { 
                            left, 
                            top,
                            x: animationOffset.x,
                            y: animationOffset.y,
                            scale: 1
                          }
                    }
                    animate={{ 
                      left, 
                      top, 
                      scale: 1,
                      x: 0,
                      y: 0
                    }}
                    transition={{ 
                      duration: 0.15,
                      ease: "easeOut"
                    }}
                    className={`absolute rounded-lg flex items-center justify-center text-2xl font-bold border-2 border-yellow-900 shadow-lg ${getTileColor(
                      tile.value
                    )}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      fontFamily: "'Press Start 2P', monospace",
                    }}
                  >
                    {tile.value}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Game Over / Win Overlay */}
        {(gameOver || gameWon) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-black/80 backdrop-blur-sm p-6 rounded-xl border-4 border-yellow-500 text-center shadow-2xl"
          >
            <h2 className="text-3xl font-bold mb-2" style={{ color: gameWon ? "#ffd700" : "#ff6b6b" }}>
              {gameWon ? "🎉 You Won! 🎉" : "Game Over!"}
            </h2>
            <p className="text-yellow-200 text-lg mb-4 font-mono">
              Final Score: <span className="font-bold text-white">{score}</span>
            </p>
            <button
              onClick={resetGame}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold uppercase border-2 border-green-400 shadow-lg transition-all hover:scale-105"
            >
              Play Again
            </button>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-center text-yellow-200 text-xs font-mono bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-yellow-600">
          <p className="mb-1">🎮 Use arrow keys to move tiles</p>
          <p>🎯 Combine same numbers to reach 2048!</p>
        </div>
      </div>

      <style jsx>{`
        .retro-text {
          text-shadow: 
            3px 3px 0px rgba(0, 0, 0, 0.3),
            -1px -1px 0px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}
