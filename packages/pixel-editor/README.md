# @extension/pixel-editor

Pixel art drawing editor for the Perche Pixel Chrome Extension.

## Features

- **Drawing Tools**: Brush, eraser, paint bucket
- **Brush Sizes**: Multiple brush sizes for precision
- **Color Palette**: Full color picker and palette system
- **Stamps**: Pre-defined pixel art stamps (trees, hay, etc.)
- **Textures**: Apply textures to your pixel art
- **Tiles**: Navigate and edit different tiles
- **Viewport Controls**: Pan and zoom canvas

## Development

### Standalone Mode

Run the editor as a standalone web app:

```bash
pnpm --filter @extension/pixel-editor dev
```

The editor will be available at `http://localhost:5173`

### Build

Build the editor for production:

```bash
pnpm --filter @extension/pixel-editor build
```

### Integration with Extension

The editor is designed to be embedded in the Chrome extension via iframe and communicate through postMessage API.

## PostMessage API

The editor communicates with the parent extension using the postMessage API:

### Events from Editor

- `editor:ready` - Editor has loaded and is ready
- `editor:pixel:update` - Pixel was updated
- `editor:save` - User requested to save changes

### Events to Editor

- `editor:load:tile` - Load a specific tile
- `editor:set:color` - Set the active color
- `editor:set:tool` - Set the active tool

## Tech Stack

- React 19
- TypeScript
- Vite
- Zustand (state management)
- Tailwind CSS 4
- Lucide React (icons)
