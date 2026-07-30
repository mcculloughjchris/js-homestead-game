import { useState } from "react"
import { Conversation, Response } from "../../static/characterData"

interface CharacterConversationProps {
  game: any
  characterName: string
  triggerLabel?: string
}

const CharacterConversation = ({ game, characterName, triggerLabel = "Talk" }: CharacterConversationProps) => {
  console.log(characterName)
  const [ conversationData, setConversationData ] = useState<Conversation | null>(null)

  const startConversation = async () => {
    const result = await window.electron.ipcRenderer.invoke('convo-start', characterName, game)

    if (result) {
      setConversationData(result)
    }
  }

  const handleResponseButtonClick = async (r: Response) => {
    const result = await window.electron.ipcRenderer.invoke('convo-respond', r, conversationData?.id, game)

    if (result) {
      setConversationData(result)
    }
  }

  const handleContinueButtonClick = async () => {
    await window.electron.ipcRenderer.invoke('convo-end', conversationData?.id, game)
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
                key={r.text}
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

  return (
    <div>
      <button onClick={startConversation}>{triggerLabel}</button>
    </div>
  )
}

export default CharacterConversation
