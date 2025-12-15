import { useState, useEffect } from 'react'

interface CanvasDimensions {
  width: number
  height: number
}

export function useCanvasDimensions(): CanvasDimensions {
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return dimensions
}
