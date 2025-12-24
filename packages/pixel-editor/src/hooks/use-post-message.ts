import { useEffect, useCallback } from 'react'
import { postMessageBridge } from '@/utils/post-message'
import type { EditorMessageType, ParentMessageType } from '@/utils/post-message'

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
    (type: ParentMessageType, callback: (payload: unknown) => void) =>
      postMessageBridge.on(type, callback),
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
