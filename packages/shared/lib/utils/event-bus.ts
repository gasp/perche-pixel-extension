/**
 * Event Bus System for Content Script
 * Provides type-safe event dispatching and listening
 */

/**
 * Define all available events and their payload types
 */
export type ContentEventMap = {
  'editor:open': {
    source: 'ui-hijack'
    timestamp: number
  }
  'editor:open:with-coords': {
    source: string
    timestamp: number
    tile: { x: number; y: number }
    pixel: { x: number; y: number }
  }
  'editor:close': {
    source: string
    timestamp: number
  }
  'editor:grid:data': {
    pixels: Array<{ x: number; y: number; color: string }>
  }
  'editor:save:success': {
    pixelCount: number
    timestamp: number
  }
  'editor:save:error': {
    error: string
    timestamp: number
  }
  'paint:click': {
    coordinates?: { x: number; y: number }
    timestamp: number
  }
  'pixeldata:marker': {
    tX: number
    tY: number
    pX: number
    pY: number
    s: number
    value: unknown
  }
  'pixeldata:clear-marker': Record<string, never>
  'pixeldata:add': {
    key: string
    value: unknown
  }
  'fetch:intercepted': {
    url: string
    contentType: string
    data: unknown
    method: string
    status: number
    statusText: string
  }
}

export type ContentEventType = keyof ContentEventMap

/**
 * Generic event class for type safety
 */
class ContentEvent<T extends ContentEventType> extends CustomEvent<
  ContentEventMap[T]
> {
  constructor(type: T, detail: ContentEventMap[T]) {
    super(type, { detail, bubbles: true, cancelable: true })
  }
}

/**
 * Event Bus class for managing events
 */
class EventBus {
  private target: EventTarget

  constructor() {
    // Use document as the event target (only in browser environment)
    this.target = typeof document !== 'undefined' ? document : new EventTarget()
  }

  /**
   * Dispatch an event
   */
  dispatch<T extends ContentEventType>(
    type: T,
    detail: ContentEventMap[T],
  ): void {
    const event = new ContentEvent(type, detail)
    this.target.dispatchEvent(event)
    console.log(`[EventBus] Dispatched: ${type}`, detail)
  }

  /**
   * Listen to an event
   */
  on<T extends ContentEventType>(
    type: T,
    callback: (event: CustomEvent<ContentEventMap[T]>) => void,
  ): () => void {
    const listener = callback as EventListener
    this.target.addEventListener(type, listener)

    // Return unsubscribe function
    return () => {
      this.target.removeEventListener(type, listener)
    }
  }

  /**
   * Listen to an event once
   */
  once<T extends ContentEventType>(
    type: T,
    callback: (event: CustomEvent<ContentEventMap[T]>) => void,
  ): void {
    const listener = (event: Event) => {
      callback(event as CustomEvent<ContentEventMap[T]>)
      this.target.removeEventListener(type, listener)
    }
    this.target.addEventListener(type, listener)
  }

  /**
   * Remove all listeners for a specific event type
   */
  off<T extends ContentEventType>(type: T): void {
    // Note: This doesn't actually remove listeners in standard DOM
    // You need to keep references to remove specific listeners
    console.warn(
      `[EventBus] off() called for ${type}, but requires listener reference`,
    )
  }
}

// Export singleton instance
export const eventBus = new EventBus()
