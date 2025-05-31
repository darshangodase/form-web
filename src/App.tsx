import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/_index'
import Dashboard from './pages/dashboard'
import Builder from './pages/builder'
import Templates from './pages/templates'
import FormView from './pages/form.$formId'
import FormResponse from './pages/response.$formId'
import Login from './pages/auth.login'
import Register from './pages/auth.register'

function App() {
  const location = useLocation()

  // Hide Navbar on /form/:formId route
  const hideNavbarRoutes = [/^\/form\/[^/]+$/]
  const shouldHideNavbar = hideNavbarRoutes.some((pattern) =>
    pattern.test(location.pathname)
  )

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {!shouldHideNavbar && <Navbar />}
        <main className="container mx-auto pt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/form/:formId" element={<FormView />} />
            <Route path="/response/:formId" element={<FormResponse />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
