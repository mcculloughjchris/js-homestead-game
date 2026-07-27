import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useGame from "../hooks/useGame"

const Sleeping = () => {
  const navigate = useNavigate()
  const { game } = useGame()

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate(`/${game.id}/bedroom/s`)
    }, 3000)

    return () => {
      clearTimeout(timeout)
    }
  }, [game])

  return (
    <div>
      Sleep animation goes here
    </div>
  )
}

export default Sleeping
