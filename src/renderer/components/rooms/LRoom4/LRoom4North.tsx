import { RenderedRoomProps } from "../../Room"

const LRoom4North = ({ game }: RenderedRoomProps) => {
  const characterInRoom = game.characterPositions.find(c => c.path === "lroom4" && c.direction === "n")

  return (
    <div>
      {characterInRoom !== undefined ? (
        <p>{characterInRoom.name} in this room</p>
      ) : null}
      <p>couch here</p>
    </div>
  )
}

export default LRoom4North
