import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import compy from '../../../assets/intro/compy.png'
import hand from '../../../assets/intro/hand.png'
import boss from '../../../assets/intro/boss.png'
import gf from '../../../assets/intro/gf.png'
import kvm from '../../../assets/intro/kvmswitch.png'

interface Animations {
  [k: string]: {
    [x: number]: {
      [z: string]: any
    }
  }
}

const animations: Animations = {
  hand: {
    0: {
      transform: 'translate(0, 25vh)'
    },
    1000: {
      transform: 'translate(-15vw, 18vh)'
    },
    1100: {
      transform: 'translate(0, 25vh)'
    },
    2000: {
      transform: 'translate(-15vw, 18vh)'
    },
    2200: {
      transform: 'translate(0, 25vh)'
    },
    3000: {
      transform: 'translate(-15vw, 18vh)'
    },
    3300: {
      transform: 'translate(0, 25vh)'
    }
  },
  boss: {
    0: {
      opacity: 0,
      transform: 'translate(0, 0)'
    },
    1100: {
      opacity: 1,
      transform: 'translate(0, -2vh)'
    },
    2200: {
      opacity: 0,
      display: 'none'
    }
  },
  gf: {
    0: {
      opacity: 0
    },
    2200: {
      opacity: 1,
      transform: 'translate(0, -2vh)'
    },
    3300: {
      opacity: 0,
      display: 'none'
    }
  },
  kvm: {
    0: {
      opacity: 0
    },
    3300: {
      opacity: 1
    }
  }
}


const Introduction = () => {
  const [ animationMs, setAnimationMs ] = useState<number>(0)
  const navigate = useNavigate()

  const redirectToTitleScreen = () => {
    navigate('/title-screen')
  }

  const currentFrameCSS = (x: string) => {
    if (animations[x] === undefined) return
    if (animations[x][animationMs] !== undefined) return animations[x][animationMs]

    const lastAnimation = Object.keys(animations[x]).map(k => parseInt(k)).filter(k => k <= animationMs)

    return animations[x][lastAnimation[lastAnimation.length - 1]]
  }

  const handleInterval = () => {
    setAnimationMs(animationMs + 100)

    if (animationMs >= 4000) {
      redirectToTitleScreen()
    }
  }

  useEffect(() => {
    const timeout = setTimeout(handleInterval, 100)

    return () => {
      clearTimeout(timeout)
    }
  }, [animationMs])

  useEffect(() => {
    const handleKeyDown = ({ key }) => {
      redirectToTitleScreen()
    }

    const handleClick = () => {
      redirectToTitleScreen()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <div className="intro">
      <img src={compy} className="compy" />
      <img
        src={hand}
        className="hand"
        style={currentFrameCSS('hand')}
      />
      <img
        src={boss}
        className="boss"
        style={currentFrameCSS('boss')}
      />
      <img
        src={gf}
        className="gf"
        style={currentFrameCSS('gf')}
      />
      <img
        src={kvm}
        className="kvm"
        style={currentFrameCSS('kvm')}
      />
    </div>
  )
}

export default Introduction
