import { useEffect, useState } from "react"
import { RenderedRoomProps } from "../../Room"
import { Conversation } from "../../../../static/characterData"

const FrontDoorNorth = ({ game }: RenderedRoomProps) => {
  const [ conversationData, setConversationData ] = useState<Conversation | null>(null)

  const currentlyAtDoor = game.characterPositions.find(c => c.position == 'front-door')

  const startConversation = async () => {
    if (currentlyAtDoor !== undefined) {
      const result = await window.electron.ipcRenderer.invoke('convo-start', currentlyAtDoor.name, game)

      if (result) {
        setConversationData(result)
      }
    }
  }

  const handleAnswerDoorClick = () => {
    startConversation()
  }

  if (conversationData !== null) {
    return (
      <div className="convo">
        <div className="convo-prompt">{conversationData.text}</div>
        <div className="convo-responses">
          {conversationData.responses?.map(r => {
            return (
              <button>{r.text}</button>
            )
          })}
        </div>
      </div>
    )
  }

  if (currentlyAtDoor !== undefined) {
    return (
      <div>
        <button onClick={handleAnswerDoorClick}>Answer door</button>
      </div>
    )
  }

  return (
    <div>
      Nobody at the door
    </div>
  )
}

export default FrontDoorNorth
