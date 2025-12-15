import { eventBus } from '@src/lib/event-bus'

/**
 * Check if the element is the modal container
 */
const isModalContainer = (element: HTMLElement): boolean =>
  element.classList.contains('absolute') &&
  element.classList.contains('bottom-0') &&
  element.classList.contains('left-0') &&
  element.classList.contains('z-50') &&
  element.classList.contains('w-full')

/**
 * Find the Paint button in the modal
 */
const findPaintButton = (container: HTMLElement): HTMLElement | null => {
  // Find all buttons in the modal
  const buttons = container.querySelectorAll('button')

  for (const button of Array.from(buttons)) {
    // Look for button containing "Paint" text and paint icon
    const hasText = button.textContent?.trim().includes('Paint')
    const hasPaintIcon = button.querySelector('svg path[d*="M240-120"]')

    if (hasText && hasPaintIcon) {
      return button
    }
  }

  return null
}

/**
 * Create the Editor button with matching styles
 */
const createEditorButton = (isLarge: boolean): HTMLButtonElement => {
  const button = document.createElement('button')
  button.className = `btn btn-primary btn-soft ${isLarge ? 'btn-lg ml-2' : ''}`
  button.setAttribute('data-editor-btn', 'true')

  // Add SVG icon (using a pencil/edit icon)
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="size-4.5">
      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
    </svg>
    Editor
  `

  // Add click handler
  button.addEventListener('click', () => {
    console.log('[CEB] Editor button clicked')
    // Dispatch event to be handled by main application
    eventBus.dispatch('editor:open', {
      source: 'ui-hijack',
      timestamp: Date.now(),
    })
  })

  return button
}

/**
 * Add the Editor button next to the Paint button
 */
const addEditorButton = (modalContainer: HTMLElement): void => {
  // Find the Paint button
  const paintButton = findPaintButton(modalContainer)
  if (!paintButton) {
    console.warn('[CEB] Paint button not found in modal')
    return
  }

  // Check if Editor button already exists
  const existingEditorButton = modalContainer.querySelector(
    'button[data-editor-btn]',
  )
  if (existingEditorButton) {
    console.log('[CEB] Editor button already exists')
    return
  }

  const isLarge = !!modalContainer.querySelector('#color-1')
  // Create the Editor button
  const editorButton = createEditorButton(isLarge)

  // Insert the button after the Paint button
  paintButton.parentElement?.insertBefore(editorButton, paintButton.nextSibling)

  console.log('[CEB] Editor button added successfully')
}

/**
 * Hijacks the UI by detecting when the pixel info modal is opened
 * and adds an "Editor" button next to the existing "Paint" button
 *
 * @returns A cleanup function to stop observing
 */
export const uiHijack = (): (() => void) => {
  console.log('🎯 hijacking ui')
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      // Check added nodes
      for (const node of Array.from(mutation.addedNodes)) {
        if (!(node instanceof HTMLElement)) continue

        // Check if this is the modal container
        if (isModalContainer(node)) {
          console.log('[CEB] Modal detected, adding Editor button')
          addEditorButton(node)
        }

        // Also check children in case modal is nested
        const modal = node.querySelector?.(
          '.absolute.bottom-0.left-0.z-50.w-full',
        )
        if (modal instanceof HTMLElement) {
          console.log('[CEB] Modal detected (nested), adding Editor button')
          addEditorButton(modal)
        }
      }
    }
  })

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  console.log('[CEB] UI hijack initialized')

  // Return cleanup function
  return () => {
    observer.disconnect()
    console.log('[CEB] UI hijack disconnected')
  }
}
