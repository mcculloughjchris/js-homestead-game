interface InspectionStatusProps {
  game: any
}

/**
 * Purely presentational - all inspection state/decisions live in
 * InspectionManager (main process). This just renders game.inspection,
 * same as any other piece of game state.
 */
const InspectionStatus = ({ game }: InspectionStatusProps) => {
  const inspection = game.inspection

  if (!inspection?.active) return null

  return (
    <div className="inspection-status">
      <p className="inspection-status-message">{inspection.statusMessage}</p>
      <p className="inspection-status-hint">You can't move while this is happening.</p>
    </div>
  )
}

export default InspectionStatus
