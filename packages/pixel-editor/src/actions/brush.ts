// Generate a pixelated circle pattern for a given diameter
// Returns an array of {dx, dy} offsets from the center
export function getCirclePattern(
  diameter: number,
): Array<{ dx: number; dy: number }> {
  const radius = diameter / 2
  const pattern: Array<{ dx: number; dy: number }> = []
  const halfSize = Math.floor(diameter / 2)

  for (let dy = -halfSize; dy <= halfSize; dy++) {
    for (let dx = -halfSize; dx <= halfSize; dx++) {
      // Calculate distance from center
      const distance = Math.sqrt(dx * dx + dy * dy)
      // Include pixel if it's within the radius
      if (distance <= radius) {
        pattern.push({ dx, dy })
      }
    }
  }

  return pattern
}
