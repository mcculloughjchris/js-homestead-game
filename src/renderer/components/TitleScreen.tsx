import { useState } from "react"
import { useNavigate } from "react-router-dom"

const TitleScreen = () => {
  const navigate = useNavigate()

  return (
    <div>
      <button onClick={() => navigate('/new-game')}>New Game</button>
      <button onClick={() => navigate('/load-game')}>Load Game</button>
      <button>Settings</button>
      <button>Exit</button>
    </div>
  )
}

export default TitleScreen
