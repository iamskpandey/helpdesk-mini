import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useNavigate,
  Link,
} from 'react-router-dom';

import TicketsListPage from './pages/TicketsListPage';
import NewTicketPage from './pages/NewTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import RegisterPage from './pages/RegisterPage';

function AppLayout() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="app-layout">
      <header className="app-header">
        <Link
          to="/tickets"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h2>HelpDesk Mini</h2>
        </Link>
        {isAuthenticated && (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}
      </header>
      <main className="app-main-content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/tickets" element={<TicketsListPage />} />
            <Route path="/tickets/new" element={<NewTicketPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/" element={<TicketsListPage />} />
          </Route>
        </Route>

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
