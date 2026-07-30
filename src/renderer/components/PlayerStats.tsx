const PlayerStats = () => {
  return (
    <div className="player-stats">
      <div className="progress-bar">
        <div className="progress health"></div>
        <div className="progress-label">Health</div>
      </div>
      <div className="progress-bar">
        <div className="progress stamina"></div>
        <div className="progress-label">Stamina</div>
      </div>
      <div className="progress-bar">
        <div className="progress hunger"></div>
        <div className="progress-label">Hunger</div>
      </div>
      <div className="progress-bar">
        <div className="progress thirst"></div>
        <div className="progress-label">Thirst</div>
      </div>
    </div>
  )
}

export default PlayerStats
