/**
 * PostMessage API for communication with the parent extension
 */

export type EditorMessageType =
  | 'editor:ready'
  | 'editor:pixel:update'
  | 'editor:save'
  | 'editor:tile:changed'

export type ParentMessageType =
  | 'editor:load:tile'
  | 'editor:set:color'
  | 'editor:set:tool'
  | 'editor:close'

export interface EditorMessage {
  type: EditorMessageType
  payload?: unknown
}

export interface ParentMessage {
  type: ParentMessageType
  payload?: unknown
}

export interface PixelUpdatePayload {
  x: number
  y: number
  color: string
  tileX: number
  tileY: number
}

export interface LoadTilePayload {
  tileUrl: string
}

export interface SetColorPayload {
  color: string
}

export interface SetToolPayload {
  tool: string
}

class PostMessageBridge {
  private editorListeners: Map<
    ParentMessageType,
    Set<(payload: unknown) => void>
  > = new Map()
  private parentListeners: Map<
    EditorMessageType,
    Set<(payload: unknown) => void>
  > = new Map()
  private eventTarget: EventTarget

  constructor() {
    // Use a custom EventTarget for in-process communication
    this.eventTarget =
      typeof document !== 'undefined' ? document : new EventTarget()
  }

  /**
   * Send a message from editor to parent
   */
  send(type: EditorMessageType, payload?: unknown) {
    const message: EditorMessage = { type, payload }
    const event = new CustomEvent('editor:message', { detail: message })
    this.eventTarget.dispatchEvent(event)
  }

  /**
   * Send a message from parent to editor
   */
  sendToEditor(type: ParentMessageType, payload?: unknown) {
    const message: ParentMessage = { type, payload }
    const event = new CustomEvent('parent:message', { detail: message })
    this.eventTarget.dispatchEvent(event)
  }

  /**
   * Listen for messages from parent (called by editor)
   */
  on(type: ParentMessageType, callback: (payload: unknown) => void) {
    if (!this.editorListeners.has(type)) {
      this.editorListeners.set(type, new Set())
    }
    this.editorListeners.get(type)!.add(callback)

    const handleParentMessage = (event: Event) => {
      const customEvent = event as CustomEvent<ParentMessage>
      const message = customEvent.detail
      if (message.type === type) {
        callback(message.payload)
      }
    }

    this.eventTarget.addEventListener('parent:message', handleParentMessage)

    // Return unsubscribe function
    return () => {
      const listeners = this.editorListeners.get(type)
      if (listeners) {
        listeners.delete(callback)
      }
      this.eventTarget.removeEventListener(
        'parent:message',
        handleParentMessage,
      )
    }
  }

  /**
   * Listen for messages from editor (called by parent)
   */
  onEditor(type: EditorMessageType, callback: (payload: unknown) => void) {
    if (!this.parentListeners.has(type)) {
      this.parentListeners.set(type, new Set())
    }
    this.parentListeners.get(type)!.add(callback)

    const handleEditorMessage = (event: Event) => {
      const customEvent = event as CustomEvent<EditorMessage>
      const message = customEvent.detail
      if (message.type === type) {
        callback(message.payload)
      }
    }

    this.eventTarget.addEventListener('editor:message', handleEditorMessage)

    // Return unsubscribe function
    return () => {
      const listeners = this.parentListeners.get(type)
      if (listeners) {
        listeners.delete(callback)
      }
      this.eventTarget.removeEventListener(
        'editor:message',
        handleEditorMessage,
      )
    }
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    this.editorListeners.clear()
    this.parentListeners.clear()
  }
}

// Export a singleton instance
export const postMessageBridge = new PostMessageBridge()
