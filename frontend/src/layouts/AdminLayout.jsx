import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BookOpen, Globe, LayoutDashboard, LogOut, MessageSquareQuote, Receipt, Users } from "lucide-react";
import Logo from "../components/ui/Logo";
import { useAuth } from "../hooks/useAuth";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { to: "/admin/guest-orders", label: "Guest orders", icon: Receipt },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin" dir="ltr" lang="en">
      <aside className="sidebar">
        <Logo to="/admin" light />

        <nav className="side-nav" aria-label="Admin">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
              <Icon size={20} /> <span>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/" className="side-link">
            <Globe size={20} /> <span>View website</span>
          </NavLink>
        </nav>

        <div className="side-user">
          <div className="who">
            <span className="avatar">{user?.name?.[0]?.toUpperCase()}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="side-link" onClick={handleLogout}>
            <LogOut size={20} /> <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
