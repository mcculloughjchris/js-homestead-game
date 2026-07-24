import { RenderedRoomProps } from "../../Room"
import CharacterConversation from "../../CharacterConversation"

const FrontDoorNorth = ({ game }: RenderedRoomProps) => {
  const currentlyAtDoor = game.characterPositions.find(c => c.path === "front-door" && c.direction === "n")

  if (currentlyAtDoor !== undefined) {
    return (
      <CharacterConversation
        game={game}
        characterName={currentlyAtDoor.name}
        triggerLabel="Answer door"
      />
    )
  }

  return (
    <div className="screen front-door-north"></div>
  )
}

export default FrontDoorNorth
