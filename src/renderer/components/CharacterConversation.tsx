import { useState } from "react"
import { Conversation, Response } from "../../static/characterData"
import InventoryTransfer from "./InventoryTransfer"
import { PLAYER_INVENTORY_ID } from "../../static/inventory"

interface CharacterConversationProps {
  game: any
  setGame: (updater: any) => void
  characterName: string
  triggerLabel?: string
}

const CharacterConversation = ({ game, setGame, characterName, triggerLabel = "Talk" }: CharacterConversationProps) => {
  const [ conversationData, setConversationData ] = useState<Conversation | null>(null)
  const [ trading, setTrading ] = useState(false)

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

  if (trading) {
    return (
      <div className="convo">
        <InventoryTransfer
          game={game}
          setGame={setGame}
          fromOwnerId={PLAYER_INVENTORY_ID}
          toOwnerId={characterName}
          fromLabel="You"
          toLabel={characterName}
        />
        <button onClick={() => setTrading(false)}>Close</button>
      </div>
    )
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
      <button onClick={() => setTrading(true)}>Trade</button>
    </div>
  )
}

export default CharacterConversation
