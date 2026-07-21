import { useNavigate } from "react-router-dom"

interface PauseMenuProps {
  paused: boolean
}

const PauseMenu = ({ paused }: PauseMenuProps) => {
  const navigate = useNavigate()

  const handleMainMenuClick = () => {
    navigate('/title-screen')
  }

  const handleQuitGameButton = () => {
    window.electron.ipcRenderer.invoke('quit')
  }

  return (
    <div className={`pause-menu ${paused ? 'paused' : null}`}>
      <h1>Paused</h1>
      <ul>
        <li>
          <button
            onClick={handleMainMenuClick}
          >Main Menu</button>
        </li>
        <li>
          <button
            onClick={handleQuitGameButton}
          >Quit Game</button>
        </li>
      </ul>
    </div>
  )
}

export default PauseMenu
