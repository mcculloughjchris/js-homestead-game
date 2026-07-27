const Calendar = ({ game }) => {
  return (
    <div className="calendar">
      <div className="calendar-meta">
        <h3>Spring</h3>
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
      {Array.from({ length: 4 }, (_, weekIndex) => {
        return (
          <div className="week">
            {Array.from({ length: 7 }, (_, dayIndex) => {
              return (
                <div className="day"></div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default Calendar
