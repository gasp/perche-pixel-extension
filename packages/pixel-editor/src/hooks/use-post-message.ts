import { useEffect, useCallback } from 'react'
import {
  postMessageBridge,
  type ParentMessageType,
  type EditorMessageType,
} from '@/utils/post-message'

/**
 * Hook for postMessage communication with parent window
 */
export function usePostMessage() {
  // Send message to parent
  const sendMessage = useCallback(
    (type: EditorMessageType, payload?: unknown) => {
      postMessageBridge.send(type, payload)
    },
    [],
  )

  // Listen for messages from parent
  const onMessage = useCallback(
    (type: ParentMessageType, callback: (payload: unknown) => void) => {
      return postMessageBridge.on(type, callback)
    },
    [],
  )

  // Notify parent that editor is ready
  useEffect(() => {
    sendMessage('editor:ready')
  }, [sendMessage])

  return {
    sendMessage,
    onMessage,
  }
}
