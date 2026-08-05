import { useEffect } from "react"

// Tracks the mouse and exposes the offset as CSS custom properties
// (--parallax-x/--parallax-y, in percentage points) on the document root, so
// any background-position using them shifts as the cursor moves. `strength`
// is the max offset (in percentage points) applied at the edge of the screen.
//
// Safe range for `strength`: at `background-size: (100 + overscan)%`, the
// full 0-100% background-position range maps to exactly `overscan`% of the
// container's size in real travel, so 1 percentage-point of position =
// (overscan / 100)% of container size. Max deviation from a formula's base
// position is `0.5 * strength` points - keep base ± that deviation within
// [0, 100] on each axis or you'll reveal a gap at the image's edge. All
// `.screen`/`.title-screen` backgrounds are 125% (overscan = 25%), and a
// centered (50%) base has 50 points of headroom each way, so strength=20
// (±10 points, ~±2.5% of container size) is comfortably inside that.
const useMouseParallax = (strength: number = 20) => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const xRatio = (e.clientX / window.innerWidth) - 0.5 // -0.5 (left) to 0.5 (right)
      const yRatio = (e.clientY / window.innerHeight) - 0.5 // -0.5 (top) to 0.5 (bottom)

      const x = xRatio * strength
      const y = yRatio * strength

      document.documentElement.style.setProperty('--parallax-x', `${x}%`)
      document.documentElement.style.setProperty('--parallax-y', `${y}%`)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [ strength ])
}

export default useMouseParallax
