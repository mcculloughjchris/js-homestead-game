import { useEffect } from "react"

const useSaving = (data: any) => {
  useEffect(() => {
    window.electron.ipcRenderer.invoke('save-game', data)
  }, [])
}

export default useSaving
