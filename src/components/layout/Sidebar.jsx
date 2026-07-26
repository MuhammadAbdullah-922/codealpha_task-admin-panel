import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdInventory2, MdShoppingBag, MdPeople,
  MdAssessment, MdLocalOffer, MdLogout, MdMenu, MdClose, MdStorage, MdCategory, MdEmail,
  MdSettings, MdKeyboardArrowDown,
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MdCollections } from "react-icons/md";

const navItems = [
  { to: '/', icon: <MdDashboard />, label: 'Dashboard', end: true },
  { to: '/products', icon: <MdInventory2 />, label: 'Products' },
   { to: "/categories", icon: <MdCategory />, label: "Categories" },
  { to: '/orders', icon: <MdShoppingBag />, label: 'Orders' },
  { to: '/customers', icon: <MdPeople />, label: 'Customers' },
  { to: '/inventory', icon: <MdStorage />, label: 'Inventory' },
  { to: '/reports', icon: <MdAssessment />, label: 'Reports' },
   { to: "/messages", icon: <MdEmail />, label: "Messages" },
  { to: '/coupons', icon: <MdLocalOffer />, label: 'Coupons' },
  { to: '/newsletter', icon: '📧', label: 'Newsletter' },
  {
  label: "Footer Gallery",
  to: "/footer-gallery",
  icon: <MdCollections />
}
];

export default function Sidebar({ open, setOpen }) {
  return (
    <>
      <div className={`bz-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`bz-sidebar ${open ? 'open' : ''}`}>
        <div className="bz-sidebar-logo">
          <div className="bz-logo-mark">B</div>
          <div>
            <div className="bz-logo-text">BZACK</div>
            <div className="bz-logo-sub">Admin Panel</div>
          </div>
          <button className="bz-burger ms-auto text-white" onClick={() => setOpen(false)} style={{ display: open ? 'block' : undefined }}>
            <MdClose />
          </button>
        </div>

        <nav className="bz-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `bz-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export function Topbar({ title, subtitle, onMenuClick, action }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  return (
    <div className="bz-topbar">
      <div className="d-flex align-items-center gap-2">
        <button className="bz-burger" onClick={onMenuClick}>
          <MdMenu />
        </button>
        <div>
          <h1 className="bz-topbar-title">{title}</h1>
          {subtitle && <p className="bz-topbar-sub">{subtitle}</p>}
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {action}

        <div className="bz-topbar-profile" ref={ref}>
          <button
            type="button"
            className="bz-topbar-profile-trigger"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <div className="bz-avatar bz-avatar--sm">
              {user?.avatar_url ? <img src={user.avatar_url} alt={user?.name || 'Admin'} /> : initials}
            </div>
            <span className="bz-topbar-profile-name d-none d-md-inline">{user?.name || 'Admin'}</span>
            <MdKeyboardArrowDown className={`bz-profile-chevron ${open ? 'is-open' : ''}`} />
          </button>

          {open && (
            <div className="bz-profile-menu bz-profile-menu--topbar">
              <button
                type="button"
                className="bz-profile-menu-item"
                onClick={() => { setOpen(false); navigate('/settings'); }}
              >
                <MdSettings /> Settings
              </button>
              <div className="bz-profile-menu-divider" />
              <button
                type="button"
                className="bz-profile-menu-item bz-profile-menu-item--danger"
                onClick={handleLogout}
              >
                <MdLogout /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}