import { useState } from "react"
import { useNavigate } from "react-router-dom"

const TitleScreen = () => {
  const navigate = useNavigate()

  return (
    <div className="title-screen">
      <button onClick={() => navigate('/new-game')}>New Game</button>
      <button onClick={() => navigate('/load-game')}>Load Game</button>
      <button>Settings</button>
      <button onClick={() => window.electron.ipcRenderer.invoke('quit')}>Exit</button>
    </div>
  )
}

export default TitleScreen
