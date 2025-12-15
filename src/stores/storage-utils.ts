import type { PixelColor } from '@/types'

/**
 * Custom reviver for JSON.parse to handle special types:
 * - Map instances (used in pixel-store)
 * - BigInt values (for future optimizations)
 */
export function storageReviver(_key: string, value: unknown): unknown {
  // Handle Map serialization
  if (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'value' in value &&
    (value as { type: string; value: unknown }).type === 'map'
  ) {
    return new Map(
      (value as { type: string; value: [string, PixelColor][] }).value,
    )
  }

  // Handle bigint serialization
  if (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'value' in value &&
    (value as { type: string; value: string }).type === 'bigint'
  ) {
    return BigInt((value as { type: string; value: string }).value)
  }

  return value
}

/**
 * Custom replacer for JSON.stringify to handle special types:
 * - Map instances (used in pixel-store)
 * - BigInt values (for future optimizations)
 */
export function storageReplacer(_key: string, value: unknown): unknown {
  // Handle Map serialization
  if (value instanceof Map) {
    return { type: 'map', value: Array.from(value.entries()) }
  }

  // Handle bigint serialization
  if (typeof value === 'bigint') {
    return { type: 'bigint', value: value.toString() }
  }

  return value
}
