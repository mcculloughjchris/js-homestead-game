import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Introduction = () => {
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => {
      navigate("/title-screen", { replace: true })
    }, 1000)
  }, [])

  return (
    <div>Intro goes here</div>
  )
}

export default Introduction
