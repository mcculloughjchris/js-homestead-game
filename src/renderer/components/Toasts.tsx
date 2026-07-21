import { useEffect, useState } from "react"

interface Toast {
  message: string
  type: "success" | "danger"
}

const Toasts = () => {
  const [ toasts, setToasts ] = useState<Toast[]>([])

  const removeLastToast = () => {
    const newToasts = [...toasts]
    newToasts.pop()

    setToasts(newToasts)
  }

  useEffect(() => {
    const handleToast = (e) => {
      if (e.detail.message) {
        setToasts([
          ...toasts,
          e.detail
        ])
      }

      setTimeout(removeLastToast, 5000)
    }

    window.addEventListener('toast', handleToast)

    return () => {
      window.removeEventListener('toast', handleToast)
    }
  }, [])

  if (toasts.length === undefined) return null

  return (
    <div className="toasts">
      {toasts.map(({ message, type }, index) => {
        return (
          <div
            key={`toast-${index}`}
            className={`toast toast-${type}`}
          >{message}</div>
        )
      })}
    </div>
  )
}

export default Toasts
