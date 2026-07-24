import { useNavigate, useParams } from "react-router-dom"
import { campableRooms } from "../../static/mapData"
import useGame from "../hooks/useGame"
import { useEffect } from "react"

const SetCharacterPosition = () => {
  const navigate = useNavigate()
  const { game } = useGame()
  const { character }= useParams()

  useEffect(() => {
    window.electron.ipcRenderer.on('character-position-set', () => {
      navigate(`/${game.id}/front-door/n`)
    })
  }, [])

  const handleCampableClick = (campable) => {
    window.electron.ipcRenderer.invoke('set-character-position', game, character, campable)
  }

  return (
    <div>
      <p>Where to put {character}?</p>
      {campableRooms.map(campable => {
        const roomIsTaken = game.characterPositions.find(charPos => charPos.path === campable.path && charPos.direction === campable.direction) !== undefined
        console.log(roomIsTaken)

        if (!roomIsTaken) {
          return (
            <button onClick={handleCampableClick.bind(this, campable)}>
              {campable.name}
            </button>
          )
        }

        return null
      })}
    </div>
  )
}

export default SetCharacterPosition
