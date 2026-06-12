import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Clients from './pages/clients/Clients'
import ClientDetail from './pages/clients/ClientDetail'
import Properties from './pages/properties/Properties'
import PropertyDetail from './pages/properties/PropertyDetail'
import Leads from './pages/leads/Leads'
import AdminPanel from './pages/admin/AdminPanel'
import Profile from './pages/profile/Profile'
import './styles/global.css'
import ClientApp from './pages/app/ClientApp'

function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { token, agent } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (agent?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const { token } = useAuthStore()
  return token ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: 'Onest, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { iconTheme: { primary: '#c62828', secondary: '#fff' } },
        }}
      />

      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetail />} />
          <Route path="leads" element={<Leads />} />
          <Route path="profile" element={<Profile />} />

          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="/app/*" element={<ClientApp />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}