import { NavLink, Link } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/documents', icon: '📄', label: 'Documents' },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-logo">
        <div className="circle-logo-sidebar"></div>
        <span className="logo-text">StudyAI</span>
      </Link>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Navigation</p>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          <p className="sidebar-version">AI Study Assistant v1.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
