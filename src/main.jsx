import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from '@/store/StoreProvider'
import { UIProvider } from '@/components/ui/Feedback/UIProvider'
import './styles/variables.css'
import './styles/global.css'
import './styles/pages.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UIProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </UIProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
