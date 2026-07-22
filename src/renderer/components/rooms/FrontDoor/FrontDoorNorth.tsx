import { useEffect, useState } from "react"
import { RenderedRoomProps } from "../../Room"
import { Conversation, Response } from "../../../../static/characterData"

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

  const handleResponseButtonClick = async (r: Response) => {
    const result = await window.electron.ipcRenderer.invoke('convo-respond', r, conversationData?.id, game)

    if (result) {
      setConversationData(result)
    }
  }

  const handleContinueButtonClick = async () => {
    const result = await window.electron.ipcRenderer.invoke('convo-end', conversationData?.id, game)

    if (result) {
      // const ev = new CustomEvent('update-game-data', {
      //   detail: {
      //     data: result
      //   }
      // })
      // window.dispatchEvent(ev)
    }

    setConversationData(null)
  }

  if (conversationData !== null) {
    return (
      <div className="convo">
        <div className="convo-prompt">{conversationData.text}</div>
        <div className="convo-responses">
          {conversationData.responses?.map(r => {
            return (
              <button
                onClick={handleResponseButtonClick.bind(this, r)}
              >{r.text}</button>
            )
          })}
          {conversationData.responses?.length === 0 || conversationData.responses === null || conversationData.responses === undefined ? (
            <button onClick={handleContinueButtonClick}>Continue</button>
          ) : null}
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
    <div className="screen front-door-north"></div>
  )
}

export default FrontDoorNorth
