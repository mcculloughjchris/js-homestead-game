import { RenderedRoomProps } from "../../Room"
import CharacterConversation from "../../CharacterConversation"

const FrontDoorNorth = ({ game, setGame }: RenderedRoomProps) => {
  // const currentlyAtDoor = game.characterPositions.find(c => c.path === "front-door" && c.direction === "n")
  const currentlyAtDoor = game.currentDoor

  if (currentlyAtDoor) {
    return (
      <CharacterConversation
        game={game}
        setGame={setGame}
        characterName={currentlyAtDoor}
        triggerLabel="Answer door"
      />
    )
  }

  return (
    <div className="screen front-door-north"></div>
  )
}

export default FrontDoorNorth
