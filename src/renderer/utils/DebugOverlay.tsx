import { useEffect, useState } from "react"

const DebugOverlay = () => {
  const [active, setActive] = useState(false)

  useEffect(() => {
    window.enableDebugger = () => {
      setActive(true)
    }

    window.disableDebugger = () => {
      setActive(false)
    }
  }, [])

  if (active) {
    return (
      <div className="debugger">
        DEBUGGER
      </div>
    )
  }

  return null
}

export default DebugOverlay
