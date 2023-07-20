import './global.css'
import '@vscode/codicons/dist/codicon.css'
import * as React from 'react'
import Editor from './components/editor'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('app')!).render(<Editor />)
