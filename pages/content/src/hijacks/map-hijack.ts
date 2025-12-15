declare global {
  interface Window {
    hijackMapPrototypeSetMethod: () => void
  }
}

const TRIGGER_COLOR_IDX = 0
// Matches t=(###,###);p=(###,###);s=#
const KEY_PATTERN =
  /^t=\((\d{1,4}),(\d{1,4})\);p=\((\d{1,4}),(\d{1,4})\);s=(\d)$/

const originalSet = Map.prototype.set

const hijackMapPrototypeSetMethod = () => {
  console.log('🎯 hijacking map prototype set method ')

  Map.prototype.set = function (
    this: Map<unknown, unknown>,
    key: unknown,
    value: unknown,
  ): Map<unknown, unknown> {
    let isTrigger = false

    // console.log('key', key)
    const match = typeof key === 'string' ? key.match(KEY_PATTERN) : null
    if (match) {
      console.log('match', { key, value })
      if ((value as { colorIdx?: number })?.colorIdx === TRIGGER_COLOR_IDX) {
        isTrigger = true
      }
    }

    if (isTrigger && match) {
      // Extract numbers
      const [, tX, tY, pX, pY, s] = match.map(Number)

      console.log('marker', { tX, tY, pX, pY, s })
    }
    // Always insert the original entry
    return originalSet.call(this, key, value)
  }
}

window.hijackMapPrototypeSetMethod = hijackMapPrototypeSetMethod

export { hijackMapPrototypeSetMethod }
