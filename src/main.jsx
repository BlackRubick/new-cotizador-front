import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

// set global background using the medical palette class
if (typeof document !== 'undefined') {
  document.body.classList.add('bg-med-bg')
}

createRoot(document.getElementById('root')).render(
  <App />
)
