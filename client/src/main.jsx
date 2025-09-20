import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter as Router } from 'react-router-dom'
import RouteTracker from './components/RouteTracker/RouteTracker.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId='244554571154-ppp0ve2f3v2ufqp4re0mhcqvii799v4q.apps.googleusercontent.com'>
      <Router>
        <RouteTracker />
        <App />
      </Router>
    </GoogleOAuthProvider>
  </StrictMode>,
)
