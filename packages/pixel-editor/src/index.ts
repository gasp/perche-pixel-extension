// Main exports for using pixel-editor as a package
export { App as PixelEditor } from './app'
export { postMessageBridge } from './utils/post-message'
export type {
  EditorMessageType,
  ParentMessageType,
  EditorMessage,
  ParentMessage,
  PixelUpdatePayload,
  LoadTilePayload,
  SetColorPayload,
  SetToolPayload,
} from './utils/post-message'

// Import styles
import './style.css'
