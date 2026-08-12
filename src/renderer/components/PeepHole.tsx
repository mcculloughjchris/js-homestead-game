import { useEffect, useState } from 'react'
import peepHoleCoverImage from '../../../assets/ui/peep-hole-cover.png'
import peepHoleOpenImage from '../../../assets/ui/peep-hole-open.png'
import useGame from '../hooks/useGame'

const PeepHole = () => {
  const [ currentAnimation, setCurrentAnimation ] = useState<string>("")
  const { loading, game } = useGame()

  useEffect(() => {
    window.addEventListener('peep-hole-animation', (e: any) => {
      setCurrentAnimation(e.detail.animation)

      setTimeout(() => {
        setCurrentAnimation("")
      }, 7000)
    })
  }, [])

  if (loading) return null

  return (
    <div className={`peep-hole ${currentAnimation !== "" ? `${currentAnimation}-animation` : ""}`}>
      <img src={peepHoleCoverImage} className={`peep-hole-cover ${game.currentDoor !== undefined ? "uncovered" : ""}`} />
      <img src={peepHoleOpenImage} className="peep-hole-open" />
    </div>
  )
}

export default PeepHole
