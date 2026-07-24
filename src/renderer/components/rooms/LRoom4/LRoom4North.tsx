import { RenderedRoomProps } from "../../Room"
import CharacterConversation from "../../CharacterConversation"

const LRoom4North = ({ game }: RenderedRoomProps) => {
  const characterInRoom = game.characterPositions.find(c => c.path === "lroom4" && c.direction === "n")

  return (
    <div>
      {characterInRoom !== undefined ? (
        <CharacterConversation
          game={game}
          characterName={characterInRoom.name}
        />
      ) : null}
      <p>couch here</p>
    </div>
  )
}

export default LRoom4North
