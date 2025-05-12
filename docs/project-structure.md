# Roam-Sepulture Project Analysis

## System Architecture

This is a dual-platform application:
- Web application built with Vite and React
- Desktop application using Electron

The architecture follows a client-server model with:
- Frontend: React with TypeScript
- Database: Supabase
- Desktop wrapper: Electron

## Project Structure

```plain text
roam-sepulture/
├── src/
│   ├── components/
│   │   ├── nodes/
│   │   │   ├── Node.tsx          # Individual node component
│   │   │   └── NodeTree.tsx      # Tree of nodes component
│   │   └── ui/
│   │       └── LanguageToggle.tsx # Language switching component
│   ├── lib/
│   │   ├── hooks/
│   │   │   └── useLanguage.ts    # Language context hook
│   │   └── supabase/
│   │       ├── client.ts         # Supabase client configuration
│   │       └── database.ts       # Database helper functions
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Entry point for React app
│   └── index.css                 # Base CSS styles
├── electron/
│   └── main.js                   # Electron main process
├── public/                       # Static files
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Project configuration and dependencies
```

## Key Components
### Node System
Node.tsx: Individual node with editing, expansion, and child management
NodeTree.tsx: Root node listing and management
### UI Elements
LanguageToggle.tsx: Supports English/Chinese language switching

## Data Models
### Node

```typescript
interface NodeType {
  id: string;            // Unique identifier
  content: string;       // English content
  content_zh?: string;   // Chinese content
  parent_id: string | null; // Parent node ID or null for root nodes
  position: number;      // Order position among siblings
  is_expanded: boolean;  // Whether children are displayed
  has_markdown?: boolean; // Indicates markdown support
  link_count?: number;   // Number of links to/from this node
}
```

## Database Operations
- Root node retrieval
- Child node fetching
- Node content updating
- Node hierarchy management (indentation)

## Technology Stack
### Frontend
- React with TypeScript
- Vite as build tool
- TailwindCSS for styling

### Backend
- Supabase for database/backend services

### Desktop Application
- Electron for cross-platform desktop support

## Development Features
- Dual language support (English/Chinese)
- Real-time editing with database persistence
- Hierarchical data structure
- Electron desktop wrapper

## Build & Development Scripts
- `npm run dev`: Run Vite development server
- `npm run electron`: Run Electron app
- `npm run electron:dev`: Run both Vite and Electron in development mode
- `npm run build`: Build production-ready application

## Dependencies
- React for UI
- Supabase for backend/database
- Electron for desktop application
- Vite for fast development and building
- TailwindCSS for styling

## Technical Decisions & Changes
We've moved away from Next.js due to compatibility issues with Electron and shifted to a Vite-based setup which offers:
- Faster development experience with HMR
- Simpler configuration
- Better integration with Electron
- More straightforward build process

## Future Considerations
1. **Offline Support**: Implement local storage sync with Supabase for offline capability
2. **Performance Optimization**: Virtualize the node tree for handling large datasets
3. **Markdown Editor**: Enhance the editor with full markdown support
4. **Graph Visualization**: Add a visual graph view of connected nodes
5. **Search Functionality**: Implement full-text search across nodes
6. **Mobile Support**: Consider a React Native version for mobile platforms
7. **Electron Updates**: Implement auto-update functionality for the desktop app
8. **Security**: Add authentication and permission systems
9. **Collaboration**: Real-time collaboration features between multiple users
10. **Data Export/Import**: Support for importing from and exporting to various formats
