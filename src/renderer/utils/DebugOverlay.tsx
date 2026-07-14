import { useEffect } from "react"

const DebugOverlay = () => {
  useEffect(() => {
    window['enableDebugger'] = () => {
      console.log('debuggin')
    }
  }, [])

  return (
    <p>test</p>
  )
}

export default DebugOverlay
