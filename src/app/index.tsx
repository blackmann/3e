import { createRoot } from 'react-dom/client'
import * as React from 'react'
import Editor from './components/editor'
import './global.css'

createRoot(document.getElementById('app')!).render(<Editor />)
