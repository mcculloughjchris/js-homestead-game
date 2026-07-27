import Calendar from "../../Calendar"
import { RenderedRoomProps } from "../../Room"

const LRoom0North = ({ game }: RenderedRoomProps) => {
  const handleSaveGame = async () => {
    const data = await window.electron.ipcRenderer.invoke("save-game", game)

    const toast = new CustomEvent("toast", {
      detail: {
        message: "Saved!",
        type: "success"
      }
    })

    window.dispatchEvent(toast)

    const saved = new CustomEvent("saved", {
      detail: { data }
    })

    window.dispatchEvent(saved)
  }

  return (
    <div>
      <div className="door">
        <button onClick={handleSaveGame}>save game</button>
        <Calendar game={game}  />
      </div>
    </div>
  )
}

export default LRoom0North
