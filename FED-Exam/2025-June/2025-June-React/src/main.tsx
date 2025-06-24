import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Find the root DOM element where the React app will be mounted
// The exclamation mark asserts that the element exists (will throw if null)
const rootElement = document.getElementById('root')!

// Create a React root using the new concurrent features API
// This enables React 18's concurrent features like automatic batching and suspense
const root = createRoot(rootElement)

// Render the application into the root element
root.render(
  // StrictMode is a wrapper that helps detect problems in development
  // It enables additional checks and warnings for its descendants
  // Does nothing in production builds
  <StrictMode>
    {/* Main application component that contains all routing and providers */}
    <App />
  </StrictMode>,
) 