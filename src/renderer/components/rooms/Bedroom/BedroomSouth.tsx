import { useNavigate } from "react-router-dom"
import { RenderedRoomProps } from "../../Room"

const BedroomSouth = ({ game }: RenderedRoomProps) => {
  const navigate = useNavigate()

  const handleGoToSleepClick = () => {
    window.electron.ipcRenderer.invoke('sleep', game)
    navigate(`/${game.id}/sleeping`)
  }

  return (
    <div>
      <p>Bed here</p>
      <button onClick={handleGoToSleepClick}>Go to sleep</button>
    </div>
  )
}

export default BedroomSouth
