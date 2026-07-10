import { useState } from "react"
import { useNavigate } from "react-router-dom"

const NewGameScreen = () => {
  const navigate = useNavigate()

  const [ name, setName ] = useState("")

  const handleNameSubmit = async () => {
    if (name !== "") {
      const response = await window.electron.ipcRenderer.invoke('trigger-new-game', name)

      if (response) {
        navigate(`/${response.id}/lroom0/s`)
      }
    }
  }

  return (
    <div>
      <h1>New game</h1>
      <div>
        <label>What's your name?</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button
          type="button"
          onClick={handleNameSubmit}
        >Start</button>
      </div>
    </div>
  )
}

export default NewGameScreen
