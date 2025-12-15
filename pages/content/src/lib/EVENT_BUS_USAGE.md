# Event Bus Usage Guide

The Event Bus provides a type-safe way to communicate between different parts of the content script.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  UI Hijack  │────────▶│  Event Bus   │────────▶│  Main/Index │
│             │ dispatch│              │ listen  │             │
└─────────────┘         └──────────────┘         └─────────────┘
```

## Basic Usage

### 1. Dispatching Events

From any part of your code (e.g., hijacks, utilities):

```typescript
import { eventBus } from '@src/lib/event-bus'

// Dispatch an event with payload
eventBus.dispatch('editor:open', {
  source: 'ui-hijack',
  timestamp: Date.now(),
})
```

### 2. Listening to Events

In your main entry point or any component:

```typescript
import { eventBus } from '@src/lib/event-bus'

// Listen to an event
const unsubscribe = eventBus.on('editor:open', (event) => {
  console.log('Editor opened:', event.detail)
  // Handle the event...
})

// Clean up when needed
unsubscribe()
```

### 3. One-time Listeners

```typescript
// Listen to an event only once
eventBus.once('editor:close', (event) => {
  console.log('Editor closed:', event.detail)
})
```

## Adding New Events

To add a new event type:

1. Open `src/lib/event-bus.ts`
2. Add your event to the `ContentEventMap` interface:

```typescript
export interface ContentEventMap {
  'editor:open': {
    source: 'ui-hijack'
    timestamp: number
  }
  // Add your new event here
  'my-feature:action': {
    someData: string
    timestamp: number
  }
}
```

3. Use it anywhere in your code with full type safety:

```typescript
// Dispatch
eventBus.dispatch('my-feature:action', {
  someData: 'hello',
  timestamp: Date.now(),
})

// Listen
eventBus.on('my-feature:action', (event) => {
  console.log(event.detail.someData) // TypeScript knows this is a string!
})
```

## Best Practices

1. **Event Naming**: Use the format `feature:action` (e.g., `editor:open`, `paint:click`)
2. **Always Include Timestamp**: Include a timestamp in your event payload for debugging
3. **Source Tracking**: Include a `source` field to track where events come from
4. **Clean Up**: Always call the unsubscribe function when components are destroyed
5. **Logging**: Events are automatically logged by the event bus for debugging

## Example: Complete Flow

```typescript
// In a hijack file (e.g., ui-hijack.ts)
button.addEventListener('click', () => {
  eventBus.dispatch('editor:open', {
    source: 'ui-hijack',
    timestamp: Date.now(),
  })
})

// In main entry point (e.g., wplace/index.ts)
const setupEventListeners = () => {
  eventBus.on('editor:open', (event) => {
    console.log('Opening editor from:', event.detail.source)
    // Open the editor...
  })
}
```

## Advantages

- ✅ **Type Safety**: TypeScript ensures you use correct event names and payloads
- ✅ **Decoupling**: Components don't need to know about each other
- ✅ **Debugging**: All events are logged automatically
- ✅ **Maintainability**: Easy to see all available events in one place
- ✅ **Testability**: Events can be easily mocked and tested

