import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './components/dashboard/DashboardLayout'
import Home from './pages/dashboard/Home'
import Calendar from './pages/dashboard/Calendar'
import Appointments from './pages/dashboard/Appointments'
import Services from './pages/dashboard/Services'
import Staff from './pages/dashboard/Staff'
import Customers from './pages/dashboard/Customers'
import Notifications from './pages/dashboard/Notifications'
import Settings from './pages/dashboard/Settings'
import Analytics from './pages/dashboard/Analytics'
import PublicPage from './pages/PublicPage'
import ConstructorPage from './pages/ConstructorPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/constructor" element={<ConstructorPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="services" element={<Services />} />
          <Route path="staff" element={<Staff />} />
          <Route path="customers" element={<Customers />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        <Route path="/b/:slug" element={<PublicPage />} />
        <Route path="/b/:slug/booking" element={<PublicPage />} />
      </Routes>
    </Router>
  )
}

export default App

