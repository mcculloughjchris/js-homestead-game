const SEASONS = ["Spring", "Summer", "Fall", "Winter"]
const WEEKS_PER_SEASON = 4
const DAYS_PER_WEEK = 7
const DAYS_PER_SEASON = WEEKS_PER_SEASON * DAYS_PER_WEEK

const Calendar = ({ game }) => {
  const dayNumber = game.days.length - 1 // 0-indexed count of days elapsed since the game started
  const dayOfSeason = dayNumber % DAYS_PER_SEASON
  const seasonIndex = Math.floor(dayNumber / DAYS_PER_SEASON) % SEASONS.length
  const currentSeason = SEASONS[seasonIndex]

  return (
    <div className="calendar">
      <div className="calendar-meta">
        <h3>{currentSeason}</h3>
      </div>
      <div className="week week-days">
        <div className="day">M</div>
        <div className="day">T</div>
        <div className="day">W</div>
        <div className="day">TH</div>
        <div className="day">F</div>
        <div className="day">S</div>
        <div className="day">SU</div>
      </div>
      {Array.from({ length: WEEKS_PER_SEASON }, (_, weekIndex) => {
        return (
          <div className="week" key={`week-${weekIndex}`}>
            {Array.from({ length: DAYS_PER_WEEK }, (_, dayIndex) => {
              const cellDay = weekIndex * DAYS_PER_WEEK + dayIndex
              const isPast = cellDay < dayOfSeason
              const isCurrent = cellDay === dayOfSeason

              return (
                <div
                  className={`day${isCurrent ? " day-current" : ""}`}
                  key={`day-${cellDay}`}
                >
                  {isPast ? "X" : null}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default Calendar
