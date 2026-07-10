import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const LoadGameScreen = () => {
  const [ saves, setSaves ] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    const loadSaves = async () => {
      const list = await window.electron.ipcRenderer.invoke('list-saves', null)

      if (list.length > 0) {
        setSaves(list)
      }
    }

    loadSaves()
  }, [])

  const handleSaveClick = (save) => {
    const id = save[0]
    const { currentLocation, currentDirection } = save[1]

    navigate(`/${id}/${currentLocation}/${currentDirection}`)
  }

  return (
    <ul>
      {saves.map(save => {
        return (
          <li
            onClick={handleSaveClick.bind(this, save)}
            key={save[0]}
          >{save[1].name}</li>
        )
      })}
    </ul>
  )
}

export default LoadGameScreen
