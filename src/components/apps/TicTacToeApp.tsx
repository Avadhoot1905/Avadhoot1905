"use client"

import { useState } from "react"
import { useTheme } from "next-themes"

type Player = "X" | "O" | null

export function TicTacToeApp() {
  const { theme } = useTheme()
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [gameOver, setGameOver] = useState(false)

  const calculateWinner = (squares: Player[]): Player => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const getAvailableMoves = (squares: Player[]): number[] => {
    return squares.map((square, index) => (square === null ? index : -1)).filter((index) => index !== -1)
  }

  const minimax = (squares: Player[], isMaximizing: boolean): number => {
    const winner = calculateWinner(squares)
    
    // Terminal states
    if (winner === "O") return 10
    if (winner === "X") return -10
    if (squares.every((square) => square !== null)) return 0

    const availableMoves = getAvailableMoves(squares)

    if (isMaximizing) {
      let bestScore = -Infinity
      for (const move of availableMoves) {
        const newSquares = [...squares]
        newSquares[move] = "O"
        const score = minimax(newSquares, false)
        bestScore = Math.max(score, bestScore)
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (const move of availableMoves) {
        const newSquares = [...squares]
        newSquares[move] = "X"
        const score = minimax(newSquares, true)
        bestScore = Math.min(score, bestScore)
      }
      return bestScore
    }
  }

  const getBestMove = (squares: Player[]): number => {
    let bestScore = -Infinity
    let bestMove = -1
    const availableMoves = getAvailableMoves(squares)

    for (const move of availableMoves) {
      const newSquares = [...squares]
      newSquares[move] = "O"
      const score = minimax(newSquares, false)
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  const makeAIMove = (currentBoard: Player[]) => {
    const bestMove = getBestMove(currentBoard)
    if (bestMove !== -1) {
      const newBoard = [...currentBoard]
      newBoard[bestMove] = "O"
      setBoard(newBoard)

      const winner = calculateWinner(newBoard)
      if (winner) {
        setGameOver(true)
      } else if (newBoard.every((square) => square !== null)) {
        setGameOver(true)
      } else {
        setIsXNext(true)
      }
    }
  }

  const handleClick = (index: number) => {
    if (board[index] || gameOver || !isXNext) return

    // Player X's move
    const newBoard = [...board]
    newBoard[index] = "X"
    setBoard(newBoard)

    const winner = calculateWinner(newBoard)
    if (winner) {
      setGameOver(true)
      return
    }
    
    if (newBoard.every((square) => square !== null)) {
      setGameOver(true)
      return
    }

    // Switch to AI's turn
    setIsXNext(false)
    
    // AI makes move after a short delay for better UX
    setTimeout(() => {
      makeAIMove(newBoard)
    }, 500)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setGameOver(false)
  }

  const winner = calculateWinner(board)
  const isDraw = !winner && board.every((square) => square !== null)

  const getStatusMessage = () => {
    if (winner === "X") {
      return `🎉 You Win!`
    } else if (winner === "O") {
      return `🤖 AI Wins!`
    } else if (isDraw) {
      return "🤝 It's a Draw!"
    } else {
      return isXNext ? "Your Turn (X)" : "AI Thinking... (O)"
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center h-full p-6 ${
      theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-purple-100 to-pink-100"
    }`}>
      {/* Retro Header */}
      <div className="mb-6 text-center">
        <h1 className={`text-4xl font-bold mb-2 ${
          theme === "dark" 
            ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400" 
            : "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
        }`} style={{ fontFamily: "'Press Start 2P', cursive" }}>
          TIC TAC TOE
        </h1>
        <div className={`text-lg font-semibold px-4 py-2 rounded-lg ${
          theme === "dark" 
            ? "bg-gray-800 text-cyan-400 border-2 border-cyan-400" 
            : "bg-white text-purple-600 border-2 border-purple-600"
        } shadow-lg`}>
          {getStatusMessage()}
        </div>
      </div>

      {/* Retro Game Board */}
      <div className={`inline-block p-4 rounded-xl ${
        theme === "dark" 
          ? "bg-gray-800 shadow-2xl shadow-cyan-500/50" 
          : "bg-white shadow-2xl shadow-purple-500/50"
      } border-4 ${
        theme === "dark" ? "border-cyan-400" : "border-purple-600"
      }`}>
        <div className="grid grid-cols-3 gap-3">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={gameOver || cell !== null}
              className={`
                w-20 h-20 text-4xl font-bold rounded-lg
                transition-all duration-200 transform
                ${cell === null && !gameOver ? "hover:scale-105 cursor-pointer" : "cursor-not-allowed"}
                ${theme === "dark"
                  ? cell === "X"
                    ? "bg-cyan-600 text-cyan-100 shadow-lg shadow-cyan-500/50"
                    : cell === "O"
                    ? "bg-pink-600 text-pink-100 shadow-lg shadow-pink-500/50"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-500"
                  : cell === "X"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                  : cell === "O"
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-500/50"
                  : "bg-purple-50 hover:bg-purple-100 text-gray-300"
                }
                ${cell !== null ? "ring-2 ring-offset-2" : ""}
                ${cell === "X" && theme === "dark" ? "ring-cyan-400" : ""}
                ${cell === "O" && theme === "dark" ? "ring-pink-400" : ""}
                ${cell === "X" && theme !== "dark" ? "ring-purple-600" : ""}
                ${cell === "O" && theme !== "dark" ? "ring-pink-600" : ""}
              `}
            >
              {cell && (
                <span className="animate-in zoom-in duration-200">
                  {cell}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Retro Reset Button */}
      <button
        onClick={resetGame}
        className={`mt-6 px-6 py-3 text-lg font-bold rounded-lg
          transition-all duration-200 transform hover:scale-105 active:scale-95
          ${theme === "dark"
            ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-pink-500/50"
            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-pink-500/50"
          }
          border-2 ${theme === "dark" ? "border-cyan-300" : "border-purple-300"}
        `}
      >
        🔄 New Game
      </button>

      {/* Retro Score Info */}
      <div className="mt-4 text-center space-y-1">
        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          You are X, AI is O
        </p>
        <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
          Click on any square to make your move!
        </p>
      </div>
    </div>
  )
}
