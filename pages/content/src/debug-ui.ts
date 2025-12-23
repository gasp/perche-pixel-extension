import { eventBus } from '@extension/shared'
import type { ContentEventMap, ContentEventType } from '@extension/shared'

/**
 * Creates a debug UI panel for triggering events
 * This is a floating panel that allows developers to manually trigger
 * events for testing and debugging purposes
 */

interface DebugAction<T extends ContentEventType = ContentEventType> {
  label: string
  event: T
  payload: () => ContentEventMap[T]
  description?: string
}

const createDebugPanel = (): HTMLDivElement => {
  const panel = document.createElement('div')
  panel.id = 'perche-debug-panel'

  // Styles for the panel
  panel.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 50;
    background: rgba(30, 30, 30, 0.95);
    border: 1px solid #4ade80;
    border-radius: 4px;
    padding: 6px;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    font-size: 10px;
    color: #e5e5e5;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    min-width: 150px;
    max-width: 180px;
    backdrop-filter: blur(10px);
  `

  return panel
}

const createPanelHeader = (panel: HTMLDivElement): HTMLDivElement => {
  const header = document.createElement('div')
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid #4ade80;
    position: relative;
  `

  const title = document.createElement('div')
  title.textContent = '🐛 Debug'
  title.style.cssText = `
    font-weight: bold;
    color: #4ade80;
    font-size: 10px;
    flex: 1;
    cursor: move;
    user-select: none;
  `

  // Make title draggable
  let isDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0

  title.addEventListener('mousedown', e => {
    isDragging = true
    startX = e.clientX
    startY = e.clientY

    const rect = panel.getBoundingClientRect()
    initialX = rect.left
    initialY = rect.top

    panel.style.transition = 'none'
  })

  document.addEventListener('mousemove', e => {
    if (!isDragging) return

    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    panel.style.left = `${initialX + deltaX}px`
    panel.style.top = `${initialY + deltaY}px`
    panel.style.right = 'auto'
    panel.style.bottom = 'auto'
  })

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false
      panel.style.transition = ''
    }
  })

  const toggleBtn = document.createElement('button')
  toggleBtn.textContent = '-'
  toggleBtn.id = 'perche-debug-toggle-btn'
  toggleBtn.style.cssText = `
    background: none;
    border: none;
    color: #4ade80;
    font-size: 12px;
    cursor: pointer;
    padding: 0;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    flex-shrink: 0;
  `

  toggleBtn.addEventListener('click', () => {
    const content = document.getElementById('perche-debug-content')
    if (content) {
      const isHidden = content.style.display === 'none'
      content.style.display = isHidden ? 'flex' : 'none'
      toggleBtn.textContent = isHidden ? '−' : '+'
    }
  })

  header.appendChild(title)
  header.appendChild(toggleBtn)

  return header
}

const createDebugButton = (action: DebugAction): HTMLButtonElement => {
  const button = document.createElement('button')
  button.textContent = action.label
  button.title = action.description || `Trigger ${action.event}`
  button.style.cssText = `
    background: linear-gradient(135deg, #4ade80 0%, #3b9f6e 100%);
    border: none;
    border-radius: 2px;
    color: #1a1a1a;
    padding: 4px 6px;
    margin-bottom: 3px;
    cursor: pointer;
    font-size: 9px;
    font-weight: 600;
    width: 100%;
    text-align: left;
    transition: all 0.2s;
    font-family: inherit;
  `

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateX(2px)'
    button.style.boxShadow = '0 2px 8px rgba(74, 222, 128, 0.3)'
  })

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateX(0)'
    button.style.boxShadow = 'none'
  })

  button.addEventListener('click', () => {
    try {
      const payload = action.payload()
      eventBus.dispatch(action.event, payload)

      // Visual feedback
      button.style.background =
        'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
      setTimeout(() => {
        button.style.background =
          'linear-gradient(135deg, #4ade80 0%, #3b9f6e 100%)'
      }, 200)

      console.log(`[Debug UI] Triggered: ${action.event}`, payload)
    } catch (error) {
      console.error(`[Debug UI] Error triggering ${action.event}:`, error)
      button.style.background =
        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      setTimeout(() => {
        button.style.background =
          'linear-gradient(135deg, #4ade80 0%, #3b9f6e 100%)'
      }, 300)
    }
  })

  return button
}

/**
 * Debug actions available in the UI
 */
const debugActions: DebugAction[] = [
  {
    label: '📝 Open Editor',
    event: 'editor:open',
    payload: () => ({
      source: 'debug-ui',
      timestamp: Date.now(),
    }),
    description: 'Trigger editor open event',
  },
  {
    label: '❌ Close Editor',
    event: 'editor:close',
    payload: () => ({
      source: 'debug-ui',
      timestamp: Date.now(),
    }),
    description: 'Trigger editor close event',
  },
  {
    label: '🎨 Paint Click',
    event: 'paint:click',
    payload: () => ({
      coordinates: { x: 100, y: 100 },
      timestamp: Date.now(),
    }),
    description: 'Simulate paint button click',
  },
  {
    label: '🔍 Pixel Marker',
    event: 'pixeldata:marker',
    payload: () => ({
      tX: 0,
      tY: 0,
      pX: 50,
      pY: 50,
      s: 1,
      value: { color: '#ff0000' },
    }),
    description: 'Send test pixel data marker',
  },
  {
    label: '📊 Grid Data (3px)',
    event: 'editor:grid:data',
    payload: () => ({
      pixels: [
        { x: 0, y: 0, color: 'rgb(0, 0, 0)' }, // black 1
        { x: 1, y: 0, color: 'rgb(246, 170, 9)' }, // gold 9
        { x: 2, y: 0, color: 'rgb(255,127,39)' }, // orange 8
      ],
    }),
    description: 'Send test pixel grid data',
  },
  {
    label: '🌐 Test Fetch',
    event: 'fetch:intercepted',
    payload: () => ({
      url: 'https://backend.wplace.live/s0/pixel/0/0?x=50&y=50',
      contentType: 'image/png',
      data: null,
      method: 'GET',
      status: 200,
      statusText: 'OK',
    }),
    description: 'Simulate fetch intercept',
  },
]

/**
 * Initialize the debug UI
 * @returns Cleanup function to remove the debug panel
 */
export const initDebugUI = (): (() => void) => {
  console.log('🐛 [Debug UI] Initializing debug panel')

  // Check if panel already exists
  const existing = document.getElementById('perche-debug-panel')
  if (existing) {
    console.log('🐛 [Debug UI] Panel already exists')
    return () => existing.remove()
  }

  // Create panel
  const panel = createDebugPanel()
  const header = createPanelHeader(panel)

  const content = document.createElement('div')
  content.id = 'perche-debug-content'
  content.style.cssText = `
    display: none;
    flex-direction: column;
  `

  // Add all debug buttons
  debugActions.forEach(action => {
    const button = createDebugButton(action)
    content.appendChild(button)
  })

  // Assemble panel
  panel.appendChild(header)
  panel.appendChild(content)

  // Add to page
  document.body.appendChild(panel)

  console.log('🐛 [Debug UI] Panel created successfully')

  // Return cleanup function
  return () => {
    panel.remove()
    console.log('🐛 [Debug UI] Panel removed')
  }
}
