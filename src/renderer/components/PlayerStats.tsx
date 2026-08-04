interface PlayerStatsProps {
  game: any
}

export const STATS = [
  { key: "health", label: "Health" },
  { key: "stamina", label: "Stamina" },
  { key: "hunger", label: "Hunger" },
  { key: "thirst", label: "Thirst" },
  { key: "bathroom", label: "Bathroom" }
]

const PlayerStats = ({ game }: PlayerStatsProps) => {
  return (
    <div className="player-stats">
      {STATS.map(({ key, label }) => {
        const value = Math.max(0, Math.min(100, game[key] ?? 0))

        return (
          <div className="progress-bar" key={key}>
            <div
              className={`progress ${key}`}
              style={{ width: `${value}%` }}
            ></div>
            <div className="progress-label">{label}</div>
          </div>
        )
      })}
    </div>
  )
}

export default PlayerStats
