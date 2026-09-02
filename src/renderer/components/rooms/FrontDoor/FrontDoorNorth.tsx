import { RenderedRoomProps } from "../../Room"
import CharacterConversation from "../../CharacterConversation"

const FrontDoorNorth = ({ game, setGame }: RenderedRoomProps) => {
  const currentlyAtDoor = game.currentDoor
  const className = `screen front-door-north${game.inConversation ? ` in-conversation ${currentlyAtDoor} ` : ""}`

  if (currentlyAtDoor) {
    return (
      <div className={className}>
        <CharacterConversation
          game={game}
          setGame={setGame}
          characterName={currentlyAtDoor}
          triggerLabel="Answer door"
        />
      </div>
    )
  }

  return (
    <div className={className}></div>
  )
}

export default FrontDoorNorth
