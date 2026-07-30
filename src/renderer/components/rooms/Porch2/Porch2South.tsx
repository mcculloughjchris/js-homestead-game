import { useNavigate } from "react-router-dom"
import useGame from "../../../hooks/useGame"

const Porch2South = () => {
  const { game } = useGame()
  const navigate = useNavigate()

  return (
    <div className="screen porch2-south">
      <p>porch2 south</p>
      <button onClick={() => {
        navigate(`/${game.id}/garden`)
      }}>Garden</button>
    </div>
  )
}

export default Porch2South
