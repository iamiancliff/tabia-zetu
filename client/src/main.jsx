import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext.jsx"
import { Toaster } from "./components/ui/sonner.jsx"
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </BrowserRouter>
)
